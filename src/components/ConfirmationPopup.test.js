import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import { ConfirmationPopup } from './ConfirmationPopup.js';

describe('ConfirmationPopup', () => {
  let component;

  beforeEach(() => {
    component = new ConfirmationPopup();
    document.body.appendChild(component);
  });

  afterEach(() => {
    document.body.removeChild(component);
  });

  it('should initialize with correct default properties', () => {
    expect(component.isOpen).to.be.undefined;
    expect(component.message).to.be.undefined;
    expect(component.language).to.be.oneOf(['en', 'tr']);
    expect(component.translations).to.be.an('object');
  });

  it('should detect the correct language', () => {
    const lang = component.detectLanguage();
    expect(lang).to.be.oneOf(['en', 'tr']);
  });

  it('should get correct translations based on language', () => {
    component.language = 'en';
    const enTranslations = component.getTranslations();
    expect(enTranslations).to.deep.equal(component.translations);

    component.language = 'tr';
    const trTranslations = component.getTranslations();

    setTimeout(() => {
      expect(trTranslations).to.deep.equal(component.translations);
    }, 1);
  });

  it('should update language when language-changed event is dispatched', () => {
    const event = new CustomEvent('language-changed', { detail: 'tr' });
    window.dispatchEvent(event);

    expect(component.language).to.equal('tr');
    expect(component.translations).to.deep.equal(component.getTranslations());
  });

  it('should call onConfirm when confirm button is clicked', () => {
    const onConfirmSpy = sinon.spy();
    component.isOpen = true;
    component.onConfirm = onConfirmSpy;
    component.requestUpdate();
    component.updateComplete.then(() => {
      component.shadowRoot.querySelector('.confirm-btn').click();
      expect(onConfirmSpy.calledOnce).to.be.true;
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancelSpy = sinon.spy();
    component.isOpen = true;
    component.onCancel = onCancelSpy;
    component.requestUpdate();
    component.updateComplete.then(() => {
      component.shadowRoot.querySelector('.cancel-btn').click();
      expect(onCancelSpy.calledOnce).to.be.true;
    });
  });

  it('should remove event listener on disconnectedCallback', () => {
    const removeEventListenerSpy = sinon.spy(window, 'removeEventListener');
    component.disconnectedCallback();
    expect(removeEventListenerSpy.calledWith('language-changed', sinon.match.func)).to.be.true;
    removeEventListenerSpy.restore();
  });
});
