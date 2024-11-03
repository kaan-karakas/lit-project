import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import { EmployeeForm } from './EmployeeForm.js';
import { EmployeeStore } from '../store/EmployeeStore.js';

describe('EmployeeForm', () => {
  let component;

  beforeEach(() => {
    component = new EmployeeForm();
  });

  it('should initialize with default properties', () => {
    expect(component.employee).to.be.an('object').that.is.empty;
    expect(component.language).to.be.oneOf(['en', 'tr']);
    expect(component.showSaveConfirmDialog).to.be.false;
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

  it('should format phone input correctly', () => {
    const event = { target: { value: '5551234567' } };
    component.handlePhoneInput(event);
    expect(event.target.value).to.equal('555 123 45 67');
    expect(component.employee.phone).to.equal('+90 555 123 45 67');
  });
  

  it('should validate phone correctly', () => {
    let isValid = component.validatePhone('+90 555 123 4567');
    expect(isValid).to.be.true;

    isValid = component.validatePhone('123456789');
    expect(isValid).to.be.false;
  });

  it('should validate email correctly', () => {
    let isValid = component.validateEmail('test@example.com');
    expect(isValid).to.be.true;

    isValid = component.validateEmail('invalid-email');
    expect(isValid).to.be.false;
  });

  it('should handle form submission and show validation errors', () => {
    const dispatchSpy = sinon.spy(window, 'dispatchEvent');
    component.employee = {};
    component.handleSubmit({ preventDefault: () => {} });

    expect(dispatchSpy.calledWithMatch(sinon.match.has('detail', sinon.match.has('message',
      component.translations.fill_all_fields)))).to.be.true;
    expect(dispatchSpy.calledWithMatch(sinon.match.has('detail', sinon.match.has('type', 'error')))).to.be.true;

    dispatchSpy.restore();
  });

  it('should show confirmation dialog when form is valid', () => {
    component.employee = {
      firstName: 'John',
      lastName: 'Doe',
      dateOfEmployment: '2023-01-01',
      dateOfBirth: '1990-01-01',
      phone: '+90 555 123 4567',
      email: 'test@example.com',
      department: 'Tech',
      position: 'Senior'
    };

    component.handleSubmit({ preventDefault: () => {} });
    expect(component.showSaveConfirmDialog).to.be.true;
  });

  it('should handle save employee', () => {
    const addSpy = sinon.spy(EmployeeStore, 'addEmployee');
    const updateSpy = sinon.spy(EmployeeStore, 'updateEmployee');
    const dispatchSpy = sinon.spy(window, 'dispatchEvent');

    component.employee = { id: 1, firstName: 'John' };
    component.saveEmployee();

    expect(updateSpy.calledOnce).to.be.true;
    expect(dispatchSpy.calledWithMatch(sinon.match.has('detail', sinon.match.has('message',
      component.translations.employee_updated_success)))).to.be.true;

    component.employee = { firstName: 'New' };
    component.saveEmployee();

    expect(addSpy.calledOnce).to.be.true;
    expect(dispatchSpy.calledWithMatch(sinon.match.has('detail', sinon.match.has('message',
      component.translations.employee_added_success)))).to.be.true;

    addSpy.restore();
    updateSpy.restore();
    dispatchSpy.restore();
  });
});
