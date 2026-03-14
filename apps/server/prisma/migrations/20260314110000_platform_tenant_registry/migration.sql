CREATE TABLE IF NOT EXISTS public.tenants (
  tenant_id text PRIMARY KEY,
  schema_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS tenants_schema_name_key
  ON public.tenants (schema_name);
