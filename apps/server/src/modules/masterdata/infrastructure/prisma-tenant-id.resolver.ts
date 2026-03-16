import type { Prisma } from '@prisma/client';
import type { PrismaService } from '../../../database/prisma.service';

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

function toDbId(value: string): bigint | null {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

export async function resolveTenantDbId(
  prisma: TenantLookupClient,
  tenantId: string,
): Promise<bigint> {
  const normalized = tenantId.trim();
  if (normalized.length === 0) {
    throw new Error('tenantId is required');
  }

  const tenantIdCandidate = toDbId(normalized);

  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        {
          code: {
            in: tenantCodeCandidates(normalized),
          },
        },
        ...(tenantIdCandidate === null ? [] : [{ id: tenantIdCandidate }]),
      ],
    },
    select: { id: true },
  });

  if (!tenant) {
    throw new Error(`Unknown tenantId: ${tenantId}`);
  }

  return tenant.id;
}
