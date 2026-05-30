import { DocumentNumberService } from './document-number.service';

describe('DocumentNumberService', () => {
  const svc = new DocumentNumberService();

  it('formats sequence value as PREFIX-000001 (6-digit zero pad)', async () => {
    const manager = { query: jest.fn().mockResolvedValue([{ value: '1' }]) } as any;
    expect(await svc.next(manager, 'receipt_number_seq', 'REC')).toBe('REC-000001');
    expect(manager.query).toHaveBeenCalledWith(`SELECT nextval($1) AS value`, [
      'receipt_number_seq',
    ]);
  });

  it('does not truncate values beyond 6 digits', async () => {
    const manager = { query: jest.fn().mockResolvedValue([{ value: '1234567' }]) } as any;
    expect(await svc.next(manager, 'receipt_number_seq', 'REC')).toBe('REC-1234567');
  });
});
