import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

/**
 * SKU 编码重复
 */
export class SkuCodeDuplicateError extends ConflictException {
  constructor(code: string) {
    super(
      `SKU with code "${code}" already exists`,
      'MASTERDATA_SKU_CODE_DUPLICATE',
    );
  }
}

/**
 * SKU 未找到
 */
export class SkuNotFoundError extends NotFoundException {
  constructor(id: string) {
    super(`SKU with id "${id}" not found`, 'MASTERDATA_SKU_NOT_FOUND');
  }
}

/**
 * SKU 验证错误
 */
export class SkuValidationError extends BadRequestException {
  constructor(message: string) {
    super(message, 'MASTERDATA_SKU_VALIDATION_ERROR');
  }
}
