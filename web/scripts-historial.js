// scripts-historial.js
// Lógica para mostrar el historial de fiestas finalizadas

async function loadHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '<div class="loading-parties"><div class="loading-spinner"></div><p>Cargando historial...</p></div>';
    try {
        const response = await fetch(`/api/user/${currentUser.id}/parties`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        // Solo fiestas finalizadas
        const finishedParties = data.parties.filter(p => p.estado === 'finalizada');
        if (finishedParties.length === 0) {
            historyList.innerHTML = '<div class="no-parties"><h3>No tienes fiestas finalizadas</h3><p>Cuando finalices fiestas, aparecerán aquí para consultar tu ranking personal.</p></div>';
            return;
        }
        // Ranking: nombre, fiesta, fecha, total consumido
        // Necesitamos pedir el ranking completo de cada fiesta
        const ranking = [];
        for (const party of finishedParties) {
            // Obtener ranking de la fiesta
            const res = await fetch(`/api/party/${party.id_fiesta}/rankings`);
            const rankings = await res.json();
            // Podio: top 3
            const podio = rankings.general.slice(0, 3);
            // Buscar al usuario actual
            const myData = rankings.general.find(u => u.id_usuario === currentUser.id);
            ranking.push({
                fiesta: party.nombre_fiesta,
                fecha: party.fecha_fin ? formatDate(party.fecha_fin) : '-',
                total: myData ? myData.total_unidades : 0,
                nombre: currentUser.nombre,
                podio: podio.map((u, i) => ({
                    nombre: u.nombre,
                    total: u.total_unidades,
                    puesto: i + 1
                }))
            });
        }
        // Ordenar por total consumido desc
        ranking.sort((a, b) => b.total - a.total);
        // Renderizar tabla tipo ranking con podio
        historyList.innerHTML = `
            <div class="ranking-list">
                <div class="ranking-item" style="font-weight:bold; background: #181B2A;">
                    <div style="flex:2;">Fiesta</div>
                    <div style="flex:1;">Fecha</div>
                    <div style="flex:1;">Total</div>
                    <div style="flex:2;">Podio</div>
                </div>
                ${ranking.map(item => `
                    <div class="ranking-item">
                        <div style="flex:2;">${item.fiesta}</div>
                        <div style="flex:1;">${item.fecha}</div>
                        <div style="flex:1; color:#FFD700; font-weight:bold;">${item.total}</div>
                        <div style="flex:2; display:flex; gap:8px; align-items:center; justify-content:center;">
                            ${item.podio.map(p => `
                                <span style="display:inline-block; min-width:60px; text-align:center; font-weight:bold; color:${p.puesto===1?'#FFD700':p.puesto===2?'#C0C0C0':'#CD7F32'}; font-size:${p.puesto===1?'1.2em':'1em'};">
                                    ${p.puesto===1?'🥇':p.puesto===2?'🥈':'🥉'}<br>${p.nombre}<br>${p.total}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (e) {
        historyList.innerHTML = `<div class='no-parties'><h3>Error</h3><p>${e.message || 'No se pudo cargar el historial.'}</p></div>`;
    }
}

// Hook para cargar historial al mostrar pantalla
function showHistory() {
    hideAllScreens();
    document.getElementById('historyScreen').style.display = 'flex';
    loadHistory(); // Debe ser loadHistory, no loadHistoryRanking
}
