import { LitElement, html } from 'https://cdn.skypack.dev/lit';
import styles from '../styles/NavigationMenu.css' with { type: 'css' };
import translationsEn from '../locales/en.json' with { type: 'json' };
import translationsTr from '../locales/tr.json' with { type: 'json' };

export class NavigationMenu extends LitElement {
  static styles = styles;

  static properties = {
    language: { type: String },
    translations: { type: Object }
  };

  constructor() {
    super();
    this.language = this.getStoredLanguage();
    this.translations = this.getTranslations();
  }

  getStoredLanguage() {
    const storedLang = localStorage.getItem('language');
    if (storedLang) {
      return storedLang;
    }
    const lang = navigator.language || navigator.userLanguage;
    return lang.startsWith('tr') ? 'tr' : 'en';
  }

  getTranslations() {
    return this.language === 'tr' ? translationsTr : translationsEn;
  }

  setLanguage(event) {
    this.language = event.target.value;
    this.translations = this.getTranslations();
    localStorage.setItem('language', this.language);

    window.dispatchEvent(new CustomEvent('language-changed', { detail: this.language }));
  }
  render() {
    return html`
      <nav class="navbar">
        <div class="navbar-logo">
          <img src="/src/assets/image/ing.png" alt="Logo" class="logo" />
          <span>ING</span>
        </div>
        <div class="navbar-links">
          <a href="/" class="link">
            <img src="/src/assets/image/list.png" alt="Employee List Icon" class="icon" />
            ${this.translations.employee_list}
          </a>
          <a href="/add" class="add-link">
            <img src="/src/assets/image/plus.png" alt="Add Employee Icon" class="icon" />
            ${this.translations.add_employee}
          </a>
          <div class="language-selector">
            <button @click="${() => this.changeLanguage('en')}" class="flag-button">
              <img src="/src/assets/image/en.png" alt="English" class="flag-icon" />
            </button>
            <button @click="${() => this.changeLanguage('tr')}" class="flag-button">
              <img src="/src/assets/image/tr.png" alt="Turkish" class="flag-icon" />
            </button>
          </div>
        </div>
      </nav>
    `;
  }

  changeLanguage(lang) {
    this.language = lang;
    this.translations = this.getTranslations();
    localStorage.setItem('language', this.language);
    window.dispatchEvent(new CustomEvent('language-changed', { detail: this.language }));
  }
}

customElements.define('navigation-menu', NavigationMenu);
