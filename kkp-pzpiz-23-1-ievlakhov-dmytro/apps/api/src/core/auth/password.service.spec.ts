import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const svc = new PasswordService();

  it('hashes and verifies a correct password', async () => {
    const hash = await svc.hash('Secret123!');
    expect(hash).not.toEqual('Secret123!');
    expect(await svc.verify('Secret123!', hash)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await svc.hash('Secret123!');
    expect(await svc.verify('wrong', hash)).toBe(false);
  });
});
