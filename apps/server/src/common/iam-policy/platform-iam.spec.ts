import {
  createAuthorizer,
  type GrantedPermissionsStore,
} from '@minierp/platform-iam';

describe('platform-iam', () => {
  it('allows when granted erp:*', async () => {
    const store: GrantedPermissionsStore = {
      listGrantedPermissions: async () => ['erp:*'],
    };

    const authorizer = createAuthorizer({ store });
    await expect(
      authorizer.authorize({
        tenantId: '1',
        userId: '1',
        resource: 'erp:order',
        action: 'read',
      }),
    ).resolves.toEqual({
      decision: 'allow',
      obligations: {},
    });
  });

  it('denies when permission missing', async () => {
    const store: GrantedPermissionsStore = {
      listGrantedPermissions: async () => [],
    };

    const authorizer = createAuthorizer({ store });
    await expect(
      authorizer.authorize({
        tenantId: '1',
        userId: '1',
        resource: 'erp:order',
        action: 'read',
      }),
    ).resolves.toEqual({
      decision: 'deny',
      obligations: {},
      reason: 'MISSING_PERMISSION',
    });
  });

  it('rejects invalid resource/action input', async () => {
    const store: GrantedPermissionsStore = {
      listGrantedPermissions: async () => ['erp:*'],
    };

    const authorizer = createAuthorizer({ store });
    await expect(
      authorizer.authorize({
        tenantId: '1',
        userId: '1',
        resource: 'erp',
        action: 'read',
      }),
    ).rejects.toThrow();

    await expect(
      authorizer.authorize({
        tenantId: '1',
        userId: '1',
        resource: 'erp:order',
        action: 'READ',
      }),
    ).rejects.toThrow();
  });
});
