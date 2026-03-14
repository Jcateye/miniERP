import type { PrismaService } from '../../../database/prisma.service';
import type { Prisma } from '@prisma/client';

type TenantLookupClient =
  | Pick<PrismaService, 'tenant'>
  | Prisma.TransactionClient;

function tenantCodeCandidates(tenantId: string): string[] {
  const normalized = tenantId.trim();
  const candidates = new Set<string>([normalized]);

  if (!normalized.toUpperCase().startsWith('TENANT-')) {
    candidates.add(`TENANT-${normalized}`);
  }

  return [...candidates];
}

export async function resolveTenantDbId(
  prisma: TenantLookupClient,
  tenantId: string,
): Promise<bigint> {
  const normalized = tenantId.trim();
  if (normalized.length === 0) {
    throw new Error('tenantId is required');
  }

  const tenant = await prisma.tenant.findFirst({
    where: {
      code: {
        in: tenantCodeCandidates(normalized),
      },
    },
    select: { id: true },
  });

  if (tenant) {
    return tenant.id;
  }

  try {
    return BigInt(normalized);
  } catch {
    throw new Error(
      `tenantId is not bigint-compatible and no tenant code matched: ${tenantId}`,
    );
  }
}
