import { describe, expect, it } from '@jest/globals';
import { resolveTenantDbId } from './prisma-tenant-id.resolver';

function makeClient(returnId: bigint | null) {
  return {
    tenant: {
      findFirst: jest
        .fn()
        .mockResolvedValue(returnId === null ? null : { id: returnId }),
    },
  } as any;
}

describe('resolveTenantDbId', () => {
  it('resolves by tenant code candidates', async () => {
    const client = makeClient(BigInt(1001));
    await expect(resolveTenantDbId(client, 'TENANT-1001')).resolves.toBe(
      BigInt(1001),
    );

    expect(client.tenant.findFirst).toHaveBeenCalledTimes(1);
  });

  it('resolves by bigint id if provided', async () => {
    const client = makeClient(BigInt(2002));
    await expect(resolveTenantDbId(client, '2002')).resolves.toBe(BigInt(2002));

    expect(client.tenant.findFirst).toHaveBeenCalledTimes(1);
  });

  it('throws when tenant id cannot be resolved', async () => {
    const client = makeClient(null);
    await expect(resolveTenantDbId(client, '9999')).rejects.toThrow(
      'Unknown tenantId: 9999',
    );

    expect(client.tenant.findFirst).toHaveBeenCalledTimes(1);
  });
});
