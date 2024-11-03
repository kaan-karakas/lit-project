import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import { EmployeeActions } from './EmployeeActions.js';
import { EmployeeStore } from '../store/EmployeeStore.js';

describe('EmployeeActions', () => {
  let component;

  beforeEach(() => {
    component = new EmployeeActions();
    document.body.appendChild(component);
  });

  afterEach(() => {
    document.body.removeChild(component);
  });

  it('should initialize with default properties', () => {
    expect(component.showConfirmDialog).to.be.false;
    expect(component.language).to.be.oneOf(['en', 'tr']);
  });

  it('should detect the correct language', () => {
    const spy = sinon.spy(component, 'detectLanguage');
    const detectedLanguage = component.detectLanguage();
    expect(spy.calledOnce).to.be.true;
    expect(detectedLanguage).to.be.oneOf(['en', 'tr']);
  });

  it('should show delete confirmation dialog', () => {
    component.showDeleteConfirmation();
    expect(component.showConfirmDialog).to.be.true;
  });

  it('should cancel delete confirmation dialog', () => {
    component.showConfirmDialog = true;
    component.cancelDelete();
    expect(component.showConfirmDialog).to.be.false;
  });

  it('should confirm delete and dispatch a toast event', () => {
    const deleteSpy = sinon.spy(EmployeeStore, 'deleteEmployee');
    const dispatchSpy = sinon.spy(window, 'dispatchEvent');
    component.employee = { id: 1 };

    component.confirmDelete();

    expect(deleteSpy.calledOnceWith(1)).to.be.true;
    expect(component.showConfirmDialog).to.be.false;
    expect(dispatchSpy.calledWithMatch(sinon.match.has('detail', sinon.match.has('message',
      component.translations.employee_success_deleted)))).to.be.true;

    deleteSpy.restore();
    dispatchSpy.restore();
  });
});
