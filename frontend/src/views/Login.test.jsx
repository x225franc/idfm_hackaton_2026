import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

vi.mock('@/components/Logo', () => ({ default: () => <div>Logo</div> }));
vi.mock('@/components/ui/Button', () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
}));
vi.mock('@/components/ui/Input', () => ({
  default: ({ label, ...props }) => (
    <div>
      <label>{label}</label>
      <input {...props} />
    </div>
  ),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login', () => {
  it('affiche le champ email et le champ mot de passe', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('nom@exemple.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('affiche le bouton de connexion', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: 'login.submit' })).toBeInTheDocument();
  });

  it('met à jour le champ email à la saisie', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('nom@exemple.com');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    expect(emailInput.value).toBe('test@test.com');
  });
});
