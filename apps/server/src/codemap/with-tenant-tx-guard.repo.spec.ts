import * as path from 'node:path';
import { evaluateWithTenantTxGuard } from './with-tenant-tx-guard';

describe('with-tenant-tx-guard (repo)', () => {
  it('passes Phase1 guard in current repository', () => {
    const rootDir = path.resolve(__dirname, '../../../..');
    const result = evaluateWithTenantTxGuard({ rootDir });
    expect(result.ok).toBe(true);
    expect(result.directPrismaImports).toEqual([]);
    expect(result.directPrismaClientUsages).toEqual([]);
    expect(result.directPrismaServiceTokenUsages).toEqual([]);
    expect(typeof result.summary).toBe('string');
  });
});
