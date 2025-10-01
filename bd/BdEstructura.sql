-- ===========================
-- Base de datos: LaCopaFinal
-- Estructura completa desde cero
-- ===========================

-- Eliminar base de datos si existe y crearla nueva
DROP DATABASE IF EXISTS LaCopaFinal;
CREATE DATABASE LaCopaFinal;
USE LaCopaFinal;

-- ===========================
-- Tabla: tipos_bebida (debe ir primero)
-- ===========================
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
-- Tabla: usuarios
-- ===========================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed
    email VARCHAR(100) UNIQUE DEFAULT NULL,
    foto_perfil TEXT DEFAULT NULL, -- Base64 o URL de la imagen
    biografia TEXT DEFAULT NULL,
    fecha_nacimiento DATE DEFAULT NULL,
    genero ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir') DEFAULT NULL,
    pais VARCHAR(50) DEFAULT NULL,
    ciudad VARCHAR(50) DEFAULT NULL,
    peso DECIMAL(4,1) DEFAULT NULL, -- Para cálculos de alcohol
    altura INT DEFAULT NULL, -- En centímetros
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    FOREIGN KEY (id_creador) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- ===========================
-- Tabla: participantes
-- ===========================
CREATE TABLE participantes (
    id_participacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_fiesta INT NOT NULL,
    fecha_union DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_fiesta) REFERENCES fiestas(id_fiesta) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_fiesta (id_usuario, id_fiesta)
);

-- ===========================
-- Tabla: consumos
-- ===========================
CREATE TABLE consumos (
    id_consumo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_fiesta INT NOT NULL,
    id_tipo INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1, -- número de bebidas
    fecha_consumo DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_fiesta) REFERENCES fiestas(id_fiesta) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo) REFERENCES tipos_bebida(id_tipo) ON DELETE CASCADE
);

-- ===========================
-- Tabla: rankings_60min
-- ===========================
CREATE TABLE rankings_60min (
    id_ranking INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_fiesta INT NOT NULL,
    inicio_periodo DATETIME NOT NULL,
    fin_periodo DATETIME NOT NULL,
    total_unidades DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_fiesta) REFERENCES fiestas(id_fiesta) ON DELETE CASCADE
);

-- ===========================
-- Tabla: historial_fiestas
-- ===========================
CREATE TABLE historial_fiestas (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_fiesta INT NOT NULL,
    id_usuario INT NOT NULL,
    total_unidades DECIMAL(5,2) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_fiesta) REFERENCES fiestas(id_fiesta) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- ===========================
-- Tabla: bebidas_favoritas
-- ===========================
CREATE TABLE bebidas_favoritas (
    id_favorita INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_tipo INT NOT NULL,
    fecha_agregada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_tipo) REFERENCES tipos_bebida(id_tipo) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_bebida (id_usuario, id_tipo)
);

-- ===========================
-- Tabla: estadisticas_usuario
-- ===========================
CREATE TABLE estadisticas_usuario (
    id_estadistica INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    total_fiestas_participadas INT DEFAULT 0,
    total_unidades_consumidas DECIMAL(8,2) DEFAULT 0,
    mejor_posicion INT DEFAULT NULL,
    bebida_mas_consumida INT DEFAULT NULL,
    racha_actual INT DEFAULT 0, -- días consecutivos con actividad
    mejor_racha INT DEFAULT 0,
    fecha_ultima_actividad DATE DEFAULT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (bebida_mas_consumida) REFERENCES tipos_bebida(id_tipo) ON DELETE SET NULL,
    UNIQUE KEY unique_usuario_stats (id_usuario)
);