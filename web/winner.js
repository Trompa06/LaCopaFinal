// Devuelve el nombre del usuario que va ganando en una fiesta
async function getWinnerName(partyId) {
    try {
        const response = await fetch(`/api/party/${partyId}/rankings`);
        const data = await response.json();
        if (data && data.general && data.general.length > 0) {
            return data.general[0].nombre;
        }
    } catch (e) {
        // Error silencioso
    }
    return null;
}
