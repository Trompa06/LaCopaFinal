-- ===========================
-- La Copa Final - Sample Data
-- ===========================

USE LaCopaFinal;

-- Clear existing data (optional)
-- DELETE FROM rankings_60min;
-- DELETE FROM historial_fiestas;
-- DELETE FROM consumos;
-- DELETE FROM participaciones;
-- DELETE FROM fiestas;
-- DELETE FROM usuarios;

-- ===========================
-- Sample Users
-- ===========================
INSERT INTO usuarios (nombre, password) VALUES 
-- Password is "password123" hashed with bcrypt
('Carlos', '$2a$10$8X9bU2x4U2U4U2U4U2U4U.BvS8X9bU2x4U2U4U2U4U2U4U'),
('Ana', '$2a$10$8X9bU2x4U2U4U2U4U2U4U.BvS8X9bU2x4U2U4U2U4U2U4U'),
('Miguel', '$2a$10$8X9bU2x4U2U4U2U4U2U4U.BvS8X9bU2x4U2U4U2U4U2U4U'),
('Sofia', '$2a$10$8X9bU2x4U2U4U2U4U2U4U.BvS8X9bU2x4U2U4U2U4U2U4U'),
('Diego', '$2a$10$8X9bU2x4U2U4U2U4U2U4U.BvS8X9bU2x4U2U4U2U4U2U4U'),
('Lucia', '$2a$10$8X9bU2x4U2U4U2U4U2U4U.BvS8X9bU2x4U2U4U2U4U2U4U');

-- ===========================
-- Sample Party (Finished)
-- ===========================
INSERT INTO fiestas (nombre, codigo_unico, id_creador, fecha_inicio, fecha_fin, finalizada) VALUES
('Fiesta de Año Nuevo 2024', 'PARTY1', 1, '2024-12-31 20:00:00', '2025-01-01 03:30:00', TRUE),
('Cumpleaños Ana', 'PARTY2', 2, '2025-01-15 19:00:00', '2025-01-16 02:00:00', TRUE);

-- ===========================
-- Sample Participations
-- ===========================
INSERT INTO participaciones (id_usuario, id_fiesta, fecha_union) VALUES
-- Party 1 participants
(1, 1, '2024-12-31 20:00:00'),  -- Carlos (creator)
(2, 1, '2024-12-31 20:15:00'),  -- Ana
(3, 1, '2024-12-31 20:30:00'),  -- Miguel
(4, 1, '2024-12-31 20:45:00'),  -- Sofia
-- Party 2 participants
(2, 2, '2025-01-15 19:00:00'),  -- Ana (creator)
(1, 2, '2025-01-15 19:30:00'),  -- Carlos
(5, 2, '2025-01-15 19:45:00'),  -- Diego
(6, 2, '2025-01-15 20:00:00');  -- Lucia

-- ===========================
-- Sample Consumptions (Party 1)
-- ===========================
INSERT INTO consumos (id_usuario, id_fiesta, id_tipo, cantidad, fecha_consumo) VALUES
-- Carlos consumptions
(1, 1, 1, 2, '2024-12-31 20:30:00'),  -- 2 Cervezas
(1, 1, 2, 1, '2024-12-31 21:00:00'),  -- 1 Cubata
(1, 1, 1, 1, '2024-12-31 21:30:00'),  -- 1 Cerveza
(1, 1, 5, 2, '2024-12-31 22:00:00'),  -- 2 Xupitos fuertes
(1, 1, 2, 1, '2024-12-31 22:30:00'),  -- 1 Cubata
(1, 1, 1, 1, '2024-12-31 23:00:00'),  -- 1 Cerveza
(1, 1, 5, 1, '2024-12-31 23:30:00'),  -- 1 Xupito fuerte
(1, 1, 1, 2, '2025-01-01 00:30:00'),  -- 2 Cervezas

-- Ana consumptions  
(2, 1, 1, 1, '2024-12-31 20:45:00'),  -- 1 Cerveza
(2, 1, 4, 3, '2024-12-31 21:15:00'),  -- 3 Xupitos suaves
(2, 1, 2, 1, '2024-12-31 21:45:00'),  -- 1 Cubata
(2, 1, 1, 1, '2024-12-31 22:15:00'),  -- 1 Cerveza
(2, 1, 4, 2, '2024-12-31 22:45:00'),  -- 2 Xupitos suaves
(2, 1, 3, 1, '2024-12-31 23:15:00'),  -- 1 Cubalitro
(2, 1, 1, 1, '2024-12-31 23:45:00'),  -- 1 Cerveza
(2, 1, 5, 1, '2025-01-01 00:15:00'),  -- 1 Xupito fuerte

-- Miguel consumptions
(3, 1, 1, 3, '2024-12-31 21:00:00'),  -- 3 Cervezas
(3, 1, 2, 2, '2024-12-31 21:45:00'),  -- 2 Cubatas
(3, 1, 1, 2, '2024-12-31 22:30:00'),  -- 2 Cervezas
(3, 1, 5, 3, '2024-12-31 23:00:00'),  -- 3 Xupitos fuertes
(3, 1, 2, 1, '2024-12-31 23:45:00'),  -- 1 Cubata
(3, 1, 1, 1, '2025-01-01 00:30:00'),  -- 1 Cerveza

-- Sofia consumptions
(4, 1, 1, 1, '2024-12-31 21:15:00'),  -- 1 Cerveza
(4, 1, 4, 2, '2024-12-31 21:45:00'),  -- 2 Xupitos suaves
(4, 1, 1, 2, '2024-12-31 22:30:00'),  -- 2 Cervezas
(4, 1, 2, 1, '2024-12-31 23:15:00'),  -- 1 Cubata
(4, 1, 4, 1, '2024-12-31 23:45:00'),  -- 1 Xupito suave
(4, 1, 1, 1, '2025-01-01 00:15:00');  -- 1 Cerveza

-- ===========================
-- Sample Consumptions (Party 2)
-- ===========================
INSERT INTO consumos (id_usuario, id_fiesta, id_tipo, cantidad, fecha_consumo) VALUES
-- Ana consumptions (Party 2)
(2, 2, 1, 2, '2025-01-15 19:30:00'),  -- 2 Cervezas
(2, 2, 2, 1, '2025-01-15 20:15:00'),  -- 1 Cubata
(2, 2, 4, 2, '2025-01-15 21:00:00'),  -- 2 Xupitos suaves
(2, 2, 3, 1, '2025-01-15 21:45:00'),  -- 1 Cubalitro
(2, 2, 1, 1, '2025-01-15 22:30:00'),  -- 1 Cerveza

-- Carlos consumptions (Party 2)
(1, 2, 1, 1, '2025-01-15 20:00:00'),  -- 1 Cerveza
(1, 2, 2, 2, '2025-01-15 20:45:00'),  -- 2 Cubatas
(1, 2, 5, 1, '2025-01-15 21:30:00'),  -- 1 Xupito fuerte
(1, 2, 1, 2, '2025-01-15 22:15:00'),  -- 2 Cervezas

-- Diego consumptions
(5, 2, 1, 3, '2025-01-15 20:15:00'),  -- 3 Cervezas
(5, 2, 2, 1, '2025-01-15 21:00:00'),  -- 1 Cubata
(5, 2, 1, 1, '2025-01-15 21:45:00'),  -- 1 Cerveza

-- Lucia consumptions
(6, 2, 4, 3, '2025-01-15 20:30:00'),  -- 3 Xupitos suaves
(6, 2, 1, 1, '2025-01-15 21:15:00'),  -- 1 Cerveza
(6, 2, 4, 2, '2025-01-15 22:00:00');  -- 2 Xupitos suaves

-- ===========================
-- Sample Historical Data
-- ===========================
INSERT INTO historial_fiestas (id_fiesta, id_usuario, total_unidades) VALUES
-- Party 1 final results
(1, 1, 13.5),  -- Carlos: 6 cervezas + 2 cubatas + 3 xupitos fuertes = 6*1 + 2*2 + 3*1.5 = 6+4+4.5 = 14.5
(1, 2, 12.4),  -- Ana: 4 cervezas + 1 cubata + 1 cubalitro + 5 xupitos suaves + 1 xupito fuerte = 4*1 + 1*2 + 1*4 + 5*0.8 + 1*1.5 = 4+2+4+4+1.5 = 15.5
(1, 3, 16.5),  -- Miguel: 6 cervezas + 3 cubatas + 3 xupitos fuertes = 6*1 + 3*2 + 3*1.5 = 6+6+4.5 = 16.5
(1, 4, 7.8),   -- Sofia: 5 cervezas + 1 cubata + 3 xupitos suaves = 5*1 + 1*2 + 3*0.8 = 5+2+2.4 = 9.4
-- Party 2 final results
(2, 2, 9.6),   -- Ana: 3 cervezas + 1 cubata + 1 cubalitro + 2 xupitos suaves = 3*1 + 1*2 + 1*4 + 2*0.8 = 3+2+4+1.6 = 10.6
(2, 1, 8.5),   -- Carlos: 3 cervezas + 2 cubatas + 1 xupito fuerte = 3*1 + 2*2 + 1*1.5 = 3+4+1.5 = 8.5
(2, 5, 5.0),   -- Diego: 4 cervezas + 1 cubata = 4*1 + 1*2 = 4+2 = 6
(2, 6, 4.4);   -- Lucia: 1 cerveza + 5 xupitos suaves = 1*1 + 5*0.8 = 1+4 = 5

-- ===========================
-- Sample 60-minute Rankings
-- ===========================
INSERT INTO rankings_60min (id_usuario, id_fiesta, inicio_periodo, fin_periodo, total_unidades) VALUES
-- Party 1 - Best 60-minute periods
(1, 1, '2024-12-31 22:00:00', '2024-12-31 23:00:00', 5.5),  -- Carlos best hour
(2, 1, '2024-12-31 21:15:00', '2024-12-31 22:15:00', 5.6),  -- Ana best hour
(3, 1, '2024-12-31 21:45:00', '2024-12-31 22:45:00', 6.5),  -- Miguel best hour
(4, 1, '2024-12-31 22:30:00', '2024-12-31 23:30:00', 3.8),  -- Sofia best hour
-- Party 2 - Best 60-minute periods
(2, 2, '2025-01-15 20:15:00', '2025-01-15 21:15:00', 6.6),  -- Ana best hour
(1, 2, '2025-01-15 20:45:00', '2025-01-15 21:45:00', 5.5),  -- Carlos best hour
(5, 2, '2025-01-15 20:15:00', '2025-01-15 21:15:00', 5.0),  -- Diego best hour
(6, 2, '2025-01-15 20:30:00', '2025-01-15 21:30:00', 3.4);  -- Lucia best hour

-- Show sample data summary
SELECT 'USERS' as 'TABLE';
SELECT id_usuario, nombre FROM usuarios LIMIT 5;

SELECT 'PARTIES' as 'TABLE';
SELECT id_fiesta, nombre, codigo_unico, finalizada FROM fiestas;

SELECT 'FINAL RANKINGS PARTY 1' as 'TABLE';
SELECT 
    u.nombre,
    h.total_unidades
FROM historial_fiestas h
JOIN usuarios u ON h.id_usuario = u.id_usuario
WHERE h.id_fiesta = 1
ORDER BY h.total_unidades DESC;

SELECT 'FINAL RANKINGS PARTY 2' as 'TABLE';
SELECT 
    u.nombre,
    h.total_unidades
FROM historial_fiestas h
JOIN usuarios u ON h.id_usuario = u.id_usuario
WHERE h.id_fiesta = 2
ORDER BY h.total_unidades DESC;