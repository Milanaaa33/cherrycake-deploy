import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import Button from './Button';

afterEach(() => {
  cleanup();
});

describe('Button component', () => {
  it('renders button text', () => {
    render(<Button>Order Now</Button>);

    expect(
      screen.getByRole('button', { name: 'Order Now' })
    ).toBeTruthy();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();

    render(
      <Button onClick={handleClick}>
        Add to Cart
      </Button>
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Add to Cart' })
    );

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('disables button when disabled is true', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button', {
      name: 'Disabled',
    }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('shows loading state and disables button', () => {
    render(<Button loading>Submit</Button>);

    const button = screen.getByRole('button', {
      name: 'Loading...',
    }) as HTMLButtonElement;

    expect(button.textContent).toBe('Loading...');
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('applies secondary variant class', () => {
    render(<Button variant="secondary">Cancel</Button>);

    const button = screen.getByRole('button', {
      name: 'Cancel',
    });

    expect(
      button.classList.contains('cc-button--secondary')
    ).toBe(true);
  });
});
