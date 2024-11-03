import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import { EmployeeStore, sampleEmployees } from './EmployeeStore.js';

describe('EmployeeStore', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    localStorage.clear();
    EmployeeStore.employees = [...sampleEmployees];
  });

  afterEach(() => {
    sandbox.restore();
    EmployeeStore.listeners = [];
  });

  it('should get all employees', () => {
    const employees = EmployeeStore.getEmployees();
    expect(employees).to.have.length(sampleEmployees.length);
  });

  it('should add a new employee', () => {
    const newEmployee = {
      firstName: 'Test',
      lastName: 'Employee',
      dateOfEmployment: '2023-07-01',
      dateOfBirth: '1990-01-01',
      phone: '+90 500 000 00 00',
      email: 'test.employee@company.com',
      department: 'Tech',
      position: 'Junior'
    };

    EmployeeStore.addEmployee(newEmployee);
    expect(EmployeeStore.employees).to.have.length(sampleEmployees.length + 1);
    expect(EmployeeStore.employees[sampleEmployees.length]).to.include(newEmployee);
  });

  it('should update an existing employee', () => {
    const updatedEmployee = { ...sampleEmployees[0], firstName: 'Updated' };
    EmployeeStore.updateEmployee(updatedEmployee);

    const employee = EmployeeStore.getEmployee(updatedEmployee.id);
    expect(employee.firstName).to.equal('Updated');
  });

  it('should delete an employee', () => {
    const idToDelete = sampleEmployees[0].id;
    EmployeeStore.deleteEmployee(idToDelete);

    const employee = EmployeeStore.getEmployee(idToDelete);
    expect(employee).to.be.undefined;
  });

  it('should save to and load from localStorage', () => {
    const setItemSpy = sandbox.spy(localStorage, 'setItem');
    EmployeeStore.save();

    expect(setItemSpy.calledOnceWith('employees')).to.be.true;
    const savedData = JSON.parse(localStorage.getItem('employees'));
    expect(savedData).to.have.length(EmployeeStore.employees.length);
  });

  it('should notify listeners when employees change', () => {
    const callback = sinon.spy();
    EmployeeStore.subscribe(callback);

    EmployeeStore.addEmployee({
      firstName: 'Notify',
      lastName: 'Test',
      dateOfEmployment: '2023-07-01',
      dateOfBirth: '1990-01-01',
      phone: '+90 500 000 00 01',
      email: 'notify.test@company.com',
      department: 'Tech',
      position: 'Junior'
    });

    expect(callback.calledOnce).to.be.true;
  });

  it('should unsubscribe a listener', () => {
    const callback = sinon.spy();
    EmployeeStore.subscribe(callback);
    EmployeeStore.unsubscribe(callback);

    EmployeeStore.addEmployee({
      firstName: 'Unsubscribe',
      lastName: 'Test',
      dateOfEmployment: '2023-07-01',
      dateOfBirth: '1990-01-01',
      phone: '+90 500 000 00 02',
      email: 'unsubscribe.test@company.com',
      department: 'Tech',
      position: 'Junior'
    });

    expect(callback.called).to.be.false;
  });
});
