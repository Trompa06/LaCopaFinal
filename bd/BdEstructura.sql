-- ===========================
-- Tabla: ranking_global
-- ===========================
-- Ranking acumulado por usuario (todas las fiestas)
CREATE TABLE ranking_global (
    id_ranking_global INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    total_unidades DECIMAL(5,2) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
-- ===========================
-- Base de datos: LaCopaFinal
-- ===========================

CREATE DATABASE IF NOT EXISTS LaCopaFinal;
USE LaCopaFinal;

-- ===========================
-- Tabla: usuarios
-- ===========================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- Tabla: fiestas
-- ===========================
CREATE TABLE fiestas (
    id_fiesta INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo_unico VARCHAR(10) UNIQUE NOT NULL,
    id_creador INT NOT NULL,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATETIME DEFAULT NULL,
    finalizada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_creador) REFERENCES usuarios(id_usuario)
);

-- ===========================
-- Tabla: participaciones
-- ===========================
-- Relaciona usuarios con fiestas
CREATE TABLE participaciones (
    id_participacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_fiesta INT NOT NULL,
    fecha_union DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_fiesta) REFERENCES fiestas(id_fiesta)
);

-- ===========================
-- Tabla: tipos_bebida
-- ===========================
-- Define los tipos de bebida y sus unidades de alcohol
CREATE TABLE tipos_bebida (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    unidad_alcohol DECIMAL(4,2) NOT NULL -- por bebida
);

-- Predefinir tipos de bebida
INSERT INTO tipos_bebida (nombre, unidad_alcohol) VALUES
('Cerveza', 1.0),
('Cubata', 2.0),
('Cubalitro', 4.0),
('Xupito suave', 0.8),
('Xupito fuerte', 1.5);

-- ===========================
-- Tabla: consumos
-- ===========================
-- Registro de cada bebida consumida por un usuario en una fiesta
CREATE TABLE consumos (
    id_consumo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_fiesta INT NOT NULL,
    id_tipo INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1, -- número de bebidas
    fecha_consumo DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_fiesta) REFERENCES fiestas(id_fiesta),
    FOREIGN KEY (id_tipo) REFERENCES tipos_bebida(id_tipo)
);

-- ===========================
-- Tabla: rankings_60min
-- ===========================
-- Guarda los picos horarios de cada usuario
CREATE TABLE rankings_60min (
    id_ranking INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_fiesta INT NOT NULL,
    inicio_periodo DATETIME NOT NULL,
    fin_periodo DATETIME NOT NULL,
    total_unidades DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_fiesta) REFERENCES fiestas(id_fiesta)
);

-- ===========================
-- Tabla: historial_fiestas
-- ===========================
-- Guarda resultados históricos de fiestas finalizadas
CREATE TABLE historial_fiestas (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_fiesta INT NOT NULL,
    id_usuario INT NOT NULL,
    total_unidades DECIMAL(5,2) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_fiesta) REFERENCES fiestas(id_fiesta),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);