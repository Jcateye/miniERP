import { Injectable } from '@nestjs/common';
import type { GrantedPermissionsStore } from '@minierp/platform-iam';
import { PlatformDbService } from '../../../database/platform-db.service';
import { resolveTenantDbId } from '../../../modules/masterdata/infrastructure/prisma-tenant-id.resolver';

function parseBigintId(value: string, label: string): bigint {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`${label} is required`);
  }

  try {
    return BigInt(normalized);
  } catch {
    throw new Error(`${label} must be bigint-compatible: ${value}`);
  }
}

@Injectable()
export class PrismaGrantedPermissionsStore implements GrantedPermissionsStore {
  constructor(private readonly platformDb: PlatformDbService) {}

  async listGrantedPermissions(input: {
    readonly tenantId: string;
    readonly userId: string;
  }): Promise<readonly string[]> {
    const userDbId = parseBigintId(input.userId, 'userId');

    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, input.tenantId);

      const rows = await tx.userRole.findMany({
        where: {
          tenantId: tenantDbId,
          userId: userDbId,
        },
        select: {
          roleId: true,
        },
      });

      if (rows.length === 0) {
        return [];
      }

      const roleIds = rows.map((row) => row.roleId);

      const rolePermissions = await tx.rolePermission.findMany({
        where: {
          tenantId: tenantDbId,
          roleId: {
            in: roleIds,
          },
        },
        select: {
          permissionId: true,
        },
      });

      if (rolePermissions.length === 0) {
        return [];
      }

      const permissionIds = rolePermissions.map((row) => row.permissionId);

      const permissions = await tx.permission.findMany({
        where: {
          id: {
            in: permissionIds,
          },
        },
        select: {
          code: true,
        },
      });

      return permissions
        .map((permission) => permission.code.trim())
        .filter((code) => code.length > 0);
    });
  }
}
