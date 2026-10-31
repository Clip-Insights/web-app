import { beforeEach, describe, expect, it, vi } from 'vitest';
let callback;
beforeEach(()=>{vi.resetModules();document.head.innerHTML='';window.Paddle={Environment:{set:vi.fn()},Initialize:vi.fn(config=>{callback=config.eventCallback;}),Checkout:{open:vi.fn()}};});
describe('checkout event lifecycle',()=>{
 it('does not activate a plan from a previously closed checkout listener',async()=>{
  const {openCheckout}=await import('./paddle');
  const previous=vi.fn(),current=vi.fn();
  const first=openCheckout({environment:'sandbox',client_token:'test'},{onSuccess:previous});
  document.head.querySelector('script').onload();await first;
  callback({name:'checkout.closed'});
  await openCheckout({environment:'sandbox',client_token:'test'},{onSuccess:current});
  callback({name:'checkout.completed'});
  expect(previous).not.toHaveBeenCalled();expect(current).toHaveBeenCalledTimes(1);
 });
 it('allows another SDK load after a temporary network failure',async()=>{
  const {loadPaddle}=await import('./paddle');
  const first=loadPaddle('sandbox','test');
  const rejected=expect(first).rejects.toThrow('Failed to load Paddle.js');
  document.head.querySelector('script').onerror();await rejected;
  const second=loadPaddle('sandbox','test');
  document.head.querySelectorAll('script')[1].onload();
  await expect(second).resolves.toBe(window.Paddle);
 });
});
