CREATE TABLE IF NOT EXISTS public.tenants (
  tenant_id text PRIMARY KEY,
  schema_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS tenants_schema_name_key
  ON public.tenants (schema_name);
