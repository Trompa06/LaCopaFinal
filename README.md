# 🏆 La Copa Final

![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js&logoColor=white) 
![MySQL](https://img.shields.io/badge/DB-MySQL-blue?logo=mysql&logoColor=white) 
![Chart.js](https://img.shields.io/badge/Charts-Chart.js-orange?logo=chart.js&logoColor=white) 
![Docker](https://img.shields.io/badge/Container-Docker-blue?logo=docker&logoColor=white) 

**La Copa Final** es una web para competir entre amigos en fiestas, registrando en tiempo real quién bebe más y determinando al ganador de la noche. 🍻🥃

---

## 📑 Tabla de Contenidos

- [📌 Funcionalidades Principales](#-funcionalidades-principales)  
  - [1️⃣ Registro de bebidas](#1️⃣-registro-de-bebidas)  
  - [2️⃣ Conversión de alcohol a unidades estándar](#2️⃣-conversión-de-alcohol-a-unidades-estándar)  
  - [3️⃣ Inicio de la competencia](#3️⃣-inicio-de-la-competencia)  
  - [4️⃣ Rankings en tiempo real](#4️⃣-rankings-en-tiempo-real)  
  - [5️⃣ Historial de fiestas](#5️⃣-historial-de-fiestas)  
  - [6️⃣ Gamificación: Ranking por hora (Crono 60 min)](#6️⃣-gamificación-ranking-por-hora-crono-60-min)  
  - [7️⃣ Compatibilidad móvil](#7️⃣-compatibilidad-móvil)  
- [💻 Tecnologías Utilizadas](#-tecnologías-utilizadas)  
- [⚙️ Cómo Funciona](#️-cómo-funciona)  
- [🚀 Futuras Mejoras](#-futuras-mejoras)  
- [⚠️ Advertencia](#⚠️-advertencia)  
- [📸 Screenshots](#-screenshots-opcional)  

---

## 📌 Funcionalidades Principales

### 1️⃣ Registro de bebidas
- Controla diferentes tipos de bebidas:
  - 🍺 Cerveza  
  - 🥃 Cubata  
  - 🍹 Cubalitro  
  - 🥃 Xupito suave (ej. tequila de fresa)  
  - 🥃 Xupito fuerte (ej. whisky, anís, Jäger, tequila normal)  

### 2️⃣ Conversión de alcohol a unidades estándar
- El sistema calcula automáticamente la cantidad de alcohol consumido por cada usuario.  
- Esto asegura comparaciones justas entre todos los participantes. ⚖️  
- Los usuarios **no ven** estos cálculos, son internos.  

### 3️⃣ Inicio de la competencia
- Los usuarios pueden **crear una nueva fiesta/competencia** o **unirse a una existente**. 🎉  
- Al crear una fiesta, se genera un **código único** que se muestra en pantalla para que otros puedan unirse.  
- Solo el **creador de la fiesta** puede finalizarla manualmente.  
- Si nadie la finaliza, la fiesta se cierra automáticamente a las **24 horas**. ⏳  

### 4️⃣ Rankings en tiempo real
- Gráficos dinámicos y resúmenes por tipo de bebida. 📊  
- Se muestran:  
  - **Ranking general por unidades de alcohol** 🔄  
  - **Ranking por cada tipo de bebida** 🍺🥃🍹  
  - **Ranking de 60 minutos**, calculando los picos horarios de consumo ⏱️  

### 5️⃣ Historial de fiestas
- Guarda datos de varias fiestas para consultar récords históricos. 🗂️  
- Permite comparar resultados de diferentes sesiones.  

### 6️⃣ Gamificación: Ranking por hora (Crono 60 min)
- Durante toda la fiesta, se registran los máximos consumos por hora de cada usuario.  
- Ejemplo: si un usuario bebe 2 cubatas de 23:00 a 00:00 y 3 cubatas de 01:00 a 02:00, su PR de 60 minutos será 3 cubatas.  
- Este ranking de 60 minutos se calcula automáticamente a lo largo de toda la competencia. 🏅  

### 7️⃣ Compatibilidad móvil
- Totalmente optimizada para móviles 📱  
- Los usuarios pueden iniciar sesión y registrar su consumo desde cualquier dispositivo durante la fiesta.  

---

## 💻 Tecnologías Utilizadas

- ![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js&logoColor=white) Node.js  
- ![MySQL](https://img.shields.io/badge/DB-MySQL-blue?logo=mysql&logoColor=white) MySQL  
- ![Chart.js](https://img.shields.io/badge/Charts-Chart.js-orange?logo=chart.js&logoColor=white) Chart.js  
- ![Docker](https://img.shields.io/badge/Container-Docker-blue?logo=docker&logoColor=white) Docker  

---

## 🎨 Paleta de Colores

La web usa una paleta pensada para equilibrio y contraste:

- **Fondo principal:** Azul marino `#2C3E50`  
- **Color primario:** Azul celeste `#3498DB`  
- **Texto principal:** Blanco `#FFFFFF`  
- **Texto secundario:** Negro `#000000`  
- **Color de acento:** Magenta `#E91E63` (elegante) o `#FF1493` (más vibrante)  

---

## ⚙️ Cómo Funciona

1. Los usuarios pueden **crear una nueva fiesta** o **unirse a una existente** usando un código único. 👥  
2. El creador de la fiesta inicia la competencia. 🎉  
3. Cada bebida consumida se registra en la web. 📝  
4. El sistema convierte el alcohol en unidades estándar y actualiza los rankings en vivo, incluyendo:  
   - Ranking general por unidades de alcohol  
   - Ranking por cada tipo de bebida  
   - Ranking de 60 minutos basado en los picos horarios de consumo  
5. Al finalizar la fiesta, manualmente por el creador o automáticamente a las 24 horas, se determina el ganador global y se guardan todos los resultados. 🏆  

---

## 🚀 Futuras Mejoras

- 🔔 Notificaciones push para avisar cambios en el ranking en tiempo real.  
- 🍸 Posibilidad de personalizar tipos de bebida y unidades de alcohol.  
- 🏅 Medallas y logros para gamificar aún más la experiencia.  
- ⚠️ Límites de consumo y advertencias de responsabilidad.  

---

## ⚠️ Advertencia

**Se recomienda el consumo responsable de alcohol solo si eres mayor de edad.**  
Esta aplicación es solo para fines recreativos y de entretenimiento entre adultos. 🥂  

---

## 📸 Screenshots (Opcional)

![Pantalla principal](ruta/a/tu/screenshot1.png)  
![Ranking en vivo](ruta/a/tu/screenshot2.png)  

---
