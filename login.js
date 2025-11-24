class UserDatabase {
    constructor() {
        this.dbKey = 'resolucity_users_v1';
        this.sessionKey = 'resolucity_session_v1';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.dbKey)) {
            localStorage.setItem(this.dbKey, JSON.stringify([]));
        }
    }

    saveUser(user) {
        const users = this.getAllUsers();
        const newUser = { ...user, id: Date.now(), createdAt: new Date().toISOString() };
        users.push(newUser);
        localStorage.setItem(this.dbKey, JSON.stringify(users));
        return newUser;
    }

    getAllUsers() {
        return JSON.parse(localStorage.getItem(this.dbKey) || '[]');
    }

    // READ: Busca usuário por email
    findUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    // AUTH: Valida credenciais
    authenticate(email, password) {
        const users = this.getAllUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    }

    // SESSION: Salva usuário logado
    login(user) {
        // Remove a senha antes de salvar na sessão por segurança
        const { password, ...safeUser } = user;
        localStorage.setItem(this.sessionKey, JSON.stringify(safeUser));
    }

    // SESSION: Retorna usuário logado
    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.sessionKey));
    }

    // SESSION: Logout
    logout() {
        localStorage.removeItem(this.sessionKey);
    }
}

// Instância do Banco de Dados
const db = new UserDatabase();

// Função para consumir uma API externa durante o cadastro
// Usaremos a Agify.io para estimar a idade baseada no nome
async function fetchUserDataFromAPI(name) {
    try {
        const firstName = name.split(' ')[0];
        const response = await fetch(`https://api.agify.io?name=${firstName}&country_id=BR`);
        if (!response.ok) throw new Error('Falha na API');
        const data = await response.json();
        return {
            estimatedAge: data.age || 'Não estimado',
            apiSyncDate: new Date().toISOString()
        };
    } catch (error) {
        console.warn('Erro ao consumir API externa:', error);
        return { error: 'API indisponível no momento' };
    }
}

/* --- VALIDAÇÕES DE FORMULÁRIO --- */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
    if (inputEl) {
        inputEl.classList.add('error-field');
    }
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
}

/* --- MODAL DE SUCESSO --- */
function showModal(title, message, redirectUrl = null) {
    const modal = document.getElementById('success-modal');
    if (!modal) return alert(message);

    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    
    modal.style.display = 'flex';

    document.getElementById('close-modal').onclick = () => {
        modal.style.display = 'none';
        if (redirectUrl) window.location.href = redirectUrl;
    };
}

/* --- EVENTOS DA DOM --- */
document.addEventListener('DOMContentLoaded', () => {

    // 1. Controle de alternância entre Login e Cadastro
    const loginFormBox = document.getElementById('login-form');
    const registerFormBox = document.getElementById('register-form');
    
    // Links para alternar
    document.getElementById('show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormBox.classList.add('d-none');
        registerFormBox.classList.remove('d-none');
        clearErrors();
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        registerFormBox.classList.add('d-none');
        loginFormBox.classList.remove('d-none');
        clearErrors();
    });

    // 2. Verifica se já está logado
    const currentUser = db.getCurrentUser();
    if (currentUser) {
        // Se estiver na página de login, avisa e redireciona ou mostra estado
        showModal('Sessão Ativa', `Olá, ${currentUser.name}! Você já está conectado.`, 'index.html');
    }

    // 3. LOGIN - SUBMIT
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            // Validação simples
            if (!email || !password) {
                if (!email) showError('login-email', 'Informe seu e-mail');
                if (!password) showError('login-password', 'Informe sua senha');
                return;
            }

            // Busca no "Banco de Dados"
            const user = db.authenticate(email, password);

            if (user) {
                db.login(user);
                showModal('Sucesso!', 'Login realizado com sucesso.', 'index.html');
            } else {
                showError('login-password', 'E-mail ou senha incorretos.');
            }
        });
    }

    // 4. CADASTRO - SUBMIT
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();
            
            // UI Feedback de carregamento
            const btnSubmit = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = btnSubmit.textContent;
            btnSubmit.textContent = 'Processando...';
            btnSubmit.disabled = true;

            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;

            let hasError = false;

            // Validações locais
            if (name.length < 3) {
                showError('register-name', 'Nome deve ter no mínimo 3 caracteres');
                hasError = true;
            }
            if (!validateEmail(email)) {
                showError('register-email', 'E-mail inválido');
                hasError = true;
            }
            if (password.length < 6) {
                showError('register-password', 'Senha deve ter no mínimo 6 caracteres');
                hasError = true;
            }

            // Verifica duplicidade no LocalStorage
            if (db.findUserByEmail(email)) {
                showError('register-email', 'Este e-mail já está cadastrado');
                hasError = true;
            }

            if (hasError) {
                btnSubmit.textContent = originalBtnText;
                btnSubmit.disabled = false;
                return;
            }

            // Buscamos dados extras da API para compor o objeto do usuário
            const apiData = await fetchUserDataFromAPI(name);
            
            // Cria objeto do usuário unindo dados do form + dados da API
            const newUser = {
                name,
                email,
                password, // Em produção, criptografaríamos isso
                metadata: apiData // Dados vindos da API externa
            };

            // Salva no LocalStorage
            db.saveUser(newUser);

            // Restaura botão
            btnSubmit.textContent = originalBtnText;
            btnSubmit.disabled = false;

            showModal('Cadastro Realizado', 'Sua conta foi criada! Faça login para continuar.', null);
            
            // Troca para tela de login automaticamente
            registerForm.reset();
            registerFormBox.classList.add('d-none');
            loginFormBox.classList.remove('d-none');
        });
    }
});
