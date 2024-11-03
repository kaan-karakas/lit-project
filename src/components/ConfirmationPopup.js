import { LitElement, html } from 'https://cdn.skypack.dev/lit';
import styles from '../styles/ConfirmationPopup.css' with { type: 'css' };
import translationsEn from '../locales/en.json' with { type: 'json' };
import translationsTr from '../locales/tr.json' with { type: 'json' };

export class ConfirmationPopup extends LitElement {
  static properties = {
    isOpen: { type: Boolean },
    message: { type: String },
    onConfirm: { type: Function },
    onCancel: { type: Function },
    language: { type: String },
    translations: { type: Object }
  };

  static styles = styles;

  constructor() {
    super();
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
    if (!this.isOpen) return null;

    return html`
      <div class="popup-overlay">
        <div class="popup-content">
          <p>${this.message}</p>
          <div class="popup-buttons">
            <button class="confirm-btn" @click=${this.handleConfirm}>${this.translations.confirm}</button>
            <button class="cancel-btn" @click=${this.handleCancel}>${this.translations.cancel}</button>
          </div>
        </div>
      </div>
    `;
  }

  handleConfirm() {
    if (this.onConfirm) this.onConfirm();
  }

  handleCancel() {
    if (this.onCancel) this.onCancel();
  }
}

customElements.define('confirmation-popup', ConfirmationPopup); 