import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

/**
 * Customer 编码重复
 */
export class CustomerCodeDuplicateError extends ConflictException {
  constructor(code: string) {
    super(`Customer with code "${code}" already exists`, 'MASTERDATA_CUSTOMER_CODE_DUPLICATE');
  }
}

/**
 * Customer 未找到
 */
export class CustomerNotFoundError extends NotFoundException {
  constructor(id: string) {
    super(`Customer with id "${id}" not found`, 'MASTERDATA_CUSTOMER_NOT_FOUND');
  }
}

/**
 * Customer 验证错误
 */
export class CustomerValidationError extends BadRequestException {
  constructor(message: string) {
    super(message, 'MASTERDATA_CUSTOMER_VALIDATION_ERROR');
  }
}
