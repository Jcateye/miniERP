import type { MasterDataFormValues, MasterDataOperation } from './master-data-config';
import {
  validateAddress,
  validateCode,
  validateEmail,
  validateName,
  validatePhone,
} from './master-data-validation';

export async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(mapErrorMessage(response.status));
  }

  return payload as T;
}

function mapErrorMessage(status: number): string {
  if (status === 400) {
    return '提交内容不符合要求，请检查后重试。';
  }

  if (status === 404) {
    return '目标记录不存在或已被删除。';
  }

  if (status === 409) {
    return '编码已存在或数据状态冲突，请调整后重试。';
  }

  if (status >= 500) {
    return '服务暂时不可用，请稍后重试。';
  }

  return `请求失败：${status}`;
}

export function validateForm(
  values: MasterDataFormValues,
  operation: MasterDataOperation,
): string | null {
  if (operation === 'create') {
    const codeError = validateCode(values.code);
    if (codeError) {
      return codeError;
    }
  }

  const nameError = validateName(values.name);
  if (nameError) {
    return nameError;
  }

  const emailError = validateEmail(values.email);
  if (emailError) {
    return emailError;
  }

  const phoneError = validatePhone(values.contactPhone);
  if (phoneError) {
    return phoneError;
  }

  const addressError = validateAddress(values.address);
  if (addressError) {
    return addressError;
  }

  return null;
}

export function hasActiveFilters(code: string, name: string, isActive: string): boolean {
  return code.trim().length > 0 || name.trim().length > 0 || isActive.length > 0;
}
