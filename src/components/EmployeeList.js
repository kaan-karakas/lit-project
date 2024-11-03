import { LitElement, html } from 'https://cdn.skypack.dev/lit';
import { EmployeeStore } from '../store/EmployeeStore.js';
import './EmployeeActions.js';
import styles from '../styles/EmployeeList.css' with { type: 'css' };
import translationsEn from '../locales/en.json' with { type: 'json' };
import translationsTr from '../locales/tr.json' with { type: 'json' };

export class EmployeeList extends LitElement {
  static styles = styles;

  static properties = {
    employees: { type: Array },
    searchTerm: { type: String },
    currentPage: { type: Number },
    language: { type: String },
    translations: { type: Object },
    viewMode: { type: String },
  };

  constructor() {
    super();
    this.employees = EmployeeStore.getEmployees();
    this.searchTerm = '';
    this.currentPage = 1;
    this.language = this.detectLanguage();
    this.translations = this.getTranslations();
    this.viewMode = 'table';
    EmployeeStore.subscribe(this.updateEmployees.bind(this));
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('language-changed', this.handleLanguageChange.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('language-changed', this.handleLanguageChange.bind(this));
    EmployeeStore.unsubscribe(this.updateEmployees.bind(this));
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

  handleViewToggle(mode) {
    this.viewMode = mode;
  }

  updateEmployees(employees) {
    this.employees = employees;
  }

  formatPhoneNumber(phone) {
    return phone.startsWith('+90') ? 
      `(+${phone.slice(1, 3)}) ${phone.slice(4)}` :
      phone.startsWith('0') ?
          `(+90) ${phone.slice(1)}` :
          `(+90) ${phone}`;
  }

  render() {
    const filteredEmployees = this.employees.filter(employee =>
      Object.values(employee).some(value => 
        value && value.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
    const paginatedEmployees = filteredEmployees.slice((this.currentPage - 1) * 9, this.currentPage * 9);

    return html`
      <div class="employee-list">
        <h2>${this.translations.employee_list}</h2>
        <div class="search-wrapper">
            <div class="search-container">
            <input
                type="text"
                class="search-input"
                @input="${this.updateSearchTerm}"
                placeholder="${this.translations.search || 'Search employees'}"
            />
            </div>
            <div class="view-toggle">
                <button @click="${() => this.handleViewToggle('table')}">
                    <img src="/src/assets/image/hamburger.png" alt="${this.translations.table_view || 'Table View'}" />
                </button>
                <button @click="${() => this.handleViewToggle('list')}">
                    <img src="/src/assets/image/card.png" alt="${this.translations.list_view || 'List View'}" />
                </button>
            </div>
        </div>
        ${this.viewMode === 'list' ? this.renderListView(paginatedEmployees) : this.renderTableView(paginatedEmployees)}
        <div class="pagination">
          <button @click="${this.previousPage}">
            <img src="/src/assets/image/leftarrow.png" alt="${this.translations.previous || 'Previous'}" />
          </button>
          ${(() => {
            const totalPages = Math.ceil(filteredEmployees.length / 9);
            const currentPage = this.currentPage;
            const pages = [];

            if (totalPages > 0) {
              pages.push(html`<button @click="${() => this.changePage(1)}" 
                class="${currentPage === 1 ? 'active' : ''}"
              >1</button>`);
            }

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, start + 2);

            if (end === totalPages - 1) {
              start = Math.max(2, end - 2);
            }

            if (start > 2) {
              pages.push(html`<span>...</span>`);
            }

            for (let i = start; i <= end; i++) {
              pages.push(html`<button @click="${() => this.changePage(i)}"
                class="${currentPage === i ? 'active' : ''}"
              >${i}</button>`);
            }

            if (end < totalPages - 1) {
              pages.push(html`<span>...</span>`);
            }

            if (totalPages > 1) {
              pages.push(html`<button @click="${() => this.changePage(totalPages)}"
                class="${currentPage === totalPages ? 'active selected' : ''}"
              >${totalPages}</button>`);
            }

            return pages;
          })()}
          <button @click="${this.nextPage}">
            <img src="/src/assets/image/rightarrow.png" alt="${this.translations.next || 'Next'}" />
          </button>
        </div>
      </div>
    `;
  }

  renderListView(employees) {
    return html`
      <div class="employee-list-grid-container">
      <div class="employee-list-grid">
        ${employees.map((employee, index) => html`
            <div class="employee-item">
              <h3>${employee.firstName} ${employee.lastName}</h3>
              <p><strong>${this.translations.date_of_employment}:</strong> ${employee.dateOfEmployment.split('-')
                .reverse().join('/')}</p>
              <p><strong>${this.translations.date_of_birth}:</strong> ${employee.dateOfBirth.split('-')
                .reverse().join('/')}</p>
              <p><strong>${this.translations.phone}:</strong> ${this.formatPhoneNumber(employee.phone)}</p>
              <p><strong>${this.translations.email}:</strong> ${employee.email}</p>
              <p><strong>${this.translations.department}:</strong> ${employee.department}</p>
              <p><strong>${this.translations.position}:</strong> ${employee.position}</p>
              <employee-actions .employee="${employee}"></employee-actions>
          ${index % 5 === 4 ? html`</div>` : ''}
          </div>
        `)}
        ${employees.length % 5 !== 0 ? html`</div>` : ''}
      </div>
      </div>
    `;
  }

  renderTableView(employees) {
    return html`
      <div class="employee-table-container">
      <table class="employee-table">
        <thead>
          <tr>
            <th>${this.translations.first_name}</th>
            <th>${this.translations.last_name}</th>
            <th>${this.translations.date_of_employment}</th>
            <th>${this.translations.date_of_birth}</th>
            <th>${this.translations.phone}</th>
            <th>${this.translations.email}</th>
            <th>${this.translations.department}</th>
            <th>${this.translations.position}</th>
            <th>${this.translations.actions}</th>
          </tr>
        </thead>
        <tbody>
          ${employees.map(employee => html`
            <tr>
              <td>${employee.firstName}</td>
              <td>${employee.lastName}</td>
              <td>${employee.dateOfEmployment?.split('-').reverse().join('/')}</td>
              <td>${employee.dateOfBirth?.split('-').reverse().join('/')}</td>
              <td>${this.formatPhoneNumber(employee.phone)}</td>
              <td>${employee.email}</td>
              <td>${employee.department}</td>
              <td>${employee.position}</td>
              <td><employee-actions .employee="${employee}"></employee-actions></td>
            </tr>
          `)}
        </tbody>
      </table>
      </div>
    `;
  }

  updateSearchTerm(event) {
    this.searchTerm = event.target.value;
  }

  nextPage() {
    this.currentPage += 1;
  }

  previousPage() {
    this.currentPage = Math.max(1, this.currentPage - 1);
  }

  changePage(page) {
    this.currentPage = page;
  }
}

customElements.define('employee-list', EmployeeList);
