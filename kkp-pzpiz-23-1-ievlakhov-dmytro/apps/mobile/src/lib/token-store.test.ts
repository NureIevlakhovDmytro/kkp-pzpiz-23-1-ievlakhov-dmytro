import * as SecureStore from 'expo-secure-store';
import { clearToken, getToken, setToken } from './token-store';

jest.mock('expo-secure-store');
const mocked = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => jest.clearAllMocks());

describe('token-store', () => {
  it('reads the token under the warehouse key', async () => {
    mocked.getItemAsync.mockResolvedValue('tok123');
    await expect(getToken()).resolves.toBe('tok123');
    expect(mocked.getItemAsync).toHaveBeenCalledWith('warehouse.token');
  });

  it('writes the token', async () => {
    await setToken('tok123');
    expect(mocked.setItemAsync).toHaveBeenCalledWith('warehouse.token', 'tok123');
  });

  it('clears the token', async () => {
    await clearToken();
    expect(mocked.deleteItemAsync).toHaveBeenCalledWith('warehouse.token');
  });
});
