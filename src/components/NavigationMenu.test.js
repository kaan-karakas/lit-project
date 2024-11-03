import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import { NavigationMenu } from './NavigationMenu.js';

describe('NavigationMenu', () => {
  let component;

  beforeEach(() => {
    component = new NavigationMenu();
    document.body.appendChild(component);
  });

  afterEach(() => {
    document.body.removeChild(component);
  });

  it('should initialize with correct default language', () => {
    const storedLanguageSpy = sinon.spy(component, 'getStoredLanguage');
    component.getStoredLanguage();
    expect(storedLanguageSpy.calledOnce).to.be.true;
    expect(component.language).to.be.oneOf(['en', 'tr']);
    storedLanguageSpy.restore();
  });

  it('should get translations based on language', () => {
    component.language = 'en';
    const enTranslations = component.getTranslations();
    expect(enTranslations).to.deep.equal(component.translations);

    component.language = 'tr';
    const trTranslations = component.getTranslations();

    setTimeout(() => {
      expect(trTranslations).to.deep.equal(component.translations);
    }, 1);
  });

  it('should set language and save to localStorage', () => {
    const localStorageSpy = sinon.spy(localStorage, 'setItem');
    component.changeLanguage('tr');

    expect(component.language).to.equal('tr');
    expect(localStorageSpy.calledOnceWith('language', 'tr')).to.be.true;
    localStorageSpy.restore();
  });

  it('should dispatch language-changed event', () => {
    const dispatchSpy = sinon.spy(window, 'dispatchEvent');
    component.changeLanguage('en');

    expect(dispatchSpy.calledOnce).to.be.true;
    expect(dispatchSpy.calledWithMatch(sinon.match.has('detail', 'en'))).to.be.true;

    dispatchSpy.restore();
  });
});
