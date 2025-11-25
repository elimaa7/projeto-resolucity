/* RELATAR.JS - VERSÃO FINAL (Botão OK -> Home)
   1. Validação
   2. Integração Login/API
   3. Salvamento LocalStorage
*/

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        this.fields = {
            name: { el: document.getElementById('name'), errorId: 'nameError' },
            cpf: { el: document.getElementById('cpf'), errorId: 'cpfError' },
            nascimento: { el: document.getElementById('nascimento'), errorId: 'nascimentoError' },
            phone: { el: document.getElementById('phone'), errorId: 'phoneError' },
            email: { el: document.getElementById('email'), errorId: 'emailError' },
            categoria: { el: document.getElementById('categoria'), errorId: 'categoriaError' },
            cep: { el: document.getElementById('cep'), errorId: 'cepError' }, 
            endereco: { el: document.getElementById('endereco'), errorId: 'enderecoError' },
            message: { el: document.getElementById('message'), errorId: 'messageError' },
            foto: { el: document.getElementById('foto'), errorId: 'fotoError' }
        };

        this.init();
        this.checkUserSession();
        this.fetchWeather(); 
    }

    init() {
        this.applyMasks();
        this.addRealTimeValidation();

        if (this.fields.cep.el) {
            this.fields.cep.el.addEventListener('blur', (e) => this.fetchAddressByCEP(e.target.value));
        }

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    addRealTimeValidation() {
        Object.keys(this.fields).forEach(key => {
            const field = this.fields[key];
            if (field && field.el) {
                const eventType = (field.el.tagName === 'SELECT' || field.el.type === 'file') ? 'change' : 'input';
                field.el.addEventListener(eventType, () => this.clearFieldError(key));
            }
        });
    }

    async fetchWeather() {
        const widget = document.getElementById('weather-widget');
        if(!widget) return;
        const tempDisplay = document.getElementById('temp-display');
        const descDisplay = document.getElementById('weather-desc');
        
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=-22.52&longitude=-44.10&current_weather=true`);
            const data = await response.json();
            
            if (data.current_weather) {
                tempDisplay.textContent = `${data.current_weather.temperature}°C`;
                descDisplay.textContent = this.getWeatherDescription(data.current_weather.weathercode);
                widget.classList.remove('d-none');
            }
        } catch (error) { console.error(error); }
    }

    getWeatherDescription(code) {
        if (code === 0) return "Céu Limpo";
        if (code <= 3) return "Nublado";
        if (code <= 67) return "Chuvoso";
        return "Instável";
    }

    checkUserSession() {
        const sessionUser = localStorage.getItem('resolucity_session_v1');
        if (sessionUser) {
            try {
                const user = JSON.parse(sessionUser);
                if (this.fields.name.el) this.fields.name.el.value = user.name || '';
                if (this.fields.email.el) {
                    this.fields.email.el.value = user.email || '';
                    this.fields.email.el.readOnly = true;
                    this.fields.email.el.style.backgroundColor = "#e9ecef";
                }
            } catch (e) {}
        }
    }

    async fetchAddressByCEP(cep) {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        if (this.fields.endereco.el) {
            this.fields.endereco.el.value = "Buscando endereço...";
            this.fields.endereco.el.disabled = true;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (data.erro) {
                this.showFieldError('cep', 'CEP não encontrado.');
                if (this.fields.endereco.el) {
                    this.fields.endereco.el.value = "";
                    this.fields.endereco.el.disabled = false;
                }
            } else {
                this.clearFieldError('cep');
                if (this.fields.endereco.el) {
                    this.fields.endereco.el.value = `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`;
                    this.fields.endereco.el.disabled = false;
                    this.clearFieldError('endereco');
                }
            }
        } catch (error) {
            if (this.fields.endereco.el) {
                this.fields.endereco.el.value = "";
                this.fields.endereco.el.disabled = false;
            }
            this.showFieldError('cep', 'Erro ao buscar CEP.');
        }
    }

    applyMasks() {
        if (this.fields.cpf.el) this.fields.cpf.el.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = v;
        });
        if (this.fields.phone.el) this.fields.phone.el.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2');
            e.target.value = v;
        });
        if (this.fields.cep.el) this.fields.cep.el.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 8) v = v.slice(0, 8);
            v = v.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = v;
        });
    }

    showFieldError(fieldKey, message) {
        const field = this.fields[fieldKey];
        const errorEl = document.getElementById(field.errorId);
        if (errorEl && field.el) {
            errorEl.textContent = message;
            errorEl.classList.add('show');
            field.el.classList.add('error-field');
        }
    }

    clearFieldError(fieldKey) {
        const field = this.fields[fieldKey];
        const errorEl = document.getElementById(field.errorId);
        if (errorEl && field.el) {
            errorEl.classList.remove('show');
            field.el.classList.remove('error-field');
        }
    }

    validateField(fieldKey) {
        const field = this.fields[fieldKey];
        if (!field || !field.el) return true;
        const value = field.el.value.trim();
        let message = '';

        if(fieldKey === 'name' && value.length < 3) message = 'Nome muito curto.';
        if(fieldKey === 'cpf' && value.length < 14) message = 'CPF inválido.';
        if(fieldKey === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'E-mail inválido.';
        if(fieldKey === 'categoria' && !value) message = 'Selecione uma categoria.';
        if(fieldKey === 'endereco' && value.length < 5) message = 'Endereço inválido.';
        if(fieldKey === 'message' && value.length < 10) message = 'Descrição muito curta.';

        if (message) {
            this.showFieldError(fieldKey, message);
            return false;
        } else {
            this.clearFieldError(fieldKey);
            return true;
        }
    }

    saveReportToStorage() {
        const sessionUser = localStorage.getItem('resolucity_session_v1');
        let userId = 'anonym';
        
        if (sessionUser) {
            const user = JSON.parse(sessionUser);
            userId = user.email;
        }

        const newReport = {
            id: Date.now(),
            userId: userId,
            category: this.fields.categoria.el.value,
            address: this.fields.endereco.el.value,
            description: this.fields.message.el.value,
            date: new Date().toLocaleDateString('pt-BR'),
            status: 'Em Análise'
        };

        const reports = JSON.parse(localStorage.getItem('resolucity_reports_v1') || '[]');
        reports.push(newReport);
        localStorage.setItem('resolucity_reports_v1', JSON.stringify(reports));
    }

    handleSubmit(e) {
        e.preventDefault();
        let isValid = true;
        const keys = Object.keys(this.fields).filter(k => k !== 'foto');
        
        keys.forEach(key => {
            if (!this.validateField(key)) isValid = false;
        });

        if (isValid) {
            this.saveReportToStorage();
            this.showSuccess();
        }
    }

    showSuccess() {
        let successDiv = document.querySelector('.success-message');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            
            // --- ALTERAÇÃO AQUI: BOTÃO OK QUE VAI PARA HOME ---
            successDiv.innerHTML = `
                <div class="success-content">
                    <h3>Relato Enviado!</h3>
                    <p>Seu relato foi salvo com sucesso.</p>
                    <button class="btn btn-warning fw-bold px-4 mt-3" onclick="window.location.href='index.html'">OK</button>
                </div>
            `;
            document.body.appendChild(successDiv);
        } else {
            successDiv.style.display = 'flex';
        }
        this.form.reset();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FormValidator('contactForm');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
    }
});