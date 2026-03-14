import { PrismaClient } from '@prisma/client';

const VALID_IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/u;

function usage(): never {
  throw new Error(
    'Usage: bun run scripts/tenant-init.ts <tenantId> <schemaName>',
  );
}

function readArgs(): { tenantId: string; schemaName: string } {
  const tenantId = process.argv[2]?.trim();
  const schemaName = process.argv[3]?.trim();

  if (!tenantId || !schemaName) {
    usage();
  }

  if (!VALID_IDENTIFIER_PATTERN.test(schemaName)) {
    throw new Error(`Invalid schemaName: ${schemaName}`);
  }

  return { tenantId, schemaName };
}

async function main(): Promise<void> {
  const { tenantId, schemaName } = readArgs();
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.tenants (
        tenant_id text PRIMARY KEY,
        schema_name text NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE public.tenants
        ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE public.tenants
        ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE public.tenants
        ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()
    `);

    await prisma.$executeRawUnsafe(
      'CREATE UNIQUE INDEX IF NOT EXISTS tenants_schema_name_key ON public.tenants (schema_name)',
    );

    await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    await prisma.$executeRawUnsafe(
      `INSERT INTO public.tenants (tenant_id, schema_name, is_active)
       VALUES ($1, $2, true)
       ON CONFLICT (tenant_id) DO UPDATE
       SET schema_name = EXCLUDED.schema_name,
           is_active = true,
           updated_at = now()`,
      tenantId,
      schemaName,
    );

    console.log(`tenant initialized: ${tenantId} -> ${schemaName}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
