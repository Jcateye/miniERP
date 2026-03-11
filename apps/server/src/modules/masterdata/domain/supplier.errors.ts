import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

/**
 * Supplier 编码重复
 */
export class SupplierCodeDuplicateError extends ConflictException {
  constructor(code: string) {
    super(
      `Supplier with code "${code}" already exists`,
      'MASTERDATA_SUPPLIER_CODE_DUPLICATE',
    );
  }
}

/**
 * Supplier 未找到
 */
export class SupplierNotFoundError extends NotFoundException {
  constructor(id: string) {
    super(
      `Supplier with id "${id}" not found`,
      'MASTERDATA_SUPPLIER_NOT_FOUND',
    );
  }
}

/**
 * Supplier 验证错误
 */
export class SupplierValidationError extends BadRequestException {
  constructor(message: string) {
    super(message, 'MASTERDATA_SUPPLIER_VALIDATION_ERROR');
  }
}
