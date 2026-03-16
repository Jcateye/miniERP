import { ForbiddenException } from '@nestjs/common';
import { readAuthzResult } from './authz-context';

function permissionError(code: string): ForbiddenException {
  return new ForbiddenException({
    category: 'permission',
    code,
    message: 'Permission denied',
  });
}

export function requireAuthzPrismaWhere(): Record<string, unknown> {
  const authzResult = readAuthzResult();

  // Fail-closed: obligations 缺失时不能退化为全量读取。
  if (!authzResult) {
    throw permissionError('PERMISSION_AUTHZ_CONTEXT_MISSING');
  }

  const data = authzResult.obligations.data;
  if (typeof data !== 'object' || data === null) {
    throw permissionError('PERMISSION_AUTHZ_OBLIGATION_MISSING');
  }

  const kind = (data as { readonly kind?: unknown }).kind;
  if (kind !== 'prisma_where') {
    throw permissionError('PERMISSION_AUTHZ_OBLIGATION_INVALID');
  }

  const where = (data as { readonly where?: unknown }).where;
  if (typeof where !== 'object' || where === null) {
    throw permissionError('PERMISSION_AUTHZ_OBLIGATION_INVALID');
  }

  return where as Record<string, unknown>;
}

export function assertWorkflowTransitionAllowed(action: string): void {
  const authzResult = readAuthzResult();
  if (!authzResult) {
    throw permissionError('PERMISSION_AUTHZ_CONTEXT_MISSING');
  }

  const allowTransitions = authzResult.obligations.workflow?.allowTransitions;
  if (!Array.isArray(allowTransitions)) {
    throw permissionError('PERMISSION_AUTHZ_OBLIGATION_MISSING');
  }

  if (!allowTransitions.includes(action)) {
    throw permissionError('PERMISSION_DENIED');
  }
}
