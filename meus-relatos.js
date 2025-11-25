/* MEUS-RELATOS.JS - CORRIGIDO (Modal Personalizado)
   Lógica para listar e EXCLUIR os relatos com modal bonito
*/

document.addEventListener('DOMContentLoaded', () => {
    renderReports();
});

function renderReports() {
    const container = document.getElementById('reports-container');
    
    // 1. Verificar Login
    const sessionUser = localStorage.getItem('resolucity_session_v1');
    
    if (!sessionUser) {
        container.innerHTML = `
            <div class="text-center p-5 bg-white rounded shadow-sm">
                <i class="bi bi-lock-fill fs-1 text-warning"></i>
                <h4 class="mt-3">Acesso Restrito</h4>
                <p>Você precisa estar logado para ver seus relatos.</p>
                <a href="login.html" class="btn btn-warning fw-bold mt-2">Fazer Login</a>
            </div>
        `;
        return;
    }

    const user = JSON.parse(sessionUser);
    const userEmail = user.email;

    // 2. Buscar Relatos
    const allReports = JSON.parse(localStorage.getItem('resolucity_reports_v1') || '[]');
    const myReports = allReports.filter(report => report.userId === userEmail);

    // 3. Renderizar
    if (myReports.length === 0) {
        container.innerHTML = `
            <div class="text-center p-5 bg-white rounded shadow-sm">
                <i class="bi bi-inbox fs-1 text-muted"></i>
                <h4 class="mt-3">Nenhum relato encontrado</h4>
                <p>Você ainda não fez nenhum relato de problema urbano.</p>
                <a href="relatar.html" class="btn btn-warning fw-bold mt-2">Fazer meu primeiro relato</a>
            </div>
        `;
    } else {
        myReports.sort((a, b) => b.id - a.id);

        let html = '';
        myReports.forEach(report => {
            html += `
                <div class="card report-card shadow-sm bg-white mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start flex-wrap">
                            <div>
                                <h5 class="card-title fw-bold text-dark mb-1">
                                    <i class="bi bi-geo-alt-fill text-warning me-2"></i>${report.category}
                                </h5>
                                <p class="text-muted small mb-2">
                                    <i class="bi bi-calendar me-1"></i> ${report.date}
                                </p>
                            </div>
                            <span class="status-badge status-analise">
                                ${report.status || 'Em Análise'}
                            </span>
                        </div>
                        <hr class="my-2 opacity-25">
                        <p class="card-text text-secondary mb-1">
                            <strong>Local:</strong> ${report.address}
                        </p>
                        <p class="card-text">
                            ${report.description}
                        </p>
                        
                        <div class="d-flex justify-content-end mt-3">
                            <button onclick="showDeleteModal(${report.id})" class="btn btn-sm btn-outline-danger fw-bold">
                                <i class="bi bi-trash-fill me-1"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
}

// --- MODAL DE EXCLUSÃO PERSONALIZADO ---
window.showDeleteModal = function(id) {
    // Remove modal anterior se existir
    let existingModal = document.getElementById('delete-confirm-modal');
    if (existingModal) existingModal.remove();

    // Cria o modal dinamicamente
    const modal = document.createElement('div');
    modal.id = 'delete-confirm-modal';
    modal.className = 'success-message'; // Reusa o estilo global de modal
    
    modal.innerHTML = `
        <div class="success-content">
            <h3 class="text-danger mb-3 fw-bold">Excluir Relato?</h3>
            <p class="mb-4 text-muted">Essa ação não pode ser desfeita. Tem certeza?</p>
            
            <div class="d-flex justify-content-center gap-3">
                <button id="btn-confirm-delete" class="btn btn-danger fw-bold px-4">Excluir</button>
                <button id="btn-cancel-delete" class="btn btn-secondary fw-bold px-4">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Exibe o modal
    modal.style.display = 'flex';

    // Ação Confirmar
    document.getElementById('btn-confirm-delete').onclick = () => {
        deleteReport(id);
        modal.remove();
    };

    // Ação Cancelar
    document.getElementById('btn-cancel-delete').onclick = () => {
        modal.remove();
    };
};

// Função que realmente apaga (chamada pelo modal)
function deleteReport(id) {
    const allReports = JSON.parse(localStorage.getItem('resolucity_reports_v1') || '[]');
    const updatedReports = allReports.filter(report => report.id !== id);
    localStorage.setItem('resolucity_reports_v1', JSON.stringify(updatedReports));
    renderReports(); // Atualiza a lista na tela
}