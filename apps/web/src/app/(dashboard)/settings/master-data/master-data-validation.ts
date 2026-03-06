export function validateCode(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return '编码不能为空。';
  }

  if (trimmed.length > 32) {
    return '编码长度不能超过 32 个字符。';
  }

  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return '编码仅支持字母、数字、中划线和下划线。';
  }

  return null;
}

export function validateName(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return '名称不能为空。';
  }

  if (trimmed.length > 80) {
    return '名称长度不能超过 80 个字符。';
  }

  return null;
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > 120) {
    return '邮箱长度不能超过 120 个字符。';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return '邮箱格式不正确。';
  }

  return null;
}

export function validatePhone(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > 32) {
    return '联系电话长度不能超过 32 个字符。';
  }

  if (!/^[0-9+()\-\s]+$/.test(trimmed)) {
    return '联系电话格式不正确。';
  }

  return null;
}

export function validateAddress(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > 200) {
    return '地址长度不能超过 200 个字符。';
  }

  return null;
}
