import { LitElement, html } from 'https://cdn.skypack.dev/lit';
import { EmployeeStore } from '../store/EmployeeStore.js';
import styles from '../styles/EmployeeForm.css' with { type: 'css' };
import translationsEn from '../locales/en.json' with { type: 'json' };
import translationsTr from '../locales/tr.json' with { type: 'json' };
import './Toast.js';
import './ConfirmationPopup.js';

export class EmployeeForm extends LitElement {
  static styles = styles;
  static properties = {
    employee: { type: Object },
    language: { type: String },
    translations: { type: Object },
    showSaveConfirmDialog: { type: Boolean }
  };

  constructor() {
    super();

    this.employee = {};
    this.language = this.detectLanguage();
    this.translations = this.getTranslations();
    this.showSaveConfirmDialog = false;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('language-changed', this.handleLanguageChange.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('language-changed', this.handleLanguageChange.bind(this));
  }

  detectLanguage() {
    const lang = localStorage.getItem('language') || navigator.language || navigator.userLanguage;
    return lang.startsWith('tr') ? 'tr' : 'en';
  }

  getTranslations() {
    return this.language === 'tr' ? translationsTr : translationsEn;
  }

  handleLanguageChange(event) {
    this.language = event.detail;
    this.translations = this.getTranslations();
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="employee-form">
        <form @submit="${this.handleSubmit}">
          <label>${this.translations.first_name}</label>
          <input type="text" .value="${this.employee.firstName || ''}" 
            @input="${e => this.updateField('firstName', e)}" />

          <label>${this.translations.last_name}</label>
          <input type="text" .value="${this.employee.lastName || ''}" 
            @input="${e => this.updateField('lastName', e)}" />

          <label>${this.translations.date_of_employment}</label>
          <input type="date" .value="${this.employee.dateOfEmployment || ''}" 
            @input="${e => this.updateField('dateOfEmployment', e)}" />

          <label>${this.translations.date_of_birth}</label>
          <input type="date" .value="${this.employee.dateOfBirth || ''}" 
            @input="${e => this.updateField('dateOfBirth', e)}" />

          <label>${this.translations.phone}</label>
          <div class="phone-input">
            <span class="prefix">+90</span>
            <input 
              type="tel" 
              .value="${this.employee.phone ? this.employee.phone.replace('+90', '').replaceAll(' ', '') : ''}"
              @input="${this.handlePhoneInput}"
              maxlength="10"
              minlength="10"
              placeholder="5XX XXX XX XX"
            />
          </div>

          <label>${this.translations.email}</label>
          <input type="text" .value="${this.employee.email || ''}" @input="${e => this.updateField('email', e)}" />

          <label>${this.translations.department}</label>
          <select .value="${this.employee.department || ''}" @change="${e => this.updateField('department', e)}">
            <option value="">${this.translations.select_department}</option>
            <option value="Analytics">${this.translations.analytics}</option>
            <option value="Tech">${this.translations.tech}</option>
          </select>

          <label>${this.translations.position}</label>
          <select .value="${this.employee.position || ''}" @change="${e => this.updateField('position', e)}">
            <option value="">${this.translations.select_position}</option>
            <option value="Junior">${this.translations.junior}</option>
            <option value="Medior">${this.translations.medior}</option>
            <option value="Senior">${this.translations.senior}</option>
          </select>

          <div class="button-group">
            <button type="button" @click="${this.handleBack}" class="back-button">
              ${this.translations.back}
            </button>
            <button type="submit">
              ${this.employee.id ? this.translations.update : this.translations.save}
            </button>
          </div>
        </form>
        <toast-message></toast-message>
        
        <confirmation-popup
          .isOpen="${this.showSaveConfirmDialog}"
          message="${this.employee.id ? this.translations.update_confirmation : this.translations.save_confirmation}"
          .onConfirm="${() => this.saveEmployee()}"
          .onCancel="${() => this.showSaveConfirmDialog = false}"
        ></confirmation-popup>
      </div>
    `;
  }

  handlePhoneInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0 && !value.startsWith('5')) {
      value = '';
    }

    if (value.length > 3) {
      value = value.slice(0, 3) + ' ' + value.slice(3);
    }
    if (value.length > 7) {
      value = value.slice(0, 7) + ' ' + value.slice(7);
    }
    if (value.length > 10) {
      value = value.slice(0, 10) + ' ' + value.slice(10);
    }
    
    e.target.value = value;
    
    const digits = value.replace(/\s/g, '');

    if (digits.length <= 10) {
      this.updateField('phone', { target: { value: digits ? '+90 ' + value : '' } });
    }
  }

  updateField(field, event) {
    this.employee = { ...this.employee, [field]: event.target.value };
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        window.dispatchEvent(new CustomEvent('show-toast', {
            detail: {
              message: this.translations.invalid_email,
              type: 'error'
            }
          }));
          return false;
    }

    const isDuplicate = EmployeeStore.employees.some(emp => 
      emp.email === email && emp.id !== this.employee.id
    );

    if (isDuplicate) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: this.translations.email_exists,
          type: 'error'
        }
      }));
      return false;
    }

    return true;
  }

  validatePhone(phone) {
    phone = phone?.replaceAll(' ', '');

    if (!phone || phone.length !== 13 || !phone.startsWith('+905')) {
        window.dispatchEvent(new CustomEvent('show-toast', {
            detail: {
              message: this.translations.invalid_phone,
              type: 'error'
            }
          }));
          return false;
    }

    const isDuplicate = EmployeeStore.employees.some(emp => {
        return emp.phone.replaceAll(' ', '') === phone.replaceAll(' ', '') && emp.id !== this.employee.id
    });

    if (isDuplicate) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: this.translations.phone_exists,
          type: 'error'
        }
      }));
      return false;
    }

    return true;
  }

  handleSubmit(event) {
    event.preventDefault();

    const requiredFields = ['firstName', 'lastName', 'dateOfEmployment', 'dateOfBirth', 'phone', 'email', 'department',
      'position'];
    const hasEmptyFields = requiredFields.some(field => !this.employee[field]);

    if (hasEmptyFields) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: this.translations.fill_all_fields,
          type: 'error'
        }
      }));
      return;
    }

    if (!this.validatePhone(this.employee.phone)) {
      return;
    }

    if (!this.validateEmail(this.employee.email)) {
      return;
    }

    this.showSaveConfirmDialog = true;
  }

  saveEmployee() {
    this.showSaveConfirmDialog = false;

    if (this.employee.id) {
      EmployeeStore.updateEmployee(this.employee);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: this.translations.employee_updated_success,
          type: 'success'
        }
      }));
    } else {
      EmployeeStore.addEmployee(this.employee);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: this.translations.employee_added_success,
          type: 'success'
        }
      }));
    }

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate', { detail: '/' }));
    }, 1000);
  }

  handleBack() {
    window.dispatchEvent(new CustomEvent('navigate', { detail: '/' }));
  }
}

customElements.define('employee-form', EmployeeForm);
