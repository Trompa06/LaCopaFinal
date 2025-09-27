-- ===========================
-- Ranking Global
-- ===========================
-- A partir de ahora, el ranking se consultará desde esta tabla
INSERT INTO ranking_global (id_usuario, total_unidades) VALUES
(1, 2.0);
-- ===========================
-- La Copa Final - Sample Data
-- ===========================

USE LaCopaFinal;

-- ===========================
-- Sample Users
-- ===========================
INSERT INTO usuarios (nombre, password) VALUES 
-- Password is "password123" hashed with bcrypt
('Carlos', '$2a$10$8X9bU2x4U2U4U2U4U2U4U.BvS8X9bU2x4U2U4U2U4U2U4U');

-- ===========================
-- Sample Party (Finished)
-- ===========================
INSERT INTO fiestas (nombre, codigo_unico, id_creador, fecha_inicio, fecha_fin, finalizada) VALUES
('Fiesta de Año Nuevo 2024', 'PARTY1', 1, '2024-12-31 20:00:00', '2025-01-01 03:30:00', TRUE);

-- ===========================
-- Sample Participations
-- ===========================
INSERT INTO participaciones (id_usuario, id_fiesta, fecha_union) VALUES
(1, 1, '2024-12-31 20:00:00');

-- ===========================
-- Sample Consumptions (Party 1)
-- ===========================
INSERT INTO consumos (id_usuario, id_fiesta, id_tipo, cantidad, fecha_consumo) VALUES
(1, 1, 1, 2, '2024-12-31 20:30:00');

-- ===========================
-- Sample Historical Data
-- ===========================
INSERT INTO historial_fiestas (id_fiesta, id_usuario, total_unidades) VALUES
(1, 1, 2.0);

-- ===========================
-- Sample 60-minute Rankings
-- ===========================
INSERT INTO rankings_60min (id_usuario, id_fiesta, inicio_periodo, fin_periodo, total_unidades) VALUES
(1, 1, '2024-12-31 20:30:00', '2024-12-31 21:30:00', 2.0);

