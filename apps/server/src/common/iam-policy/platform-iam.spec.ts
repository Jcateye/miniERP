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

  it('adds prisma_where data obligation when inventory read is warehouse-scoped', async () => {
    const store: GrantedPermissionsStore = {
      listGrantedPermissions: async () => [
        'erp:inventory:read:warehouse=WH-001',
        'erp:inventory:read:warehouse=WH-002',
      ],
    };

    const authorizer = createAuthorizer({ store });
    await expect(
      authorizer.authorize({
        tenantId: '1',
        userId: '1',
        resource: 'erp:inventory',
        action: 'read',
      }),
    ).resolves.toEqual({
      decision: 'allow',
      obligations: {
        data: {
          kind: 'prisma_where',
          where: {
            warehouseId: {
              in: ['WH-001', 'WH-002'],
            },
          },
        },
      },
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

  it('denies inventory read when only unknown scoped permission is granted', async () => {
    const store: GrantedPermissionsStore = {
      listGrantedPermissions: async () => ['erp:inventory:read:foo=bar'],
    };

    const authorizer = createAuthorizer({ store });
    await expect(
      authorizer.authorize({
        tenantId: '1',
        userId: '1',
        resource: 'erp:inventory',
        action: 'read',
      }),
    ).resolves.toEqual({
      decision: 'deny',
      obligations: {},
      reason: 'MISSING_PERMISSION',
    });
  });

  it('denies when only unknown scoped permission is granted (non-inventory)', async () => {
    const store: GrantedPermissionsStore = {
      listGrantedPermissions: async () => ['erp:order:read:region=CN'],
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

  it('adds workflow/button obligations for document update', async () => {
    const store: GrantedPermissionsStore = {
      listGrantedPermissions: async () => ['erp:document:update'],
    };

    const authorizer = createAuthorizer({ store });
    await expect(
      authorizer.authorize({
        tenantId: '1',
        userId: '1',
        resource: 'erp:document',
        action: 'update',
      }),
    ).resolves.toEqual({
      decision: 'allow',
      obligations: {
        workflow: {
          allowTransitions: ['confirm', 'validate', 'pick', 'close', 'cancel'],
        },
        buttons: {
          allow: ['confirm', 'validate', 'pick', 'close', 'cancel'],
        },
      },
    });
  });

  it('includes post transition when document post permission is granted', async () => {
    const store: GrantedPermissionsStore = {
      listGrantedPermissions: async () => [
        'erp:document:update',
        'erp:document:post',
      ],
    };

    const authorizer = createAuthorizer({ store });
    await expect(
      authorizer.authorize({
        tenantId: '1',
        userId: '1',
        resource: 'erp:document',
        action: 'update',
      }),
    ).resolves.toEqual({
      decision: 'allow',
      obligations: {
        workflow: {
          allowTransitions: [
            'confirm',
            'validate',
            'pick',
            'close',
            'cancel',
            'post',
          ],
        },
        buttons: {
          allow: ['confirm', 'validate', 'pick', 'close', 'cancel', 'post'],
        },
      },
    });
  });

  it('requires explicit document post permission', async () => {
    const store: GrantedPermissionsStore = {
      listGrantedPermissions: async () => ['erp:document:post'],
    };

    const authorizer = createAuthorizer({ store });
    await expect(
      authorizer.authorize({
        tenantId: '1',
        userId: '1',
        resource: 'erp:document',
        action: 'post',
      }),
    ).resolves.toEqual({
      decision: 'allow',
      obligations: {
        workflow: {
          allowTransitions: ['post'],
        },
        buttons: {
          allow: ['post'],
        },
      },
    });
  });

  it('denies document post when permission missing', async () => {
    const store: GrantedPermissionsStore = {
      listGrantedPermissions: async () => ['erp:document:update'],
    };

    const authorizer = createAuthorizer({ store });
    await expect(
      authorizer.authorize({
        tenantId: '1',
        userId: '1',
        resource: 'erp:document',
        action: 'post',
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
