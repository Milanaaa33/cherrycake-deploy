import { describe, it, expect } from 'vitest';
import { store, setRegion, addToCart, clearCart, showToast, hideToast } from './index';

describe('Redux Store', () => {
  it('should update selected region', () => {
    store.dispatch(setRegion('KAZ'));
    expect(store.getState().region.selected).toBe('KAZ');
  });

  it('should add items to cart', () => {
    store.dispatch(clearCart());
    store.dispatch(addToCart('Cherry Cake'));
    expect(store.getState().cart.items).toContain('Cherry Cake');
  });

  it('should clear cart', () => {
    store.dispatch(clearCart());
    expect(store.getState().cart.items).toHaveLength(0);
  });

  it('should show and hide toast', () => {
    store.dispatch(showToast('Test notification'));
    expect(store.getState().ui.toast).toBe('Test notification');

    store.dispatch(hideToast());
    expect(store.getState().ui.toast).toBe('');
  });
});

