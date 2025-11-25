/* RELATAR.JS - CORRIGIDO (Limpa erros em tempo real) */

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        // Mapeamento de campos
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

    // --- INICIALIZAÇÃO ---
    init() {
        this.applyMasks();
        this.addRealTimeValidation(); // <--- NOVA FUNÇÃO ADICIONADA

        // Busca CEP no Blur (quando sai do campo)
        if (this.fields.cep.el) {
            this.fields.cep.el.addEventListener('blur', (e) => {
                this.fetchAddressByCEP(e.target.value);
            });
        }

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // --- CORREÇÃO: LIMPA ERROS ENQUANTO DIGITA/SELECIONA ---
    addRealTimeValidation() {
        Object.keys(this.fields).forEach(key => {
            const field = this.fields[key];
            if (field && field.el) {
                // Define qual evento ouvir: 'change' para selects/arquivos, 'input' para textos
                const eventType = (field.el.tagName === 'SELECT' || field.el.type === 'file') ? 'change' : 'input';
                
                field.el.addEventListener(eventType, () => {
                    this.clearFieldError(key);
                });
            }
        });
    }

    // --- REQUISITO: API DE CLIMA (OPEN-METEO) ---
    async fetchWeather() {
        const widget = document.getElementById('weather-widget');
        const tempDisplay = document.getElementById('temp-display');
        const descDisplay = document.getElementById('weather-desc');
        
        const lat = -22.5232;
        const lon = -44.1041;

        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await response.json();
            
            if (data.current_weather) {
                const temp = data.current_weather.temperature;
                const code = data.current_weather.weathercode;
                const description = this.getWeatherDescription(code);

                tempDisplay.textContent = `${temp}°C`;
                descDisplay.textContent = description;
                widget.classList.remove('d-none');
            }
        } catch (error) {
            console.error("Erro ao carregar clima:", error);
        }
    }

    getWeatherDescription(code) {
        if (code === 0) return "Céu Limpo";
        if (code >= 1 && code <= 3) return "Parcialmente Nublado";
        if (code >= 45 && code <= 48) return "Nevoeiro";
        if (code >= 51 && code <= 67) return "Chuva Fraca/Moderada";
        if (code >= 80 && code <= 99) return "Chuva Forte / Tempestade";
        return "Clima Variável";
    }

    // --- INTEGRAÇÃO COM LOGIN ---
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
            } catch (e) {
                console.error("Erro sessão", e);
            }
        }
    }

    // --- API VIACEP ---
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
                    this.clearFieldError('endereco'); // Limpa erro de endereço se existir
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
        if (this.fields.cpf.el) {
            this.fields.cpf.el.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 11) v = v.slice(0, 11);
                v = v.replace(/(\d{3})(\d)/, '$1.$2');
                v = v.replace(/(\d{3})(\d)/, '$1.$2');
                v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = v;
            });
        }
        if (this.fields.phone.el) {
            this.fields.phone.el.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 11) v = v.slice(0, 11);
                v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
                v = v.replace(/(\d)(\d{4})$/, '$1-$2');
                e.target.value = v;
            });
        }
        if (this.fields.cep.el) {
            this.fields.cep.el.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 8) v = v.slice(0, 8);
                v = v.replace(/(\d{5})(\d)/, '$1-$2');
                e.target.value = v;
            });
        }
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

        switch(fieldKey) {
            case 'name':
                if (value.length < 3) message = 'Nome deve ter pelo menos 3 caracteres.';
                break;
            case 'cpf':
                if (value.length < 14) message = 'CPF incompleto.';
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'E-mail inválido.';
                break;
            case 'categoria':
                if (!value) message = 'Selecione uma categoria.';
                break;
            case 'cep':
                if (value && value.length < 9) message = 'CEP incompleto.';
                break;
            case 'endereco':
                if (value.length < 5) message = 'Endereço muito curto.';
                break;
            case 'message':
                if (value.length < 10) message = 'Descreva melhor o problema.';
                break;
            case 'phone':
                if (value.length < 14) message = 'Telefone inválido.';
                break;
            case 'nascimento':
                if (!value) message = 'Data obrigatória.';
                break;
        }

        if (message) {
            this.showFieldError(fieldKey, message);
            return false;
        } else {
            this.clearFieldError(fieldKey);
            return true;
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        let isValid = true;
        const keys = Object.keys(this.fields).filter(k => k !== 'foto');
        
        keys.forEach(key => {
            if (!this.validateField(key)) isValid = false;
        });

        if (isValid) {
            this.showSuccess();
        }
    }

    showSuccess() {
        let successDiv = document.querySelector('.success-message');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.innerHTML = `
                <div class="success-content">
                    <h3>Relato Enviado!</h3>
                    <p>Seu relato foi registrado com sucesso.</p>
                    <button onclick="document.querySelector('.success-message').remove(); location.href='index.html'">OK</button>
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
});