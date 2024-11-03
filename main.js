import { Router } from 'https://cdn.jsdelivr.net/npm/@vaadin/router@1.7.4/dist/vaadin-router.js';
import './src/components/EmployeeActions.js';
import './src/components/EmployeeForm.js';
import './src/components/EmployeeList.js';
import './src/components/NavigationMenu.js';
import { EmployeeStore } from './src/store/EmployeeStore.js';

const outlet = document.querySelector('#outlet');
const router = new Router(outlet);

const userLanguage = navigator.languages && navigator.languages.length 
  ? navigator.languages[0] 
  : navigator.language || navigator.userLanguage;

document.documentElement.lang = userLanguage.split('-')[0];

router.setRoutes([
  {
    path: '/',
    component: 'employee-list',
  },
  {
    path: '/add',
    component: 'employee-form',
    action: () => {
      const employeeForm = document.createElement('employee-form');
      employeeForm.employee = {};
      return employeeForm;
    },
  },
  {
    path: '/edit/:id',
    component: 'employee-form',
    action: (context) => {
      const employeeId = context.params.id;
      const employeeForm = document.createElement('employee-form');
      employeeForm.employee = getEmployeeById(employeeId);
      return employeeForm;
    },
  },
]);

function getEmployeeById(id) {
  const employees = EmployeeStore.getEmployees();
  return employees.find(employee => employee.id === id) || {};
}

if (!localStorage.getItem('employees')) {
  const sampleEmployees = [
    { id: '2222', firstName: 'Ahmet', lastName: 'Sourtimes', dateOfEmployment: '2022-09-23', dateOfBirth: '1990-01-01',
        phone: '+90 532 123 45 67', email: 'ahmet@sourtimes.org', department: 'Analytics', position: 'Junior' },
  ];
  localStorage.setItem('employees', JSON.stringify(sampleEmployees));
}

window.addEventListener('edit-employee', (event) => {
  const employee = event.detail;
  history.pushState({}, '', `/edit/${employee.id}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
});

window.addEventListener('navigate', (event) => {
  const path = event.detail;
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
});

window.addEventListener('delete-employee', (event) => {
  const employee = event.detail;
  deleteEmployeeById(employee.id);
  history.pushState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
});

function deleteEmployeeById(id) {
  let employees = JSON.parse(localStorage.getItem('employees')) || [];
  employees = employees.filter(employee => employee.id !== id);
  localStorage.setItem('employees', JSON.stringify(employees));
}
