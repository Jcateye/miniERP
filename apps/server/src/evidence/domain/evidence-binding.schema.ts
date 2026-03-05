import { z } from 'zod';

export const evidenceScopeSchema = z.enum(['document', 'line']);

const nonEmptyStringSchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, 'must not be empty');

const bigIntStringSchema = z.string().regex(/^\d+$/u, 'Expected bigint string');

function ensureScopeLineRefConsistency(
  value: {
    readonly scope: 'document' | 'line';
    readonly lineRef?: string;
  },
  context: z.RefinementCtx,
): void {
  if (value.scope === 'line' && !value.lineRef) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'lineRef is required when scope is line',
      path: ['lineRef'],
    });
  }

  if (value.scope === 'document' && value.lineRef) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'lineRef must be empty when scope is document',
      path: ['lineRef'],
    });
  }
}

export const evidenceCollectionQuerySchema = z
  .object({
    entityType: nonEmptyStringSchema,
    entityId: nonEmptyStringSchema,
    scope: evidenceScopeSchema.default('document'),
    lineRef: nonEmptyStringSchema.optional(),
    tag: nonEmptyStringSchema.optional(),
  })
  .superRefine((value, context) =>
    ensureScopeLineRefConsistency(value, context),
  );

export const createEvidenceLinkSchema = z
  .object({
    assetId: bigIntStringSchema,
    entityType: nonEmptyStringSchema,
    entityId: nonEmptyStringSchema,
    scope: evidenceScopeSchema.default('document'),
    lineRef: nonEmptyStringSchema.optional(),
    tag: nonEmptyStringSchema.default('other'),
  })
  .superRefine((value, context) =>
    ensureScopeLineRefConsistency(value, context),
  );

export const createEvidenceUploadIntentSchema = z
  .object({
    entityType: nonEmptyStringSchema.default('unknown'),
    entityId: nonEmptyStringSchema.default('0'),
    scope: evidenceScopeSchema.default('document'),
    lineRef: nonEmptyStringSchema.optional(),
    tag: nonEmptyStringSchema.default('other'),
    fileName: nonEmptyStringSchema,
    contentType: nonEmptyStringSchema.default('application/octet-stream'),
    sizeBytes: bigIntStringSchema.default('0'),
  })
  .superRefine((value, context) =>
    ensureScopeLineRefConsistency(value, context),
  );

export type EvidenceCollectionQueryInput = z.output<
  typeof evidenceCollectionQuerySchema
>;
export type CreateEvidenceLinkInput = z.output<typeof createEvidenceLinkSchema>;
export type CreateEvidenceUploadIntentInput = z.output<
  typeof createEvidenceUploadIntentSchema
>;
