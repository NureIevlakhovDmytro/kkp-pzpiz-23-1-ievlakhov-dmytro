import { beforeEach, describe, expect, it } from 'vitest';
import { clearToken, getToken, setToken } from './token-store';

describe('token-store', () => {
  beforeEach(() => localStorage.clear());
  it('stores and reads the token', () => {
    setToken('abc');
    expect(getToken()).toBe('abc');
  });
  it('clears the token', () => {
    setToken('abc');
    clearToken();
    expect(getToken()).toBeNull();
  });
});
