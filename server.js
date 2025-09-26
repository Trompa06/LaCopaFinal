const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('web'));

// Load environment variables
require('dotenv').config();

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'LaCopaFinal',
    port: process.env.DB_PORT || 3306
};

let db;

// Initialize database connection
async function initDB() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL database');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}


// Endpoint to get party results
app.get('/api/party/:id_fiesta/results', async (req, res) => {
    try {
        const partyId = req.params.id_fiesta;
        
        // Get party info
        const [partyInfo] = await db.execute(
            'SELECT * FROM fiestas WHERE id_fiesta = ?',
            [partyId]
        );
        
        if (partyInfo.length === 0) {
            return res.status(404).json({ success: false, message: 'Fiesta no encontrada' });
        }
        
        // Get final rankings
        const query = `
            SELECT 
                u.id_usuario,
                u.nombre,
                COALESCE(SUM(c.cantidad), 0) as total_consumido,
                COUNT(c.id_consumo) as num_consumos,
                RANK() OVER (ORDER BY COALESCE(SUM(c.cantidad), 0) DESC) as posicion
            FROM participantes p
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN consumos c ON u.id_usuario = c.id_usuario AND c.id_fiesta = ?
            WHERE p.id_fiesta = ?
            GROUP BY u.id_usuario, u.nombre
            ORDER BY total_consumido DESC
        `;
        
        const [results] = await db.execute(query, [partyId, partyId]);
        
        res.json({ 
            success: true, 
            party: partyInfo[0],
            results: results 
        });
    } catch (error) {
        console.error('Error fetching party results:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Utility functions
function generateUniqueCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// API Routes

// Register user
app.post('/api/register', async (req, res) => {
    try {
        const { nombre, password } = req.body;
        
        if (!nombre || !password) {
            return res.status(400).json({ error: 'Nombre y contraseña son requeridos' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre, password) VALUES (?, ?)',
            [nombre, hashedPassword]
        );

        res.json({ 
            success: true, 
            userId: result.insertId,
            mensaje: 'Usuario registrado exitosamente' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { nombre, password } = req.body;
        
        const [users] = await db.execute(
            'SELECT * FROM usuarios WHERE nombre = ?',
            [nombre]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        res.json({ 
            success: true, 
            userId: user.id_usuario,
            nombre: user.nombre 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Create new party
app.post('/api/party/create', async (req, res) => {
    try {
        const { nombre, id_creador } = req.body;
        
        const codigo_unico = generateUniqueCode();
        
        const [result] = await db.execute(
            'INSERT INTO fiestas (nombre, codigo_unico, id_creador) VALUES (?, ?, ?)',
            [nombre, codigo_unico, id_creador]
        );

        // Add creator to participants
        await db.execute(
            'INSERT INTO participaciones (id_usuario, id_fiesta) VALUES (?, ?)',
            [id_creador, result.insertId]
        );

        res.json({ 
            success: true, 
            id_fiesta: result.insertId,
            codigo_unico: codigo_unico,
            mensaje: 'Fiesta creada exitosamente' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear fiesta' });
    }
});

// Join party
app.post('/api/party/join', async (req, res) => {
    try {
        const { codigo_unico, id_usuario } = req.body;
        
        // Find party
        const [parties] = await db.execute(
            'SELECT * FROM fiestas WHERE codigo_unico = ? AND finalizada = FALSE',
            [codigo_unico]
        );

        if (parties.length === 0) {
            return res.status(404).json({ error: 'Fiesta no encontrada o ya finalizada' });
        }

        const party = parties[0];

        // Check if user already joined
        const [existingParticipation] = await db.execute(
            'SELECT * FROM participaciones WHERE id_usuario = ? AND id_fiesta = ?',
            [id_usuario, party.id_fiesta]
        );

        if (existingParticipation.length > 0) {
            return res.json({ 
                success: true, 
                id_fiesta: party.id_fiesta,
                mensaje: 'Ya estás en esta fiesta' 
            });
        }

        // Add user to party
        await db.execute(
            'INSERT INTO participaciones (id_usuario, id_fiesta) VALUES (?, ?)',
            [id_usuario, party.id_fiesta]
        );

        // Notify other users
        io.to(`party_${party.id_fiesta}`).emit('userJoined', {
            id_usuario,
            message: 'Un nuevo usuario se unió a la fiesta'
        });

        res.json({ 
            success: true, 
            id_fiesta: party.id_fiesta,
            nombre_fiesta: party.nombre,
            mensaje: 'Te has unido a la fiesta exitosamente' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al unirse a la fiesta' });
    }
});

// Add consumption
app.post('/api/consumption/add', async (req, res) => {
    try {
        const { id_usuario, id_fiesta, id_tipo, cantidad = 1 } = req.body;
        
        console.log('Consumption add request:', req.body);
        console.log('Parsed values:', { id_usuario, id_fiesta, id_tipo, cantidad });
        
        // Verify party is active
        const [parties] = await db.execute(
            'SELECT * FROM fiestas WHERE id_fiesta = ? AND finalizada = FALSE',
            [id_fiesta]
        );

        if (parties.length === 0) {
            return res.status(400).json({ error: 'La fiesta no existe o ya finalizó' });
        }

        // Add consumption
        await db.execute(
            'INSERT INTO consumos (id_usuario, id_fiesta, id_tipo, cantidad) VALUES (?, ?, ?, ?)',
            [id_usuario, id_fiesta, id_tipo, cantidad]
        );

        // Update 60-minute ranking
        await updateRanking60Min(id_usuario, id_fiesta);

        // Get updated rankings
        const rankings = await getRankings(id_fiesta);

        // Emit real-time update
        io.to(`party_${id_fiesta}`).emit('rankingUpdate', rankings);

        res.json({ 
            success: true, 
            mensaje: 'Consumo registrado exitosamente',
            rankings 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar consumo' });
    }
});

// Get party rankings
app.get('/api/party/:id_fiesta/rankings', async (req, res) => {
    try {
        const { id_fiesta } = req.params;
        const rankings = await getRankings(id_fiesta);
        res.json(rankings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener rankings' });
    }
});

// Get party participants
app.get('/api/party/:id_fiesta/participants', async (req, res) => {
    try {
        const { id_fiesta } = req.params;
        
        const [participants] = await db.execute(`
            SELECT u.id_usuario, u.nombre, p.fecha_union
            FROM participaciones p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE p.id_fiesta = ?
            ORDER BY p.fecha_union ASC
        `, [id_fiesta]);

        res.json(participants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener participantes' });
    }
});

// Get drink types
app.get('/api/drink-types', async (req, res) => {
    try {
        const [types] = await db.execute('SELECT * FROM tipos_bebida');
        res.json(types);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tipos de bebida' });
    }
});

// Get user's parties
app.get('/api/user/:id_usuario/parties', async (req, res) => {
    try {
        const { id_usuario } = req.params;
        
        const [parties] = await db.execute(`
            SELECT 
                f.id_fiesta,
                f.nombre as nombre_fiesta,
                f.codigo_unico as codigo,
                f.id_creador,
                f.fecha_inicio as fecha_creacion,
                f.fecha_fin,
                f.finalizada,
                u.nombre as nombre_creador,
                p.fecha_union,
                (f.id_creador = ?) as es_creador,
                (SELECT COUNT(*) FROM participaciones WHERE id_fiesta = f.id_fiesta) as num_participantes,
                CASE 
                    WHEN f.finalizada = 1 THEN 'finalizada'
                    ELSE 'activa'
                END as estado
            FROM participaciones p
            JOIN fiestas f ON p.id_fiesta = f.id_fiesta
            JOIN usuarios u ON f.id_creador = u.id_usuario
            WHERE p.id_usuario = ?
            ORDER BY f.fecha_inicio DESC
        `, [id_usuario, id_usuario]);

        res.json({ success: true, parties });
    } catch (error) {
        console.error('Error fetching user parties:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// Get party info including creator
app.get('/api/party/:id_fiesta/info', async (req, res) => {
    try {
        const { id_fiesta } = req.params;
        
        const [parties] = await db.execute(
            'SELECT id_fiesta, nombre, codigo_unico, id_creador, finalizada FROM fiestas WHERE id_fiesta = ?',
            [id_fiesta]
        );

        if (parties.length === 0) {
            return res.status(404).json({ error: 'Fiesta no encontrada' });
        }

        res.json(parties[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener información de la fiesta' });
    }
});

// Get party info by code - specific endpoint for code verification
app.get('/api/party/code/:codigo/info', async (req, res) => {
    try {
        const { codigo } = req.params;
        
        const [parties] = await db.execute(
            `SELECT 
                id_fiesta, 
                nombre as nombre_fiesta, 
                codigo_unico as codigo, 
                id_creador, 
                finalizada,
                fecha_inicio,
                CASE 
                    WHEN finalizada = 1 THEN 'finalizada'
                    ELSE 'activa'
                END as estado
            FROM fiestas 
            WHERE codigo_unico = ?`,
            [codigo]
        );

        if (parties.length === 0) {
            return res.status(404).json({ success: false, message: 'Fiesta no encontrada' });
        }

        res.json({ success: true, party: parties[0] });
    } catch (error) {
        console.error('Error fetching party info by code:', error);
        res.status(500).json({ success: false, message: 'Error del servidor' });
    }
});

// End party
app.post('/api/party/:id_fiesta/end', async (req, res) => {
    try {
        const { id_fiesta } = req.params;
        const { id_usuario } = req.body;
        
        // Verify user is creator
        const [parties] = await db.execute(
            'SELECT * FROM fiestas WHERE id_fiesta = ? AND id_creador = ?',
            [id_fiesta, id_usuario]
        );

        if (parties.length === 0) {
            return res.status(403).json({ error: 'Solo el creador puede finalizar la fiesta' });
        }

        // End party
        await db.execute(
            'UPDATE fiestas SET finalizada = TRUE, fecha_fin = NOW() WHERE id_fiesta = ?',
            [id_fiesta]
        );

        // Save to history
        await saveToHistory(id_fiesta);

        // Notify all users
        io.to(`party_${id_fiesta}`).emit('partyEnded', {
            message: 'La fiesta ha terminado'
        });

        res.json({ 
            success: true, 
            mensaje: 'Fiesta finalizada exitosamente' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al finalizar fiesta' });
    }
});

// Helper functions
async function getRankings(id_fiesta) {
    // General ranking by alcohol units
    const [generalRanking] = await db.execute(`
        SELECT 
            u.id_usuario,
            u.nombre,
            COALESCE(SUM(c.cantidad * t.unidad_alcohol), 0) as total_unidades
        FROM participaciones p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        LEFT JOIN consumos c ON u.id_usuario = c.id_usuario AND c.id_fiesta = ?
        LEFT JOIN tipos_bebida t ON c.id_tipo = t.id_tipo
        WHERE p.id_fiesta = ?
        GROUP BY u.id_usuario, u.nombre
        ORDER BY total_unidades DESC
    `, [id_fiesta, id_fiesta]);

    // Ranking by drink type
    const [drinkTypeRanking] = await db.execute(`
        SELECT 
            u.nombre,
            t.nombre as tipo_bebida,
            COALESCE(SUM(c.cantidad), 0) as cantidad_total
        FROM participaciones p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        LEFT JOIN consumos c ON u.id_usuario = c.id_usuario AND c.id_fiesta = ?
        LEFT JOIN tipos_bebida t ON c.id_tipo = t.id_tipo
        WHERE p.id_fiesta = ?
        GROUP BY u.id_usuario, u.nombre, t.id_tipo, t.nombre
        ORDER BY u.nombre, cantidad_total DESC
    `, [id_fiesta, id_fiesta]);

    // 60-minute ranking
    const [ranking60min] = await db.execute(`
        SELECT 
            u.id_usuario,
            u.nombre,
            MAX(r.total_unidades) as max_60min
        FROM participaciones p
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        LEFT JOIN rankings_60min r ON u.id_usuario = r.id_usuario AND r.id_fiesta = ?
        WHERE p.id_fiesta = ?
        GROUP BY u.id_usuario, u.nombre
        ORDER BY max_60min DESC
    `, [id_fiesta, id_fiesta]);

    return {
        general: generalRanking,
        byDrinkType: drinkTypeRanking,
        ranking60min: ranking60min
    };
}

async function updateRanking60Min(id_usuario, id_fiesta) {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Calculate consumption in last 60 minutes
    const [consumption] = await db.execute(`
        SELECT COALESCE(SUM(c.cantidad * t.unidad_alcohol), 0) as total_unidades
        FROM consumos c
        JOIN tipos_bebida t ON c.id_tipo = t.id_tipo
        WHERE c.id_usuario = ? AND c.id_fiesta = ? 
        AND c.fecha_consumo >= ?
    `, [id_usuario, id_fiesta, hourAgo]);

    if (consumption[0].total_unidades > 0) {
        // Insert or update 60-minute record
        await db.execute(`
            INSERT INTO rankings_60min (id_usuario, id_fiesta, inicio_periodo, fin_periodo, total_unidades)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE total_unidades = VALUES(total_unidades)
        `, [id_usuario, id_fiesta, hourAgo, now, consumption[0].total_unidades]);
    }
}

async function saveToHistory(id_fiesta) {
    const [finalRanking] = await db.execute(`
        SELECT 
            c.id_usuario,
            COALESCE(SUM(c.cantidad * t.unidad_alcohol), 0) as total_unidades
        FROM consumos c
        JOIN tipos_bebida t ON c.id_tipo = t.id_tipo
        WHERE c.id_fiesta = ?
        GROUP BY c.id_usuario
    `, [id_fiesta]);

    for (const user of finalRanking) {
        await db.execute(
            'INSERT INTO historial_fiestas (id_fiesta, id_usuario, total_unidades) VALUES (?, ?, ?)',
            [id_fiesta, user.id_usuario, user.total_unidades]
        );
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    socket.on('joinParty', (id_fiesta) => {
        socket.join(`party_${id_fiesta}`);
        console.log(`👥 User ${socket.id} joined party ${id_fiesta}`);
    });

    socket.on('disconnect', () => {
        console.log('🔌 User disconnected:', socket.id);
    });
});

// Auto-close parties after 24 hours - DISABLED to keep parties active
// setInterval(async () => {
//     try {
//         const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
//         const [oldParties] = await db.execute(
//             'SELECT id_fiesta FROM fiestas WHERE fecha_inicio < ? AND finalizada = FALSE',
//             [oneDayAgo]
//         );

//         for (const party of oldParties) {
//             await db.execute(
//                 'UPDATE fiestas SET finalizada = TRUE, fecha_fin = NOW() WHERE id_fiesta = ?',
//                 [party.id_fiesta]
//             );
            
//             await saveToHistory(party.id_fiesta);
            
//             io.to(`party_${party.id_fiesta}`).emit('partyEnded', {
//                 message: 'La fiesta se cerró automáticamente después de 24 horas'
//             });
//         }

//         if (oldParties.length > 0) {
//             console.log(`🕐 Auto-closed ${oldParties.length} parties after 24 hours`);
//         }
//     } catch (error) {
//         console.error('Error auto-closing parties:', error);
//     }
// }, 60 * 60 * 1000); // Check every hour

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
    await initDB();
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌐 Access the app at: http://localhost:${PORT}`);
    });
}

startServer();