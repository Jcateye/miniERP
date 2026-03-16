import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { PrismaClient } from '@prisma/client';
import { createPlatformDb } from '@minierp/platform-db';

interface RequestTenantContext {
  readonly tenantId: string;
}

describe('platform-db withTenantTx (Phase1 no retry contract)', () => {
  const requestTenantStorage = new AsyncLocalStorage<RequestTenantContext>();

  const tenantId = 'tenant-no-retry';

  const prismaMock = {
    $transaction: jest.fn(),
    $queryRawUnsafe: jest.fn(),
  } as unknown as PrismaClient;

  let txStub: { readonly $executeRawUnsafe: jest.Mock };

  const platformDb = createPlatformDb({
    prisma: prismaMock,
    getCurrentTenantId: () => {
      const ctx = requestTenantStorage.getStore();
      if (!ctx) {
        throw new Error('tenant test context is missing');
      }
      return ctx.tenantId;
    },
    nodeEnv: 'test',
  });

  beforeEach(() => {
    jest.clearAllMocks();

    txStub = {
      $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
    };

    // default: registry lookup returns a stable schema
    (prismaMock.$queryRawUnsafe as unknown as jest.Mock).mockResolvedValue([
      { schema_name: 'tenant_no_retry' },
    ]);

    (prismaMock.$transaction as unknown as jest.Mock).mockImplementation(
      async (cb: any) => cb(txStub),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('executes callback exactly once when callback throws', async () => {
    const callback = jest.fn(async () => {
      throw new Error('boom');
    });

    await expect(
      requestTenantStorage.run({ tenantId }, () =>
        platformDb.withTenantTx(callback),
      ),
    ).rejects.toThrow('boom');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txStub.$executeRawUnsafe).toHaveBeenCalledTimes(1);
  });

  it('executes callback exactly once when callback throws (with options)', async () => {
    const callback = jest.fn(async () => {
      throw new Error('boom');
    });

    await expect(
      requestTenantStorage.run({ tenantId }, () =>
        platformDb.withTenantTx({ isolationLevel: 'Serializable' }, callback),
      ),
    ).rejects.toThrow('boom');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txStub.$executeRawUnsafe).toHaveBeenCalledTimes(1);

    const [firstArg] = (prismaMock.$transaction as unknown as jest.Mock).mock
      .calls[0] as any[];
    expect(typeof firstArg).toBe('function');

    const [, txOptions] = (prismaMock.$transaction as unknown as jest.Mock).mock
      .calls[0] as any[];
    expect(txOptions).toMatchObject({ isolationLevel: 'Serializable' });
  });

  it('throws when nested tenantId mismatches active tenant tx', async () => {
    const inner = jest.fn(async () => 'inner');

    const outer = jest.fn(async () => {
      await expect(
        requestTenantStorage.run({ tenantId: 'tenant-other' }, () =>
          platformDb.withTenantTx(inner),
        ),
      ).rejects.toThrow(/Nested tenant transaction mismatch/);

      expect(inner).not.toHaveBeenCalled();
    });

    await requestTenantStorage.run({ tenantId }, () =>
      platformDb.withTenantTx(outer),
    );

    expect(outer).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txStub.$executeRawUnsafe).toHaveBeenCalledTimes(1);
  });

  it('throws when nested isolationLevel mismatches active tenant tx', async () => {
    const inner = jest.fn(async () => 'inner');

    const outer = jest.fn(async () => {
      await expect(
        platformDb.withTenantTx({ isolationLevel: 'ReadCommitted' }, inner),
      ).rejects.toThrow(/Nested tenant transaction isolation mismatch/);

      expect(inner).not.toHaveBeenCalled();
    });

    await requestTenantStorage.run({ tenantId }, () =>
      platformDb.withTenantTx({ isolationLevel: 'Serializable' }, outer),
    );

    expect(outer).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txStub.$executeRawUnsafe).toHaveBeenCalledTimes(1);
  });

  it('reuses active tenant tx for nested withTenantTx calls', async () => {
    const inner = jest.fn(async () => 'inner');

    const outer = jest.fn(async () => {
      const value = await platformDb.withTenantTx(inner);
      expect(value).toBe('inner');
    });

    await requestTenantStorage.run({ tenantId }, () =>
      platformDb.withTenantTx(outer),
    );

    expect(outer).toHaveBeenCalledTimes(1);
    expect(inner).toHaveBeenCalledTimes(1);

    expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txStub.$executeRawUnsafe).toHaveBeenCalledTimes(1);
  });

  it('reuses active tenant tx when nested isolation matches', async () => {
    const inner = jest.fn(async () => 'inner');

    const outer = jest.fn(async () => {
      const value = await platformDb.withTenantTx(
        { isolationLevel: 'Serializable' },
        inner,
      );
      expect(value).toBe('inner');
    });

    await requestTenantStorage.run({ tenantId }, () =>
      platformDb.withTenantTx({ isolationLevel: 'Serializable' }, outer),
    );

    expect(outer).toHaveBeenCalledTimes(1);
    expect(inner).toHaveBeenCalledTimes(1);

    expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txStub.$executeRawUnsafe).toHaveBeenCalledTimes(1);
  });
});
