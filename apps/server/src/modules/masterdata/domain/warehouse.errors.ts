import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

/**
 * Warehouse 编码重复
 */
export class WarehouseCodeDuplicateError extends ConflictException {
  constructor(code: string) {
    super(
      `Warehouse with code "${code}" already exists`,
      'MASTERDATA_WAREHOUSE_CODE_DUPLICATE',
    );
  }
}

/**
 * Warehouse 未找到
 */
export class WarehouseNotFoundError extends NotFoundException {
  constructor(id: string) {
    super(
      `Warehouse with id "${id}" not found`,
      'MASTERDATA_WAREHOUSE_NOT_FOUND',
    );
  }
}

/**
 * Warehouse 验证错误
 */
export class WarehouseValidationError extends BadRequestException {
  constructor(message: string) {
    super(message, 'MASTERDATA_WAREHOUSE_VALIDATION_ERROR');
  }
}
