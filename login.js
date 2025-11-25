/* LPW2 - IMPLEMENTAÇÃO DO REQUISITO 5 */

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

    findUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    authenticate(email, password) {
        const users = this.getAllUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    }

    login(user) {
        const { password, ...safeUser } = user;
        localStorage.setItem(this.sessionKey, JSON.stringify(safeUser));
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.sessionKey));
    }

    logout() {
        localStorage.removeItem(this.sessionKey);
    }
}

const db = new UserDatabase();

/* API SIMULADA */
async function fetchUserDataFromAPI(name) {
    try {
        const firstName = name.split(' ')[0];
        const response = await fetch(`https://api.agify.io?name=${firstName}&country_id=BR`);
        if (!response.ok) throw new Error('Falha na API');
        const data = await response.json();
        return { estimatedAge: data.age || 'Não estimado' };
    } catch (error) {
        return { error: 'API indisponível' };
    }
}

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
    if (inputEl) inputEl.classList.add('error-field');
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.error-field').forEach(el => el.classList.remove('error-field'));
}

/* MODAL FUNCIONAL */
function showModal(title, message, redirectUrl = null) {
    const modal = document.getElementById('success-modal');
    if (!modal) {
        alert(message);
        if (redirectUrl) window.location.href = redirectUrl;
        return;
    }

    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    
    modal.style.display = 'flex'; // Exibe o modal corrigido

    document.getElementById('close-modal').onclick = () => {
        modal.style.display = 'none';
        if (redirectUrl) window.location.href = redirectUrl;
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const loginFormBox = document.getElementById('login-form');
    const registerFormBox = document.getElementById('register-form');
    
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

    // Verifica sessão ao entrar na página
    const currentUser = db.getCurrentUser();
    if (currentUser) {
        showModal('Sessão Ativa', `Olá, ${currentUser.name}! Você já está conectado.`, 'index.html');
    }

    // LOGIN
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                if (!email) showError('login-email', 'Informe seu e-mail');
                if (!password) showError('login-password', 'Informe sua senha');
                return;
            }

            const user = db.authenticate(email, password);

            if (user) {
                db.login(user);
                showModal('Sucesso!', 'Login realizado com sucesso.', 'index.html');
            } else {
                showError('login-password', 'E-mail ou senha incorretos.');
            }
        });
    }

    // CADASTRO
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearErrors();
            
            const btnSubmit = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = btnSubmit.textContent;
            btnSubmit.textContent = 'Processando...';
            btnSubmit.disabled = true;

            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;

            let hasError = false;

            if (name.length < 3) { showError('register-name', 'Mínimo 3 caracteres'); hasError = true; }
            if (!validateEmail(email)) { showError('register-email', 'E-mail inválido'); hasError = true; }
            if (password.length < 6) { showError('register-password', 'Mínimo 6 caracteres'); hasError = true; }
            if (db.findUserByEmail(email)) { showError('register-email', 'E-mail já cadastrado'); hasError = true; }

            if (hasError) {
                btnSubmit.textContent = originalBtnText;
                btnSubmit.disabled = false;
                return;
            }

            const apiData = await fetchUserDataFromAPI(name);
            
            const newUser = {
                name,
                email,
                password,
                metadata: apiData
            };

            db.saveUser(newUser);

            btnSubmit.textContent = originalBtnText;
            btnSubmit.disabled = false;

            showModal('Cadastro Realizado', 'Sua conta foi criada! Faça login para continuar.', null);
            
            registerForm.reset();
            registerFormBox.classList.add('d-none');
            loginFormBox.classList.remove('d-none');
        });
    }
});