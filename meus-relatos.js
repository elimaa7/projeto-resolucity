/* MEUS-RELATOS.JS
   Lógica para listar os relatos do usuário logado
*/

document.addEventListener('DOMContentLoaded', () => {
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

    // 2. Buscar Relatos no Banco Local
    const allReports = JSON.parse(localStorage.getItem('resolucity_reports_v1') || '[]');
    
    // 3. Filtrar apenas os relatos deste usuário
    const myReports = allReports.filter(report => report.userId === userEmail);

    // 4. Renderizar
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
        // Ordenar por data (mais recente primeiro) - Opcional, assume ID como timestamp
        myReports.sort((a, b) => b.id - a.id);

        let html = '';
        myReports.forEach(report => {
            html += `
                <div class="card report-card shadow-sm bg-white">
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
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
});