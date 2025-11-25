/* AUTH.JS
   Gerencia a exibição do usuário no Menu e o Logout com Modal
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica sessão
    const session = localStorage.getItem('resolucity_session_v1');
    
    // 2. Busca o botão de login
    const loginBtn = document.querySelector('nav a[href="login.html"]');

    // Se estiver logado e o botão existir
    if (session && loginBtn) {
        const user = JSON.parse(session);
        const firstName = user.name.split(' ')[0];

        // 3. Cria container do usuário
        const userDiv = document.createElement('div');
        userDiv.className = 'd-flex align-items-center gap-3 ms-lg-3 mt-3 mt-lg-0';
        
        userDiv.innerHTML = `
            <div class="text-white text-end lh-1 d-none d-lg-block">
                <div class="fw-bold" style="font-size: 0.9rem;">Olá, ${firstName}</div>
                <div class="small opacity-75" style="font-size: 0.75rem;">${user.email}</div>
            </div>
            <div class="text-white d-lg-none mb-2">
                Olá, <strong>${firstName}</strong>
            </div>
            <button id="btn-menu-logout" class="btn btn-outline-warning btn-sm fw-bold px-3">
                <i class="bi bi-box-arrow-right me-1"></i> Sair
            </button>
        `;

        loginBtn.replaceWith(userDiv);

        // 4. Evento de Logout com Modal Personalizado
        document.getElementById('btn-menu-logout').addEventListener('click', (e) => {
            e.preventDefault();
            showLogoutModal();
        });
    }
});

// Função para criar e mostrar o modal de logout
function showLogoutModal() {
    // Verifica se já existe, senão cria
    let modal = document.getElementById('global-logout-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'global-logout-modal';
        modal.className = 'success-message'; // Usa estilo global do style.css
        modal.style.display = 'none';
        
        modal.innerHTML = `
            <div class="success-content">
                <h3 class="mb-3" style="color: #0c0c0c;">Deseja Sair?</h3>
                <p class="mb-4">Você será desconectado da sua conta.</p>
                
                <div class="d-flex justify-content-center gap-2">
                    <button id="confirm-logout-btn" class="btn btn-warning fw-bold px-4">Sair</button>
                    <button id="cancel-logout-btn" class="btn btn-secondary fw-bold px-4">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Ações dos botões
        document.getElementById('confirm-logout-btn').addEventListener('click', () => {
            localStorage.removeItem('resolucity_session_v1');
            window.location.href = 'index.html';
        });

        document.getElementById('cancel-logout-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Exibe o modal
    modal.style.display = 'flex';
}