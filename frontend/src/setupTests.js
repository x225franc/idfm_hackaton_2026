import '@testing-library/jest-dom';

Object.defineProperty(window, 'config', {
  value: { BACKEND_URL: 'http://localhost:3001' },
  writable: true,
});
