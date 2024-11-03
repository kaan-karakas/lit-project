import { LitElement, html } from 'https://cdn.skypack.dev/lit';
import { EmployeeStore } from '../store/EmployeeStore.js';
import './ConfirmationPopup.js';
import styles from '../styles/EmployeeActions.css' with { type: 'css' };
import translationsEn from '../locales/en.json' with { type: 'json' };
import translationsTr from '../locales/tr.json' with { type: 'json' };
import './Toast.js';

export class EmployeeActions extends LitElement {
  static properties = {
    employee: { type: Object },
    showConfirmDialog: { type: Boolean },
    language: { type: String },
    translations: { type: Object }
  };

  static styles = styles

  constructor() {
    super();
    this.showConfirmDialog = false;
    this.language = this.detectLanguage();
    this.translations = this.getTranslations();
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
      <div class="actions-wrapper">
        <button class="edit" @click="${this.editEmployee}">
          <img src="/src/assets/image/edit.png" alt="Edit">
        </button>
        <button class="delete" @click="${this.showDeleteConfirmation}">
          <img src="/src/assets/image/trash.png" alt="Delete">
        </button>
      </div>

      <confirmation-popup
        .isOpen="${this.showConfirmDialog}"
        message="${this.translations.delete_confirmation}"
        .onConfirm="${() => this.confirmDelete()}"
        .onCancel="${() => this.cancelDelete()}"
      ></confirmation-popup>
      <toast-message></toast-message>
    `;
  }

  showDeleteConfirmation() {
    this.showConfirmDialog = true;
  }

  confirmDelete() {
    EmployeeStore.deleteEmployee(this.employee.id);
    this.showConfirmDialog = false;

    window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: this.translations.employee_success_deleted,
          type: 'success'
        }
      }));
  }

  cancelDelete() {
    this.showConfirmDialog = false;
  }

  editEmployee() {
    window.location.href = `/edit/${this.employee.id}`;
  }
}

customElements.define('employee-actions', EmployeeActions);
