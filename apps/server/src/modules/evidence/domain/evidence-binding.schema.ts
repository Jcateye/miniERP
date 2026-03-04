import { z } from 'zod';

const bigIntStringSchema = z.string().regex(/^\d+$/u, 'Expected bigint string');

export const evidenceBindingSchema = z
  .object({
    tenantId: bigIntStringSchema.optional(),
    evidenceId: bigIntStringSchema,
    entityType: z.string().min(1).max(64),
    entityId: bigIntStringSchema,
    bindingLevel: z.enum(['document', 'line']),
    lineId: bigIntStringSchema.optional(),
    tag: z.string().min(1).max(64),
  })
  .superRefine((value, context) => {
    if (value.bindingLevel === 'line' && !value.lineId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'lineId is required when bindingLevel is line',
        path: ['lineId'],
      });
    }

    if (value.bindingLevel === 'document' && value.lineId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'lineId must be empty when bindingLevel is document',
        path: ['lineId'],
      });
    }
  });

export type EvidenceBindingInput = z.infer<typeof evidenceBindingSchema>;
