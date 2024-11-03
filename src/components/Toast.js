import { LitElement, html } from 'https://cdn.skypack.dev/lit';
import styles from '../styles/Toast.css' with { type: 'css' };

export class Toast extends LitElement {
  static styles = styles;

  static properties = {
    message: { type: String },
    type: { type: String },
    visible: { type: Boolean }
  };

  constructor() {
    super();
    this.message = '';
    this.type = 'info';
    this.visible = false;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('show-toast', this.showToast.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('show-toast', this.showToast.bind(this));
  }

  showToast(event) {
    this.message = event.detail.message;
    this.type = event.detail.type || 'info';
    this.visible = true;

    setTimeout(() => {
      this.visible = false;
    }, 3000);
  }

  render() {
    if (!this.visible) return null;

    return html`
      <div class="toast ${this.type}">
        <p>${this.message}</p>
      </div>
    `;
  }
}

customElements.define('toast-message', Toast);