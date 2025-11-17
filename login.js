//Simulação do banco de dados

class UserDatabase {
    constructor() {
        this.storageKey = 'resolucity_users';
        this.currentUserKey = 'resolucity_current_user';
    }

    // Inicializa o banco de dados se não existir
    init() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    // Retorna todos os usuários
    getAllUsers() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    // Salva um novo usuário
    saveUser(user) {
        const users = this.getAllUsers();
        users.push({
            id: Date.now(),
            ...user,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(this.storageKey, JSON.stringify(users));
        return true;
    }

    // Verifica se o email já existe
    emailExists(email) {
        const users = this.getAllUsers();
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // Busca usuário por email e senha
    findUser(email, password) {
        const users = this.getAllUsers();
        return users.find(user => 
            user.email.toLowerCase() === email.toLowerCase() && 
            user.password === password
        );
    }

    // Salva o usuário logado
    setCurrentUser(user) {
        const userToStore = { ...user };
        delete userToStore.password; // Não armazena senha no usuário atual
        localStorage.setItem(this.currentUserKey, JSON.stringify(userToStore));
    }

    // Retorna o usuário logado
    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.currentUserKey) || 'null');
    }

    // Remove o usuário logado (logout)
    clearCurrentUser() {
        localStorage.removeItem(this.currentUserKey);
    }
}

// Instancia o banco de dados
const db = new UserDatabase();
db.init();

//Consumo da api, validação de email

async function validateEmailAPI(email) {
    try {
        // Usando a API do Hunter.io para validar formato
        // Esta é uma validação adicional via API pública
        const response = await fetch(`https://api.eva.pingutil.com/email?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        
        return {
            valid: data.status === 'success' && data.data.deliverable,
            message: data.status === 'success' ? 'Email válido' : 'Email pode ser inválido'
        };
    } catch (error) {
        // Se a API falhar, aceita a validação local
        console.log('API de validação indisponível, usando validação local');
        return { valid: true, message: 'Validação local' };
    }
}

//Validações gerais

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateName(name) {
    return name.trim().length >= 3;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    
    field.classList.add('error-field');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);
    
    field.classList.remove('error-field');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}

function clearAllErrors(formId) {
    const form = document.getElementById(formId);
    const errorFields = form.querySelectorAll('.error-field');
    const errorMessages = form.querySelectorAll('.error.show');
    
    errorFields.forEach(field => field.classList.remove('error-field'));
    errorMessages.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
    });
}

//Modal de sucesso

function showSuccessModal(title, message, callback) {
    const modal = document.getElementById('success-modal');
    const titleElement = document.getElementById('success-title');
    const messageElement = document.getElementById('success-message');
    
    titleElement.textContent = title;
    messageElement.textContent = message;
    modal.style.display = 'flex';
    
    const closeButton = document.getElementById('close-modal');
    closeButton.onclick = () => {
        modal.style.display = 'none';
        if (callback) callback();
    };
}

//Alternar entre login e cadastro

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');

    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
        clearAllErrors('loginForm');
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('d-none');
        loginForm.classList.remove('d-none');
        clearAllErrors('registerForm');
    });

    // Verifica se já há usuário logado
    const currentUser = db.getCurrentUser();
    if (currentUser) {
        showSuccessModal(
            'Bem-vindo de volta!',
            `Você já está logado como ${currentUser.name}.`,
        );
    }
});

//Formulário de login

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearAllErrors('loginForm');

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    let hasError = false;

    // Validações
    if (!email) {
        showError('login-email', 'Por favor, insira seu e-mail');
        hasError = true;
    } else if (!validateEmail(email)) {
        showError('login-email', 'E-mail inválido');
        hasError = true;
    }

    if (!password) {
        showError('login-password', 'Por favor, insira sua senha');
        hasError = true;
    }

    if (hasError) return;

    // Busca o usuário no banco
    const user = db.findUser(email, password);

    if (!user) {
        showError('login-email', 'E-mail ou senha incorretos');
        showError('login-password', 'E-mail ou senha incorretos');
        return;
    }

    // Login bem-sucedido
    db.setCurrentUser(user);
    
    showSuccessModal(
        'Login realizado!',
        `Bem-vindo de volta, ${user.name}!`,
        () => {
            window.location.href = 'index.html';
        }
    );
});

//Formulário de cadastro

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearAllErrors('registerForm');

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    
    let hasError = false;

    // Validações
    if (!name) {
        showError('register-name', 'Por favor, insira seu nome completo');
        hasError = true;
    } else if (!validateName(name)) {
        showError('register-name', 'Nome deve ter pelo menos 3 caracteres');
        hasError = true;
    }

    if (!email) {
        showError('register-email', 'Por favor, insira seu e-mail');
        hasError = true;
    } else if (!validateEmail(email)) {
        showError('register-email', 'E-mail inválido');
        hasError = true;
    } else if (db.emailExists(email)) {
        showError('register-email', 'Este e-mail já está cadastrado');
        hasError = true;
    }

    if (!password) {
        showError('register-password', 'Por favor, insira uma senha');
        hasError = true;
    } else if (!validatePassword(password)) {
        showError('register-password', 'Senha deve ter pelo menos 6 caracteres');
        hasError = true;
    }

    if (hasError) return;

    // Salva o novo usuário
    const newUser = {
        name,
        email,
        password
    };

    db.saveUser(newUser);
    
    showSuccessModal(
        'Cadastro realizado!',
        'Sua conta foi criada com sucesso. Faça login para continuar.',
        () => {
            // Limpa o formulário
            document.getElementById('registerForm').reset();
            // Volta para o login
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
        }
    );
});

// Menu mobile toggle

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }
});