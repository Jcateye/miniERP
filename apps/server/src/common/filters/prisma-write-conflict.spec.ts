import { Prisma } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';
import { rethrowPrismaWriteConflictAsHttpException } from './prisma-write-conflict';

describe('rethrowPrismaWriteConflictAsHttpException', () => {
  function captureThrown(fn: () => unknown): unknown {
    try {
      fn();
    } catch (error) {
      return error;
    }

    throw new Error('expected to throw');
  }

  it('maps P2002(docNo unique) to 409 conflict with CONFLICT_DUPLICATE_DOC_NO', () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['tenantId', 'docNo'] },
      },
    );

    const thrown = captureThrown(() =>
      rethrowPrismaWriteConflictAsHttpException(error),
    );

    expect(thrown).toBeInstanceOf(HttpException);
    const http = thrown as HttpException;
    expect(http.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(http.getResponse()).toEqual({
      category: 'conflict',
      code: 'CONFLICT_DUPLICATE_DOC_NO',
      message: '创建单据失败：单号冲突（并发提交），请重试提交',
    });
  });

  it('rethrows P2002 when unique target does not include docNo', () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['idempotencyKey'] },
      },
    );

    expect(() => {
      rethrowPrismaWriteConflictAsHttpException(error);
    }).toThrow(error);
  });

  it('maps P2002 when meta.target is string containing docNo', () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: 'PurchaseOrder_tenantId_docNo_key' },
      },
    );

    const thrown = captureThrown(() =>
      rethrowPrismaWriteConflictAsHttpException(error),
    );

    expect(thrown).toBeInstanceOf(HttpException);
    const http = thrown as HttpException;
    expect(http.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(http.getResponse()).toEqual({
      category: 'conflict',
      code: 'CONFLICT_DUPLICATE_DOC_NO',
      message: '创建单据失败：单号冲突（并发提交），请重试提交',
    });
  });

  it('maps P2034 to 409 conflict with CONFLICT_WRITE_CONFLICT', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Write conflict', {
      code: 'P2034',
      clientVersion: 'test',
    });

    const thrown = captureThrown(() =>
      rethrowPrismaWriteConflictAsHttpException(error),
    );

    expect(thrown).toBeInstanceOf(HttpException);
    const http = thrown as HttpException;
    expect(http.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(http.getResponse()).toEqual({
      category: 'conflict',
      code: 'CONFLICT_WRITE_CONFLICT',
      message: '创建单据失败：并发写冲突，请重试提交',
    });
  });

  it('rethrows non-Prisma errors as-is', () => {
    const error = new Error('boom');

    expect(() => {
      rethrowPrismaWriteConflictAsHttpException(error);
    }).toThrow(error);
  });

  it('allows overriding messages', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Write conflict', {
      code: 'P2034',
      clientVersion: 'test',
    });

    const thrown = captureThrown(() =>
      rethrowPrismaWriteConflictAsHttpException(error, {
        writeConflict: '自定义文案：请稍后重试',
      }),
    );

    expect(thrown).toBeInstanceOf(HttpException);
    const http = thrown as HttpException;
    expect(http.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(http.getResponse()).toEqual({
      category: 'conflict',
      code: 'CONFLICT_WRITE_CONFLICT',
      message: '自定义文案：请稍后重试',
    });
  });
});
