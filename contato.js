class ContactFormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.fields = {
            name: {
                element: document.getElementById('name'),
                error: document.getElementById('nameError'),
                validate: (value) => this.validateName(value)
            },
            phone: {
                element: document.getElementById('phone'),
                error: document.getElementById('phoneError'),
                validate: (value) => this.validatePhone(value)
            },
            email: {
                element: document.getElementById('email'),
                error: document.getElementById('emailError'),
                validate: (value) => this.validateEmail(value)
            },
            message: {
                element: document.getElementById('message'),
                error: document.getElementById('messageError'),
                validate: (value) => this.validateMessage(value)
            }
        };

        this.init();
    }

    init() {
        this.applyMasks();
        this.addRealTimeValidation();
        if(this.form) this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    applyMasks() {
        if(this.fields.phone.element) {
            this.fields.phone.element.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) value = value.slice(0, 11);
                if (value.length <= 11) {
                    if (value.length <= 2) value = value.replace(/(\d{0,2})/, '($1');
                    else if (value.length <= 6) value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
                    else if (value.length <= 10) value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                    else value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                }
                e.target.value = value;
            });
        }
    }

    addRealTimeValidation() {
        Object.keys(this.fields).forEach(field => {
            if (this.fields[field].element) {
                this.fields[field].element.addEventListener('blur', () => this.validateField(field));
                this.fields[field].element.addEventListener('input', () => this.validateField(field));
            }
        });
    }

    validateField(fieldName) {
        const field = this.fields[fieldName];
        if(!field.element) return true;
        
        const value = field.element.value.trim();
        let isValid = true;
        let errorMessage = '';

        const validationResult = field.validate(value);
        
        if (validationResult !== true) {
            isValid = false;
            errorMessage = validationResult;
        }

        if (!isValid) this.showError(field, errorMessage);
        else this.clearError(field);

        return isValid;
    }

    validateName(value) {
        if (!value) return 'Por favor, informe seu nome';
        if (value.length < 3) return 'O nome deve ter pelo menos 3 caracteres';
        return true;
    }

    validatePhone(value) {
        if (!value) return 'Por favor, informe um telefone';
        const phone = value.replace(/\D/g, '');
        if (phone.length < 10) return 'Telefone inválido';
        return true;
    }

    validateEmail(value) {
        if (!value) return 'Por favor, informe um e-mail';
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(value)) return 'E-mail inválido';
        return true;
    }

    validateMessage(value) {
        if (!value) return 'Por favor, digite sua mensagem';
        if (value.length < 10) return 'A mensagem deve ter pelo menos 10 caracteres';
        return true;
    }

    showError(field, message) {
        if (field.error) {
            field.error.textContent = message;
            field.error.style.display = 'block';
        }
        field.element.classList.add('error-field');
    }

    clearError(field) {
        if (field.error) field.error.style.display = 'none';
        field.element.classList.remove('error-field');
    }

    validateAll() {
        let isValid = true;
        Object.keys(this.fields).forEach(fieldName => {
            if (!this.validateField(fieldName)) isValid = false;
        });
        return isValid;
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.validateAll()) {
            this.showSuccessMessage();
        }
    }

    showSuccessMessage() {
        // Cria elemento de sucesso
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        
        // HTML ATUALIZADO: Botão com classes do Bootstrap (btn-warning)
        successDiv.innerHTML = `
            <div class="success-content">
                <h3>Mensagem enviada com sucesso!</h3>
                <p>Entraremos em contato em breve. Obrigado!</p>
                <button type="button" id="close-success" class="btn btn-warning fw-bold px-4 mt-3">OK</button>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        document.getElementById('close-success').addEventListener('click', () => {
            document.body.removeChild(successDiv);
            this.form.reset();
            // Limpa erros visuais
            Object.keys(this.fields).forEach(f => this.clearError(this.fields[f]));
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ContactFormValidator('contactForm');
    
    // Menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});