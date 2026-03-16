import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiErrorPayload } from '@minierp/shared';

export interface PrismaWriteConflictMessages {
  readonly duplicateDocNo: string;
  readonly writeConflict: string;
}

const DEFAULT_MESSAGES: PrismaWriteConflictMessages = {
  duplicateDocNo: '创建单据失败：单号冲突（并发提交），请重试提交',
  writeConflict: '创建单据失败：并发写冲突，请重试提交',
};

function asConflictException(payload: ApiErrorPayload): HttpException {
  return new HttpException(payload, HttpStatus.CONFLICT);
}

function isDocNoUniqueConflict(
  error: Prisma.PrismaClientKnownRequestError,
): boolean {
  const target = (error.meta as { target?: unknown } | undefined)?.target;
  if (Array.isArray(target)) {
    return target.includes('docNo');
  }

  if (typeof target === 'string') {
    return target.includes('docNo');
  }

  return false;
}

/**
 * Phase1 fail-fast：不做自动重试；遇到 Prisma 写冲突/单号唯一冲突时，直接抛 409 引导用户重试提交。
 *
 * 注意：P2002（唯一约束冲突）语义很宽，这里只在能确认冲突目标包含 docNo 时才映射为“单号冲突”。
 */
export function rethrowPrismaWriteConflictAsHttpException(
  error: unknown,
  messages: Partial<PrismaWriteConflictMessages> = {},
): never {
  const resolvedMessages: PrismaWriteConflictMessages = {
    ...DEFAULT_MESSAGES,
    ...messages,
  };

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    isDocNoUniqueConflict(error)
  ) {
    throw asConflictException({
      category: 'conflict',
      code: 'CONFLICT_DUPLICATE_DOC_NO',
      message: resolvedMessages.duplicateDocNo,
    });
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2034'
  ) {
    throw asConflictException({
      category: 'conflict',
      code: 'CONFLICT_WRITE_CONFLICT',
      message: resolvedMessages.writeConflict,
    });
  }

  throw error;
}
