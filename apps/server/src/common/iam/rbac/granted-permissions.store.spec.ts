import { Test } from '@nestjs/testing';
import type { TenantTxClient } from '@minierp/platform-db';
import { PlatformDbService } from '../../../database/platform-db.service';
import { PrismaGrantedPermissionsStore } from './granted-permissions.store';

function createTxMock(): TenantTxClient {
  const mock = {
    tenant: {
      findFirst: jest.fn(),
    },
    userRole: {
      findMany: jest.fn(),
    },
    rolePermission: {
      findMany: jest.fn(),
    },
    permission: {
      findMany: jest.fn(),
    },
  };

  return mock as unknown as TenantTxClient;
}

describe('PrismaGrantedPermissionsStore', () => {
  it('returns empty when user has no roles', async () => {
    const tx = createTxMock();
    (tx.tenant.findFirst as jest.Mock).mockResolvedValue({ id: BigInt(1) });
    (tx.userRole.findMany as jest.Mock).mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        PrismaGrantedPermissionsStore,
        {
          provide: PlatformDbService,
          useValue: {
            withTenantTx: async (
              fn: (tx: TenantTxClient) => Promise<unknown>,
            ) => fn(tx),
          },
        },
      ],
    }).compile();

    const store = moduleRef.get(PrismaGrantedPermissionsStore);
    await expect(
      store.listGrantedPermissions({ tenantId: 'TENANT-1001', userId: '1' }),
    ).resolves.toEqual([]);
  });

  it('returns permission codes from role bindings', async () => {
    const tx = createTxMock();
    (tx.tenant.findFirst as jest.Mock).mockResolvedValue({ id: BigInt(1) });
    (tx.userRole.findMany as jest.Mock).mockResolvedValue([
      { roleId: BigInt(10) },
    ]);
    (tx.rolePermission.findMany as jest.Mock).mockResolvedValue([
      { permissionId: BigInt(100) },
      { permissionId: BigInt(101) },
    ]);
    (tx.permission.findMany as jest.Mock).mockResolvedValue([
      { code: 'erp:*' },
      { code: '  erp:order:read  ' },
      { code: '' },
    ]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        PrismaGrantedPermissionsStore,
        {
          provide: PlatformDbService,
          useValue: {
            withTenantTx: async (
              fn: (tx: TenantTxClient) => Promise<unknown>,
            ) => fn(tx),
          },
        },
      ],
    }).compile();

    const store = moduleRef.get(PrismaGrantedPermissionsStore);
    await expect(
      store.listGrantedPermissions({ tenantId: 'TENANT-1001', userId: '1' }),
    ).resolves.toEqual(['erp:*', 'erp:order:read']);
  });
});
