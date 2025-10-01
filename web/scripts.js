// =======// Funcionalidad de Mis Fiestas
function showMyParties() {
    hideAllScreens();
    document.getElementById('myPartiesScreen').style.display = 'block';
    loadUserParties();
}

async function loadUserParties() {
    try {
        document.getElementById('parties-grid').innerHTML = `
            <div class="loading-parties">
                <div class="loading-spinner"></div>
                <p>Cargando tus fiestas...</p>
            </div>
        `;

    const response = await fetch(`/api/user/${currentUser.id}/parties`);
        const data = await response.json();

        if (data.success) {
            displayParties(data.parties);
        } else {
            showError(data.message || 'Error al cargar las fiestas');
        }
    } catch (error) {
        console.error('Error loading user parties:', error);
        showError('Error de conexión al cargar las fiestas');
    }
}

function displayParties(parties) {
    const partiesGrid = document.getElementById('parties-grid');
    
    if (parties.length === 0) {
        partiesGrid.innerHTML = `
            <div class="no-parties">
                <h3>No has participado en ninguna fiesta</h3>
                <p>Cuando te unas o crees fiestas, aparecerán aquí para que puedas volver a acceder a ellas fácilmente.</p>
                <button class="btn btn-primary" onclick="showHome()">
                    <i class="fas fa-plus"></i> Crear tu primera fiesta
                </button>
            </div>
        `;
        return;
    }

    const partiesHTML = parties.map(party => {
        const isActive = party.estado === 'activa';
        const isCreator = party.es_creador === 1;
        const statusText = isActive ? 'Activa' : 'Finalizada';
        const statusClass = isActive ? 'active' : 'finished';
        // Añadimos un contenedor para el ganador
        return `
            <div class="party-card ${statusClass}" data-party-id="${party.id_fiesta}">
                <div class="party-card-header">
                    <h3 class="party-name">${party.nombre_fiesta}</h3>
                    <span class="party-status ${statusClass}">${statusText}</span>
                </div>
                <div class="party-details">
                    <div class="party-detail-row">
                        <span class="party-detail-label">Código:</span>
                        <span class="party-code">${party.codigo}</span>
                    </div>
                    <div class="party-detail-row">
                        <span class="party-detail-label">Creador:</span>
                        <span class="party-creator">${isCreator ? 'Tú' : party.nombre_creador}</span>
                    </div>
                    <div class="party-detail-row">
                        <span class="party-detail-label">Participantes:</span>
                        <span class="party-participants">${party.num_participantes}</span>
                    </div>
                    <div class="party-detail-row">
                        <span class="party-detail-label">Creada:</span>
                        <span class="party-date">${formatDate(party.fecha_creacion)}</span>
                    </div>
                    ${isActive ? `<div class='party-detail-row'><span class='party-detail-label'>Va ganando:</span> <span class='party-winner' id='winner-${party.id_fiesta}'>Cargando...</span></div>` : ''}
                </div>
                <div class="party-actions">
                    ${isActive ? `
                        <button class="btn btn-success" onclick="joinPartyFromHistory('${party.codigo}')">
                            <i class="fas fa-sign-in-alt"></i> Entrar
                        </button>
                        ${isCreator ? `
                            <button class="btn btn-danger" onclick="endPartyFromHistory(${party.id_fiesta})">
                                <i class="fas fa-stop"></i> Finalizar
                            </button>
                        ` : ''}
                    ` : `
                        <button class="btn btn-secondary" onclick="viewPartyResults(${party.id_fiesta})">
                            <i class="fas fa-trophy"></i> Ver Resultados
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');

    partiesGrid.innerHTML = partiesHTML;

    // Cargar el ganador para cada fiesta activa
    parties.forEach(party => {
        if (party.estado === 'activa') {
            getWinnerName(party.id_fiesta).then(winner => {
                const el = document.getElementById(`winner-${party.id_fiesta}`);
                if (el) {
                    el.textContent = winner ? winner : 'Sin datos';
                }
            });
        }
    });
}

function filterParties(filter) {
    // Update active filter button
    document.querySelectorAll('.filter-buttons .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });
    
    event.target.classList.remove('btn-secondary');
    event.target.classList.add('btn-primary');
    
    // Filter party cards
    const partyCards = document.querySelectorAll('.party-card');
    partyCards.forEach(card => {
        const isActive = card.classList.contains('active');
        const isFinished = card.classList.contains('finished');
        
        let shouldShow = false;
        switch(filter) {
            case 'all':
                shouldShow = true;
                break;
            case 'active':
                shouldShow = isActive;
                break;
            case 'finished':
                shouldShow = isFinished;
                break;
        }
        
        if (shouldShow) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function joinPartyFromHistory(codigo) {
    try {
        // Use existing joinParty function but with code
    document.getElementById('joinCode').value = codigo;
        await joinParty();
    } catch (error) {
        console.error('Error joining party from history:', error);
        showError('Error al unirse a la fiesta');
    }
}

async function endPartyFromHistory(partyId) {
    if (!confirm('¿Estás seguro de que quieres finalizar esta fiesta?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/party/${partyId}/end`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                id_usuario: currentUser.id 
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showSuccess('Fiesta finalizada correctamente');
            loadUserParties(); // Reload the parties list
        } else {
            showError(data.message || 'Error al finalizar la fiesta');
        }
    } catch (error) {
        console.error('Error ending party:', error);
        showError('Error de conexión al finalizar la fiesta');
    }
}

function sharePartyCode(codigo) {
    // Use existing share functionality
    const partyUrl = `${window.location.origin}?code=${codigo}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'La Copa Final - Únete a la Fiesta',
            text: `¡Únete a nuestra competencia de bebidas! Código: ${codigo}`,
            url: partyUrl
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`¡Únete a nuestra fiesta en La Copa Final! Código: ${codigo} o visita: ${partyUrl}`).then(() => {
            showSuccess('Código copiado al portapapeles');
        }).catch(() => {
            // Manual copy fallback
            const textarea = document.createElement('textarea');
            textarea.value = `Código: ${codigo}\nURL: ${partyUrl}`;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showSuccess('Información copiada al portapapeles');
        });
    }
}

async function viewPartyResults(partyId) {
    try {
        const response = await fetch(`/api/party/${partyId}/results`);
        const data = await response.json();
        
        if (data.success) {
            // Store results and show results screen
            currentParty = data.party;
            // Store the results data for the ranking
            currentParty.results = data.results;
            showRanking(); // Usar showRanking en lugar de showResults
        } else {
            showError(data.message || 'Error al cargar los resultados');
        }
    } catch (error) {
        console.error('Error loading party results:', error);
        showError('Error de conexión al cargar los resultados');
    }
}

// ===========================
// Variables globales
// ===========================
let currentUser = null;
let currentParty = null;
let socket = null;

// ===========================
// Gestión de estado persistente
// ===========================
function savePartyState() {
    if (currentParty && currentUser) {
        const partyState = {
            party: currentParty,
            user: currentUser,
            timestamp: Date.now()
        };
        localStorage.setItem('activePartyState', JSON.stringify(partyState));
    }
}

function loadPartyState() {
    try {
        const savedState = localStorage.getItem('activePartyState');
        if (savedState) {
            const partyState = JSON.parse(savedState);
            // Check if state is not older than 24 hours
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            if (Date.now() - partyState.timestamp < maxAge) {
                return partyState;
            } else {
                // Remove expired state
                localStorage.removeItem('activePartyState');
            }
        }
    } catch (error) {
        console.error('Error loading party state:', error);
        localStorage.removeItem('activePartyState');
    }
    return null;
}

function clearPartyState() {
    localStorage.removeItem('activePartyState');
}

// Comprobar si el usuario debe ser redirigido a una fiesta activa
async function checkForActiveParty() {
    const savedState = loadPartyState();
    if (savedState && savedState.party && savedState.user) {
        // Verify party is still active before showing banner
        try {
            const response = await fetch(`/api/party/code/${savedState.party.codigo}/info`);
            const data = await response.json();
            
            console.log('Checking party status for banner:', data);
            
            if (data.success && data.party && data.party.finalizada === 0) {
                // Party is still active, show rejoin option
                showRejoinPartyOption(savedState.party);
            } else {
                // Party is no longer active, clear saved state
                console.log('Party no longer active, clearing state');
                console.log('Banner check - Party finalizada value:', data.party ? data.party.finalizada : 'Party not found');
                console.log('Banner check - Party finalizada type:', typeof (data.party ? data.party.finalizada : undefined));
                clearPartyState();
            }
        } catch (error) {
            console.error('Error checking party status:', error);
            // On error, clear the saved state to avoid showing invalid options
            clearPartyState();
        }
    }
}

function showRejoinPartyOption(party) {
    const rejoinHtml = `
        <div class="rejoin-party-banner">
            <div class="rejoin-content">
                <h3><i class="fas fa-history"></i> Fiesta Activa Encontrada</h3>
                <p>Tienes una fiesta activa: <strong>${party.nombre_fiesta}</strong></p>
                <p>Código: <span class="party-code">${party.codigo}</span></p>
                <div class="rejoin-actions">
                    <button onclick="rejoinParty()" class="btn btn-success">
                        <i class="fas fa-sign-in-alt"></i> Volver a la Fiesta
                    </button>
                    <button onclick="dismissRejoinBanner()" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Descartar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Insert banner at the top of main menu
    const mainMenu = document.getElementById('mainMenuScreen');
    const container = mainMenu.querySelector('.container');
    container.insertAdjacentHTML('afterbegin', rejoinHtml);
}

async function rejoinParty() {
    const savedState = loadPartyState();
    if (!savedState) {
        showError('No se encontró información de la fiesta');
        return;
    }

    try {
        // Set current user and party from saved state
        currentUser = savedState.user;
        currentParty = savedState.party;
        
        console.log('Attempting to rejoin party with code:', currentParty.codigo);
        console.log('Saved user data:', currentUser);
        console.log('Saved party data:', currentParty);
        
        // Verify party is still active using the correct endpoint
        const response = await fetch(`/api/party/code/${currentParty.codigo}/info`);
        const data = await response.json();
        
        console.log('Party verification response:', data);
        
        if (data.success && data.party && data.party.finalizada === 0) {
            // Party is still active, rejoin
            console.log('Party data from server:', data.party); // Debug log
            currentParty = {
                id: data.party.id_fiesta,
                id_fiesta: data.party.id_fiesta,
                nombre: data.party.nombre_fiesta,
                codigo: data.party.codigo,
                codigo_unico: data.party.codigo,
                isCreator: savedState.party.isCreator || false
            };
            
            console.log('Updated currentParty with ID:', currentParty); // Debug log
            console.log('Current user:', currentUser);
            
            initializeSocketConnection();
            showPartyScreen();
            loadParticipants();
            showSuccess('¡Bienvenido de vuelta a la fiesta!');
            dismissRejoinBanner();
        } else {
            // Party is no longer active
            console.log('Party is not active:', data);
            console.log('Party finalizada value:', data.party ? data.party.finalizada : 'Party not found');
            console.log('Party finalizada type:', typeof (data.party ? data.party.finalizada : undefined));
            clearPartyState();
            showWarning('La fiesta ya no está activa');
            dismissRejoinBanner();
        }
    } catch (error) {
        console.error('Error rejoining party:', error);
        showError('Error al intentar volver a la fiesta');
        clearPartyState();
        dismissRejoinBanner();
    }
}

function dismissRejoinBanner() {
    const banner = document.querySelector('.rejoin-party-banner');
    if (banner) {
        banner.remove();
    }
    clearPartyState();
}
let drinkTypes = [];
let charts = {};

// ===========================
// Inicializar aplicación
// ===========================
document.addEventListener('DOMContentLoaded', async function() {
    hideLoading();
    initializeSocketConnection();
    loadDrinkTypes();
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainMenu();
        updateUserInfo();
        
        // Check for active parties after showing main menu
        setTimeout(async () => {
            await checkForActiveParty();
        }, 500);
    } else {
        // Temporary fix: create a test user for development
        currentUser = {
            id: 2,
            nombre: 'TestUser'
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainMenu();
        updateUserInfo();
    }
});

// ===========================
// Funciones de Socket.IO
// ===========================
function initializeSocketConnection() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('🔌 Connected to server');
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
        showToast('Conexión perdida con el servidor', 'error');
    });
    
    socket.on('rankingUpdate', (rankings) => {
        updateRankings(rankings);
        updateQuickStats(rankings);
    });
    
    socket.on('partyEnded', (data) => {
        showWarning(data.message);
        // Return to home screen after 3 seconds
        setTimeout(() => {
            showHome();
        }, 3000);
    });
    
    socket.on('userJoined', (data) => {
        showToast('Un nuevo usuario se unió a la fiesta', 'info');
        if (currentParty) {
            loadParticipants();
        }
    });
    
    socket.on('partyEnded', (data) => {
        showToast(data.message, 'warning');
        setTimeout(() => {
            showMainMenu();
        }, 3000);
    });
}

// ===========================
// Funciones utilitarias
// ===========================
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Funciones auxiliares para diferentes tipos de toast
function showError(message) {
    showToast(message, 'error');
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showWarning(message) {
    showToast(message, 'warning');
}

function showInfo(message) {
    showToast(message, 'info');
}

function showModal(content) {
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// ===========================
// Navegación de pantallas
// ===========================
function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.style.display = 'none');
}

function showLoginScreen() {
    hideAllScreens();
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('userInfo').style.display = 'none';
}

async function showMainMenu() {
    hideAllScreens();
    document.getElementById('mainMenuScreen').style.display = 'flex';
    document.getElementById('userInfo').style.display = 'flex';
    
    // Mostrar opción para volver a la fiesta si existe
    updateMainMenuOptions();
    
    // Check for active parties when returning to main menu
    await checkForActiveParty();
}

// Alias de showMainMenu - usado por los botones de volver
async function showHome() {
    await showMainMenu();
}

function updateMainMenuOptions() {
    const menuOptions = document.querySelector('.menu-options');
    
    // Remover botón existente de volver a la fiesta
    const existingButton = document.getElementById('returnToPartyBtn');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Si hay una fiesta activa, agregar opción para volver
    if (currentParty) {
        const returnButton = document.createElement('button');
        returnButton.id = 'returnToPartyBtn';
        returnButton.className = 'btn-success btn-large';
        returnButton.innerHTML = `🎉 Volver a "${currentParty.nombre}"`;
        returnButton.onclick = () => startParty();
        
        // Insertar el botón al principio
        menuOptions.insertBefore(returnButton, menuOptions.firstChild);
    }
}

function showCreateParty() {
    hideAllScreens();
    document.getElementById('createPartyScreen').style.display = 'flex';
    document.getElementById('partyCode').style.display = 'none';
}

function showJoinParty() {
    hideAllScreens();
    document.getElementById('joinPartyScreen').style.display = 'flex';
}

function showPartyScreen() {
    hideAllScreens();
    document.getElementById('partyScreen').style.display = 'flex';
    loadRankings();
    loadParticipants();
    
    // Save party state for persistence
    savePartyState();
    
    // Remove rejoin banner if it exists
    const banner = document.querySelector('.rejoin-party-banner');
    if (banner) {
        banner.remove();
    }
}

function showHistory() {
    hideAllScreens();
    document.getElementById('historyScreen').style.display = 'flex';
}

function showRanking() {
    hideAllScreens();
    document.getElementById('rankingScreen').style.display = 'block';
    loadRanking();
}

async function loadRanking() {
    try {
        // Mostrar loading
        const podium = document.getElementById('podium');
        const rankingList = document.getElementById('rankingList');
        podium.innerHTML = '<div class="loading-spinner"></div><p>Cargando ranking...</p>';
        rankingList.innerHTML = '';

        let response, data;
        
        // Si tenemos una fiesta activa o resultados específicos, usar el ranking de esa fiesta
        if (currentParty && (currentParty.id_fiesta || currentParty.id)) {
            response = await fetch(`/api/party/${currentParty.id_fiesta || currentParty.id}/rankings`);
            data = await response.json();
        } else {
            // Caso por defecto: ranking global
            response = await fetch('/api/global/ranking');
            data = await response.json();
        }

        if (data.success) {
            // Transformar los datos para usar el mismo formato que antes
            const ranking = data.ranking ? data.ranking.map(user => ({
                nombre: user.nombre,
                puntuacion: user.total_unidades,
                fiestas_participadas: user.fiestas_participadas
            })) : [];
            
            renderPodium(ranking);
            renderRankingList(ranking);
        } else {
            podium.innerHTML = '<p>Error al cargar el ranking</p>';
            console.error('Error loading ranking:', data.message);
        }
    } catch (error) {
        console.error('Error loading ranking:', error);
        const podium = document.getElementById('podium');
        podium.innerHTML = '<p>Error de conexión al cargar el ranking</p>';
    }
}

function renderPodium(ranking) {
    const podium = document.getElementById('podium');
    podium.innerHTML = '';
    
    if (ranking.length === 0) {
        podium.innerHTML = '<p>No hay datos de ranking disponibles</p>';
        return;
    }
    
    const podiumData = ranking.slice(0, 3);
    const podiumClasses = ['gold', 'silver', 'bronze'];
    podiumData.forEach((user, i) => {
        podium.innerHTML += `
            <div class="podium-place ${podiumClasses[i]}">
                <div class="podium-rank">${i + 1}</div>
                <div class="podium-name">${user.nombre}</div>
                <div class="podium-score">${user.puntuacion} unidades</div>
                <div class="podium-parties">${user.fiestas_participadas} fiestas</div>
            </div>
        `;
    });
}

function renderRankingList(ranking) {
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = '';
    
    if (ranking.length <= 3) {
        rankingList.innerHTML = '<p>No hay más participantes en el ranking</p>';
        return;
    }
    
    ranking.slice(3).forEach((user, i) => {
        rankingList.innerHTML += `
            <div class="ranking-row">
                <div class="ranking-position">${i + 4}</div>
                <div class="ranking-name">${user.nombre}</div>
                <div class="ranking-score">${user.puntuacion} unidades</div>
                <div class="ranking-parties">${user.fiestas_participadas} fiestas</div>
            </div>
        `;
    });
}

// ===========================
// Funciones de autenticación
// ===========================
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

async function login() {
    const nombre = document.getElementById('loginName').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!nombre || !password) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = {
                id: data.userId,
                nombre: data.nombre
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserInfo();
            showMainMenu();
            showToast('¡Bienvenido de vuelta!', 'success');
        } else {
            showToast(data.error || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Error de conexión', 'error');
    } finally {
        hideLoading();
    }
}

async function register() {
    const nombre = document.getElementById('registerName').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!nombre || !password || !confirmPassword) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 4) {
        showToast('La contraseña debe tener al menos 4 caracteres', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Usuario registrado exitosamente', 'success');
            showLogin();
            document.getElementById('loginName').value = nombre;
        } else {
            showToast(data.error || 'Error al registrar usuario', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showToast('Error de conexión', 'error');
    } finally {
        hideLoading();
    }
}

function logout() {
    currentUser = null;
    currentParty = null;
    localStorage.removeItem('currentUser');
    
    if (socket && currentParty) {
        socket.emit('leaveParty', currentParty.id);
    }
    
    showLoginScreen();
    showToast('Sesión cerrada', 'info');
}

function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.nombre;
    }
}

// ===========================
// Funciones de fiesta
// ===========================
async function createParty() {
    const nombre = document.getElementById('partyName').value.trim();
    
    if (!nombre) {
        showToast('Por favor ingresa el nombre de la fiesta', 'error');
        return;
    }
    
    showLoading();
    
    console.log('Current user at create party:', currentUser); // Debug log
    
    // Temporary fix: if no currentUser, use a valid user ID
    const userId = currentUser ? currentUser.id : 2;
    
    try {
        const response = await fetch('/api/party/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                nombre, 
                id_creador: userId 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentParty = {
                id: data.id_fiesta,
                id_fiesta: data.id_fiesta,
                nombre: nombre,
                codigo: data.codigo_unico,
                codigo_unico: data.codigo_unico, // Para compatibilidad
                isCreator: true
            };
            
            document.getElementById('codeValue').textContent = data.codigo_unico;
            document.getElementById('partyCode').style.display = 'block';
            showToast('¡Fiesta creada exitosamente!', 'success');
        } else {
            showToast(data.error || 'Error al crear fiesta', 'error');
        }
    } catch (error) {
        console.error('Create party error:', error);
        showToast('Error de conexión', 'error');
    } finally {
        hideLoading();
    }
}

async function joinParty() {
    const codigo = document.getElementById('joinCode').value.trim().toUpperCase();
    
    if (!codigo) {
        showToast('Por favor ingresa el código de la fiesta', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch('/api/party/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                codigo_unico: codigo, 
                id_usuario: currentUser.id 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentParty = {
                id: data.id_fiesta,
                id_fiesta: data.id_fiesta,
                nombre: data.nombre_fiesta || 'Fiesta',
                codigo: codigo,
                codigo_unico: codigo, // Para compatibilidad
                isCreator: false
            };
            
            startParty();
            showToast('¡Te has unido a la fiesta!', 'success');
        } else {
            showToast(data.error || 'Error al unirse a la fiesta', 'error');
        }
    } catch (error) {
        console.error('Join party error:', error);
        showToast('Error de conexión', 'error');
    } finally {
        hideLoading();
    }
}

async function startParty() {
    if (!currentParty) {
        showToast('Error: No hay fiesta activa', 'error');
        return;
    }
    
    // Join socket room
    socket.emit('joinParty', currentParty.id_fiesta || currentParty.id);
    
    // Get party info to verify creator status
    try {
        console.log('About to fetch party info, currentParty.id:', currentParty.id_fiesta || currentParty.id); // Debug log
        const response = await fetch(`/api/party/${currentParty.id_fiesta || currentParty.id}/info`);
        const partyInfo = await response.json();
        
        if (response.ok) {
            // Update party info with server data
            currentParty.nombre = partyInfo.nombre;
            currentParty.codigo = partyInfo.codigo_unico;
            currentParty.isCreator = (partyInfo.id_creador === currentUser.id);
            
            // Update UI
            document.getElementById('partyTitle').textContent = currentParty.nombre;
            document.getElementById('partyCodeDisplay').textContent = currentParty.codigo;
            document.getElementById('codeValue').textContent = currentParty.codigo;
            
            // Show party code section
            document.getElementById('partyCode').style.display = 'block';
            
            if (currentParty.isCreator) {
                document.getElementById('endPartyBtn').style.display = 'block';
            } else {
                document.getElementById('endPartyBtn').style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error getting party info:', error);
    }
    
    // Populate drink buttons
    console.log('About to load drink types and populate buttons...'); // Debug log
    try {
        await loadDrinkTypes(); // Asegurar que se cargan los tipos primero
        console.log('Drink types loaded, now populating buttons...'); // Debug log
    } catch (error) {
        console.error('Error in loadDrinkTypes:', error);
    }
    
    // Backup: try direct fetch if drinkTypes is still empty
    if (!drinkTypes || drinkTypes.length === 0) {
        console.log('Trying backup method to load drink types...');
        fetch('/api/drink-types')
            .then(response => response.json())
            .then(data => {
                console.log('Backup method response:', data);
                if (data.success && data.types) {
                    drinkTypes = data.types;
                    populateDrinkButtons();
                }
            })
            .catch(error => console.error('Backup method error:', error));
    }
    
    populateDrinkButtons();
    
    // Show party screen
    showPartyScreen();
}

function copyCode() {
    const code = document.getElementById('codeValue').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showToast('Código copiado al portapapeles', 'success');
    });
}

function copyPartyCode() {
    const code = document.getElementById('partyCodeDisplay').textContent;
    if (code) {
        navigator.clipboard.writeText(code).then(() => {
            showToast('Código copiado al portapapeles! 📋', 'success');
        }).catch(() => {
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Código copiado al portapapeles! 📋', 'success');
        });
    }
}

function sharePartyCode() {
    const code = document.getElementById('partyCodeDisplay').textContent;
    const partyName = currentParty.nombre;
    
    const shareText = `¡Únete a "${partyName}"! 🍻\n\nCódigo de la fiesta: ${code}\n\nEntra a La Copa Final y usa este código para unirte a la competencia! 🏆`;
    
    // Si el navegador soporta Web Share API
    if (navigator.share) {
        navigator.share({
            title: `¡Únete a "${partyName}"! 🍻`,
            text: shareText,
            url: window.location.origin
        }).then(() => {
            showToast('¡Código compartido! 📤', 'success');
        }).catch((error) => {
            console.log('Error sharing:', error);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

function fallbackShare(text) {
    // Fallback: copiar al portapapeles
    navigator.clipboard.writeText(text).then(() => {
        showToast('Texto para compartir copiado al portapapeles! 📤', 'success');
    }).catch(() => {
        // Mostrar modal con el texto
        showModal(`
            <h3>Comparte este mensaje con tus amigos:</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <pre style="white-space: pre-wrap; font-family: inherit;">${text}</pre>
            </div>
            <button onclick="copyTextFromModal(); closeModal();" class="btn-primary">Copiar Texto</button>
        `);
        
        // Guardar el texto para copiarlo después
        window.tempShareText = text;
    });
}

function copyTextFromModal() {
    if (window.tempShareText) {
        const textArea = document.createElement('textarea');
        textArea.value = window.tempShareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Texto copiado al portapapeles! 📋', 'success');
        delete window.tempShareText;
    }
}

async function endParty() {
    if (!currentParty || !currentParty.isCreator) {
        showToast('Solo el creador puede finalizar la fiesta', 'error');
        return;
    }
    
    const confirmed = confirm('¿Estás seguro de que quieres finalizar la fiesta?');
    if (!confirmed) return;
    
    showLoading();
    
    try {
        const response = await fetch(`/api/party/${currentParty.id_fiesta || currentParty.id}/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario: currentUser.id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Fiesta finalizada', 'success');
            // Clear saved party state when ending party
            clearPartyState();
            currentParty = null;
            setTimeout(() => {
                showMainMenu();
            }, 2000);
        } else {
            showToast(data.error || 'Error al finalizar fiesta', 'error');
        }
    } catch (error) {
        console.error('End party error:', error);
        showToast('Error de conexión', 'error');
    } finally {
        hideLoading();
    }
}

function leaveParty() {
    const confirmed = confirm('¿Estás seguro de que quieres salir de la fiesta?');
    if (!confirmed) return;
    
    if (socket && currentParty) {
        socket.emit('leaveParty', currentParty.id);
    }
    
    // NO eliminamos currentParty para poder volver a entrar
    // currentParty = null;
    showMainMenu();
    showToast('Has salido de la fiesta', 'info');
}

// Función para salir completamente de la fiesta
function exitPartyCompletely() {
    if (socket && currentParty) {
        socket.emit('leaveParty', currentParty.id);
    }
    
    currentParty = null;
    showMainMenu();
    showToast('Has salido completamente de la fiesta', 'info');
}

// ===========================
// Funciones de bebidas
// ===========================
async function loadDrinkTypes() {
    try {
        console.log('Loading drink types...'); // Debug log
        const response = await fetch('/api/drink-types');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Drink types response:', data); // Debug log
        
        if (data.success && data.types) {
            drinkTypes = data.types;
            console.log('Drink types loaded:', drinkTypes); // Debug log
        } else {
            console.error('Failed to load drink types:', data);
            drinkTypes = []; // Asegurar que sea un array vacío
        }
    } catch (error) {
        console.error('Error loading drink types:', error);
        drinkTypes = []; // Asegurar que sea un array vacío
    }
}

function populateDrinkButtons() {
    const grid = document.getElementById('drinkGrid');
    grid.innerHTML = '';
    
    console.log('Populating drink buttons, drinkTypes:', drinkTypes); // Debug log
    
    if (!drinkTypes || drinkTypes.length === 0) {
        console.log('No drink types available!'); // Debug log
        grid.innerHTML = '<p>No hay bebidas disponibles</p>';
        return;
    }
    
    const drinkEmojis = {
        'Cerveza': '🍺',
        'Cubata': '🥃',
        'Cubalitro': '🍹',
        'Xupito suave': '🥃',
        'Xupito fuerte': '🔥'
    };
    
    drinkTypes.forEach(drink => {
        const button = document.createElement('button');
        button.className = 'drink-btn';
        button.onclick = () => addDrink(drink.id_tipo);
        
        button.innerHTML = `
            <div class="emoji">${drinkEmojis[drink.nombre] || '🍺'}</div>
            <div class="name">${drink.nombre}</div>
            <div class="units">${drink.unidad_alcohol} unidades</div>
        `;
        
        grid.appendChild(button);
    });
}

async function addDrink(drinkTypeId) {
    console.log('addDrink called with:', drinkTypeId);
    console.log('currentParty:', currentParty);
    console.log('currentUser:', currentUser);
    
    if (!currentParty) {
        showToast('Error: No hay fiesta activa', 'error');
        return;
    }
    
    if (!currentUser || !currentUser.id) {
        showToast('Error: Usuario no identificado', 'error');
        console.error('currentUser is invalid:', currentUser);
        return;
    }
    
    // Visual feedback
    const button = event.target.closest('.drink-btn');
    button.classList.add('pulse');
    setTimeout(() => button.classList.remove('pulse'), 1000);
    
    try {
        const requestBody = {
            id_usuario: currentUser.id,
            id_fiesta: currentParty.id_fiesta || currentParty.id,
            id_tipo: drinkTypeId,
            cantidad: 1
        };
        
        console.log('Sending consumption request:', requestBody);
        
        const response = await fetch('/api/consumption/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (data.success) {
            const drinkName = drinkTypes.find(d => d.id_tipo === drinkTypeId)?.nombre;
            showToast(`${drinkName} registrada!`, 'success');
            
            // Update rankings will be handled by socket
        } else {
            showToast(data.error || 'Error al registrar bebida', 'error');
        }
    } catch (error) {
        console.error('Add drink error:', error);
        showToast('Error de conexión', 'error');
    }
}

// ===========================
// Funciones de rankings
// ===========================
async function loadRankings() {
    if (!currentParty) return;
    
    try {
        const response = await fetch(`/api/party/${currentParty.id}/rankings`);
        const rankings = await response.json();
        updateRankings(rankings);
        updateQuickStats(rankings);
    } catch (error) {
        console.error('Error loading rankings:', error);
    }
}

function updateRankings(rankings) {
    updateGeneralRanking(rankings.general);
    updateDrinkTypeRanking(rankings.byDrinkType);
    update60MinRanking(rankings.ranking60min);
}

function updateGeneralRanking(ranking) {
    const list = document.getElementById('generalList');
    list.innerHTML = '';
    
    if (ranking.length === 0) {
        list.innerHTML = '<p>No hay datos aún...</p>';
        return;
    }
    
    ranking.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        
        if (user.id_usuario === currentUser.id) {
            item.classList.add('current-user');
        }
        
        const position = index + 1;
        let positionClass = '';
        if (position === 1) positionClass = 'first';
        else if (position === 2) positionClass = 'second';
        else if (position === 3) positionClass = 'third';
        
        item.innerHTML = `
            <div class="ranking-position ${positionClass}">${position}</div>
            <div class="ranking-name">${user.nombre}</div>
            <div class="ranking-value">${user.total_unidades} unidades</div>
        `;
        
        list.appendChild(item);
    });
    
    // Update chart
    updateGeneralChart(ranking);
}

function updateDrinkTypeRanking(ranking) {
    const list = document.getElementById('drinksList');
    list.innerHTML = '';
    
    if (ranking.length === 0) {
        list.innerHTML = '<p>No hay datos aún...</p>';
        return;
    }
    
    // Group by user
    const userDrinks = {};
    ranking.forEach(item => {
        if (!userDrinks[item.nombre]) {
            userDrinks[item.nombre] = {};
        }
        if (item.tipo_bebida) {
            userDrinks[item.nombre][item.tipo_bebida] = item.cantidad_total;
        }
    });
    
    Object.entries(userDrinks).forEach(([userName, drinks]) => {
        const userDiv = document.createElement('div');
        userDiv.innerHTML = `<h4>${userName}</h4>`;
        
        Object.entries(drinks).forEach(([drinkType, quantity]) => {
            const item = document.createElement('div');
            item.className = 'ranking-item';
            item.innerHTML = `
                <div class="ranking-name">${drinkType}</div>
                <div class="ranking-value">${quantity}</div>
            `;
            userDiv.appendChild(item);
        });
        
        list.appendChild(userDiv);
    });
    
    // Update chart
    updateDrinksChart(ranking);
}

function update60MinRanking(ranking) {
    const list = document.getElementById('min60List');
    list.innerHTML = '';
    
    if (ranking.length === 0) {
        list.innerHTML = '<p>No hay datos aún...</p>';
        return;
    }
    
    ranking.forEach((user, index) => {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        
        if (user.id_usuario === currentUser.id) {
            item.classList.add('current-user');
        }
        
        const position = index + 1;
        let positionClass = '';
        if (position === 1) positionClass = 'first';
        else if (position === 2) positionClass = 'second';
        else if (position === 3) positionClass = 'third';
        
        item.innerHTML = `
            <div class="ranking-position ${positionClass}">${position}</div>
            <div class="ranking-name">${user.nombre}</div>
            <div class="ranking-value">${user.max_60min || 0} unidades/hora</div>
        `;
        
        list.appendChild(item);
    });
    
    // Update chart
    update60MinChart(ranking);
}

function updateQuickStats(rankings) {
    const myData = rankings.general.find(user => user.id_usuario === currentUser.id);
    const myTotal = myData ? myData.total_unidades : 0;
    const myPosition = myData ? rankings.general.indexOf(myData) + 1 : '-';
    const totalParticipants = rankings.general.length;
    
    document.getElementById('myTotal').textContent = myTotal;
    document.getElementById('myPosition').textContent = myPosition;
    document.getElementById('totalParticipants').textContent = totalParticipants;
}

async function loadParticipants() {
    if (!currentParty) return;
    
    try {
        const response = await fetch(`/api/party/${currentParty.id_fiesta || currentParty.id}/participants`);
        const participants = await response.json();
        
        document.getElementById('totalParticipants').textContent = participants.length;
    } catch (error) {
        console.error('Error loading participants:', error);
    }
}

// ===========================
// Funciones de gráficos
// ===========================
function updateGeneralChart(data) {
    const ctx = document.getElementById('generalChart').getContext('2d');
    
    if (charts.general) {
        charts.general.destroy();
    }
    
    charts.general = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(user => user.nombre),
            datasets: [{
                label: 'Unidades de Alcohol',
                data: data.map(user => user.total_unidades),
                backgroundColor: 'rgba(255, 107, 53, 0.8)',
                borderColor: 'rgba(255, 107, 53, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateDrinksChart(data) {
    const ctx = document.getElementById('drinksChart').getContext('2d');
    
    if (charts.drinks) {
        charts.drinks.destroy();
    }
    
    // Process data for stacked bar chart
    const users = [...new Set(data.map(item => item.nombre))];
    const drinkTypes = [...new Set(data.map(item => item.tipo_bebida).filter(Boolean))];
    
    const datasets = drinkTypes.map((drinkType, index) => {
        const colors = ['rgba(255, 107, 53, 0.8)', 'rgba(245, 166, 35, 0.8)', 'rgba(52, 152, 219, 0.8)', 'rgba(231, 76, 60, 0.8)', 'rgba(155, 89, 182, 0.8)'];
        
        return {
            label: drinkType,
            data: users.map(user => {
                const userDrink = data.find(item => item.nombre === user && item.tipo_bebida === drinkType);
                return userDrink ? userDrink.cantidad_total : 0;
            }),
            backgroundColor: colors[index % colors.length]
        };
    });
    
    charts.drinks = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: users,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    });
}

function update60MinChart(data) {
    const ctx = document.getElementById('min60Chart').getContext('2d');
    
    if (charts.min60) {
        charts.min60.destroy();
    }
    
    charts.min60 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(user => user.nombre),
            datasets: [{
                label: 'Máximo en 60 minutos',
                data: data.map(user => user.max_60min || 0),
                backgroundColor: 'rgba(39, 174, 96, 0.8)',
                borderColor: 'rgba(39, 174, 96, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ===========================
// Funciones de pestañas
// ===========================
function showRankingTab(tabName) {
    // Hide all ranking contents
    document.querySelectorAll('.ranking-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.rankings-section .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected content and activate tab
    if (tabName === 'general') {
        document.getElementById('generalRanking').style.display = 'block';
        document.querySelectorAll('.rankings-section .tab-btn')[0].classList.add('active');
    } else if (tabName === 'drinks') {
        document.getElementById('drinksRanking').style.display = 'block';
        document.querySelectorAll('.rankings-section .tab-btn')[1].classList.add('active');
    } else if (tabName === '60min') {
        document.getElementById('min60Ranking').style.display = 'block';
        document.querySelectorAll('.rankings-section .tab-btn')[2].classList.add('active');
    }
}

// ===========================
// Funciones de Perfil de Usuario
// ===========================
let isEditingProfile = false;
let originalProfileData = {};

function showProfile() {
    hideAllScreens();
    document.getElementById('profileScreen').style.display = 'block';
    loadProfile();
}

async function loadProfile() {
    try {
        // Temporary fix: if no currentUser, use a valid user ID
        const userId = currentUser ? currentUser.id : 2;
        
        // Cargar datos del perfil
        const response = await fetch(`/api/user/${userId}/profile`);
        const data = await response.json();

        if (data.success) {
            displayProfile(data.user);
            loadFavoriteDrinks();
            loadUserStats();
            loadDrinkTypes();
        } else {
            showError(data.message || 'Error al cargar el perfil');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Error de conexión al cargar el perfil');
    }
}

function displayProfile(profile) {
    // Almacenar datos originales
    originalProfileData = { ...profile };

    // Mostrar información básica
    document.getElementById('profileName').textContent = profile.nombre || currentUser.name;
    document.getElementById('profileEmail').textContent = profile.email || 'No especificado';
    document.getElementById('profileBio').textContent = profile.biografia || 'No especificada';
    document.getElementById('profileBirthdate').textContent = profile.fecha_nacimiento 
        ? new Date(profile.fecha_nacimiento).toLocaleDateString('es-ES') 
        : 'No especificada';
    document.getElementById('profileGender').textContent = 
        profile.genero ? formatGender(profile.genero) : 'No especificado';
    document.getElementById('profileCountry').textContent = profile.pais || 'No especificado';
    document.getElementById('profileCity').textContent = profile.ciudad || 'No especificada';
    document.getElementById('profileWeight').textContent = 
        profile.peso ? `${profile.peso} kg` : 'No especificado';
    document.getElementById('profileHeight').textContent = 
        profile.altura ? `${profile.altura} cm` : 'No especificada';

    // Configurar inputs
    document.getElementById('profileNameInput').value = profile.nombre || currentUser.name;
    document.getElementById('profileEmailInput').value = profile.email || '';
    document.getElementById('profileBioInput').value = profile.biografia || '';
    document.getElementById('profileBirthdateInput').value = profile.fecha_nacimiento || '';
    document.getElementById('profileGenderInput').value = profile.genero || '';
    document.getElementById('profileCountryInput').value = profile.pais || '';
    document.getElementById('profileCityInput').value = profile.ciudad || '';
    document.getElementById('profileWeightInput').value = profile.peso || '';
    document.getElementById('profileHeightInput').value = profile.altura || '';

    // Configurar avatar
    updateProfileAvatar(profile);
    
    // Asegurar que estamos en modo de solo lectura
    if (isEditingProfile) {
        isEditingProfile = false;
        toggleEditProfile();
    }
}

function updateProfileAvatar(profile) {
    const profileImage = document.getElementById('profileImage');
    const profileInitials = document.getElementById('profileInitials');

    if (profile.foto_perfil) {
        profileImage.src = profile.foto_perfil;
        profileImage.style.display = 'block';
        profileInitials.style.display = 'none';
    } else {
        profileImage.style.display = 'none';
        profileInitials.style.display = 'block';
        const name = profile.nombre || currentUser.name;
        profileInitials.textContent = name.substring(0, 2).toUpperCase();
    }
}

function formatGender(gender) {
    const genderMap = {
        'masculino': 'Masculino',
        'femenino': 'Femenino',
        'otro': 'Otro',
        'prefiero_no_decir': 'Prefiero no decir'
    };
    return genderMap[gender] || gender;
}

async function loadFavoriteDrinks() {
    try {
        const response = await fetch(`/api/user/${currentUser.id}/favorite-drinks`);
        const data = await response.json();

        if (data.success) {
            displayFavoriteDrinks(data.favorites);
        }
    } catch (error) {
        console.error('Error loading favorite drinks:', error);
    }
}

function displayFavoriteDrinks(favorites) {
    const container = document.getElementById('favoriteDrinks');
    
    if (favorites.length === 0) {
        container.innerHTML = '<p class="text-muted">No tienes bebidas favoritas agregadas</p>';
        return;
    }

    container.innerHTML = favorites.map(fav => `
        <div class="favorite-drink-item">
            <span class="favorite-drink-name">${fav.nombre}</span>
            <button class="remove-favorite" onclick="removeFavoriteDrink(${fav.id_tipo})" title="Eliminar favorita">
                ✕
            </button>
        </div>
    `).join('');
}

async function loadDrinkTypes() {
    try {
        const response = await fetch('/api/drink-types');
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById('drinkTypeSelect');
            select.innerHTML = '<option value="">Seleccionar bebida...</option>' +
                data.types.map(type => 
                    `<option value="${type.id_tipo}">${type.nombre}</option>`
                ).join('');
        }
    } catch (error) {
        console.error('Error loading drink types:', error);
    }
}

async function loadUserStats() {
    try {
        const response = await fetch(`/api/user/${currentUser.id}/stats`);
        const data = await response.json();

        if (data.success) {
            displayUserStats(data.stats);
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

function displayUserStats(stats) {
    document.getElementById('totalParties').textContent = stats.total_fiestas_participadas || 0;
    document.getElementById('totalUnits').textContent = (stats.total_unidades_consumidas || 0).toFixed(1);
    document.getElementById('bestPosition').textContent = stats.mejor_posicion ? `#${stats.mejor_posicion}` : '-';
    document.getElementById('currentStreak').textContent = stats.racha_actual || 0;
    document.getElementById('bestStreak').textContent = stats.mejor_racha || 0;
    document.getElementById('favoriteDrinkStat').textContent = stats.bebida_mas_consumida_nombre || '-';
}

function toggleEditProfile() {
    const editBtn = document.getElementById('editProfileBtn');
    
    if (!isEditingProfile) {
        // Activar modo edición
        isEditingProfile = true;
        
        // Ocultar todos los valores y mostrar todos los inputs
        document.querySelectorAll('.profile-value').forEach(val => {
            val.style.display = 'none';
        });
        document.querySelectorAll('.profile-input').forEach(input => {
            input.style.display = 'block';
        });
        
        // Mostrar acciones y avatar actions
        const actions = document.getElementById('profileActions');
        const avatarActions = document.getElementById('avatarActions');
        if (actions) actions.style.display = 'flex';
        if (avatarActions) avatarActions.style.display = 'flex';
        
        editBtn.textContent = '❌ Cancelar';
        editBtn.onclick = cancelEditProfile;
        
    } else {
        // Desactivar modo edición
        isEditingProfile = false;
        
        // Mostrar todos los valores y ocultar todos los inputs
        document.querySelectorAll('.profile-value').forEach(val => {
            val.style.display = 'block';
        });
        document.querySelectorAll('.profile-input').forEach(input => {
            input.style.display = 'none';
        });
        
        // Ocultar acciones y avatar actions
        const actions = document.getElementById('profileActions');
        const avatarActions = document.getElementById('avatarActions');
        if (actions) actions.style.display = 'none';
        if (avatarActions) avatarActions.style.display = 'none';
        
        editBtn.textContent = '✏️ Editar';
        editBtn.onclick = toggleEditProfile;
    }
}

function cancelEditProfile() {
    // Restaurar los datos originales en los inputs
    if (originalProfileData) {
        document.getElementById('profileNameInput').value = originalProfileData.nombre || currentUser.name;
        document.getElementById('profileEmailInput').value = originalProfileData.email || '';
        document.getElementById('profileBioInput').value = originalProfileData.biografia || '';
        document.getElementById('profileBirthdateInput').value = originalProfileData.fecha_nacimiento || '';
        document.getElementById('profileGenderInput').value = originalProfileData.genero || '';
        document.getElementById('profileCountryInput').value = originalProfileData.pais || '';
        document.getElementById('profileCityInput').value = originalProfileData.ciudad || '';
        document.getElementById('profileWeightInput').value = originalProfileData.peso || '';
        document.getElementById('profileHeightInput').value = originalProfileData.altura || '';
    }
    
    // Salir del modo edición
    toggleEditProfile();
}

async function saveProfile() {
    try {
        const profileData = {
            nombre: document.getElementById('profileNameInput').value,
            email: document.getElementById('profileEmailInput').value,
            biografia: document.getElementById('profileBioInput').value,
            fecha_nacimiento: document.getElementById('profileBirthdateInput').value || null,
            genero: document.getElementById('profileGenderInput').value || null,
            pais: document.getElementById('profileCountryInput').value || null,
            ciudad: document.getElementById('profileCityInput').value || null,
            peso: document.getElementById('profileWeightInput').value || null,
            altura: document.getElementById('profileHeightInput').value || null
        };

        const response = await fetch(`/api/user/${currentUser.id}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Perfil actualizado correctamente');
            currentUser.name = profileData.nombre;
            document.getElementById('userName').textContent = currentUser.name;
            toggleEditProfile();
            loadProfile();
        } else {
            showError(data.message || 'Error al actualizar el perfil');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showError('Error de conexión al guardar el perfil');
    }
}

function selectProfileImage() {
    document.getElementById('profileImageInput').click();
}

document.getElementById('profileImageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            showError('La imagen debe ser menor a 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            uploadProfileImage(e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

async function uploadProfileImage(base64Image) {
    try {
        const response = await fetch(`/api/user/${currentUser.id}/profile-image`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Image })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('profileImage').src = base64Image;
            document.getElementById('profileImage').style.display = 'block';
            document.getElementById('profileInitials').style.display = 'none';
            showSuccess('Foto de perfil actualizada');
        } else {
            showError(data.message || 'Error al subir la imagen');
        }
    } catch (error) {
        console.error('Error uploading profile image:', error);
        showError('Error de conexión al subir la imagen');
    }
}

async function removeProfileImage() {
    try {
        const response = await fetch(`/api/user/${currentUser.id}/profile-image`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('profileImage').style.display = 'none';
            document.getElementById('profileInitials').style.display = 'block';
            updateProfileAvatar({ nombre: currentUser.name });
            showSuccess('Foto de perfil eliminada');
        } else {
            showError(data.message || 'Error al eliminar la imagen');
        }
    } catch (error) {
        console.error('Error removing profile image:', error);
        showError('Error de conexión al eliminar la imagen');
    }
}

function toggleAddFavorite() {
    const section = document.getElementById('addFavoriteSection');
    const btn = document.getElementById('toggleFavoriteBtn');
    
    if (section.style.display === 'none' || !section.style.display) {
        section.style.display = 'flex';
        btn.textContent = '❌ Cancelar';
    } else {
        section.style.display = 'none';
        btn.textContent = '➕ Agregar favorita';
        document.getElementById('drinkTypeSelect').value = '';
    }
}

async function addFavoriteDrink() {
    const drinkTypeId = document.getElementById('drinkTypeSelect').value;
    
    if (!drinkTypeId) {
        showError('Por favor selecciona una bebida');
        return;
    }

    try {
        const response = await fetch(`/api/user/${currentUser.id}/favorite-drinks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ drink_type_id: drinkTypeId })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Bebida favorita agregada');
            loadFavoriteDrinks();
            toggleAddFavorite();
        } else {
            showError(data.message || 'Error al agregar bebida favorita');
        }
    } catch (error) {
        console.error('Error adding favorite drink:', error);
        showError('Error de conexión al agregar bebida favorita');
    }
}

async function removeFavoriteDrink(drinkTypeId) {
    try {
        const response = await fetch(`/api/user/${currentUser.id}/favorite-drinks/${drinkTypeId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Bebida favorita eliminada');
            loadFavoriteDrinks();
        } else {
            showError(data.message || 'Error al eliminar bebida favorita');
        }
    } catch (error) {
        console.error('Error removing favorite drink:', error);
        showError('Error de conexión al eliminar bebida favorita');
    }
}