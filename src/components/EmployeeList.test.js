import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import { EmployeeList } from './EmployeeList.js';
import { EmployeeStore, sampleEmployees } from '../store/EmployeeStore.js';

describe('EmployeeList', () => {
  let component;

  beforeEach(() => {
    component = new EmployeeList();
  });

  it('should initialize with default properties', () => {
    expect(component.employees).to.be.an('array').that.is.not.empty;
    expect(component.searchTerm).to.equal('');
    expect(component.currentPage).to.equal(1);
    expect(component.language).to.be.oneOf(['en', 'tr']);
    expect(component.viewMode).to.equal('table');
  });

  it('should detect the correct language', () => {
    const spy = sinon.spy(component, 'detectLanguage');
    const detectedLanguage = component.detectLanguage();
    expect(spy.calledOnce).to.be.true;
    expect(detectedLanguage).to.be.oneOf(['en', 'tr']);
  });

  it('should get the correct translations based on language', () => {
    component.language = 'en';
    const enTranslations = component.getTranslations();
    expect(enTranslations).to.deep.equal(component.translations);

    component.language = 'tr';
    const trTranslations = component.getTranslations();

    setTimeout(() => {
      expect(trTranslations).to.deep.equal(component.translations);
    }, 1);
  });

  it('should format phone number correctly', () => {
    const formattedPhone1 = component.formatPhoneNumber('+9055555555555');
    expect(formattedPhone1).to.equal('(+90) 5555555555');

    const formattedPhone2 = component.formatPhoneNumber('05555555555');
    expect(formattedPhone2).to.equal('(+90) 5555555555');

    const formattedPhone3 = component.formatPhoneNumber('5555555555');
    expect(formattedPhone3).to.equal('(+90) 5555555555');
  });

  it('should update search term', () => {
    const event = { target: { value: 'search' } };
    component.updateSearchTerm(event);
    expect(component.searchTerm).to.equal('search');
  });

  it('should handle page change', () => {
    component.changePage(2);
    expect(component.currentPage).to.equal(2);

    component.nextPage();
    expect(component.currentPage).to.equal(3);

    component.previousPage();
    expect(component.currentPage).to.equal(2);
  });

  it('should update employees when EmployeeStore emits changes', () => {
    const mockEmployees = sampleEmployees;

    const subscribeStub = sinon.stub(EmployeeStore, 'subscribe').callsFake(callback => {
      callback(mockEmployees);
    });

    component.connectedCallback();

    expect(component.employees).to.deep.equal(mockEmployees);

    subscribeStub.restore();
  });
});
