import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import { Toast } from './Toast.js';

describe('Toast', () => {
  let component;

  beforeEach(() => {
    component = new Toast();
    document.body.appendChild(component);
  });

  afterEach(() => {
    document.body.removeChild(component);
  });

  it('should initialize with default properties', () => {
    expect(component.message).to.equal('');
    expect(component.type).to.equal('info');
    expect(component.visible).to.be.false;
  });

  it('should show toast with correct message and type when show-toast event is dispatched', () => {
    const event = new CustomEvent('show-toast', {
      detail: { message: 'Test message', type: 'success' }
    });

    window.dispatchEvent(event);

    expect(component.message).to.equal('Test message');
    expect(component.type).to.equal('success');
    expect(component.visible).to.be.true;
  });

  it('should hide the toast after 3 seconds', (done) => {
    const clock = sinon.useFakeTimers();

    component.showToast({
      detail: { message: 'Test message', type: 'info' }
    });

    expect(component.visible).to.be.true;

    clock.tick(3000);

    expect(component.visible).to.be.false;

    clock.restore();
    done();
  });

  it('should remove event listener on disconnectedCallback', () => {
    const removeEventListenerSpy = sinon.spy(window, 'removeEventListener');
    component.disconnectedCallback();

    expect(removeEventListenerSpy.calledWith('show-toast', sinon.match.func)).to.be.true;

    removeEventListenerSpy.restore();
  });
});
