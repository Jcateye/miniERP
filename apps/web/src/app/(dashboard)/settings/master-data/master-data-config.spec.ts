import {
  buildApiPath,
  buildQueryString,
  parseFilters,
  parseTab,
} from './master-data-config';
import {
  validateAddress,
  validateCode,
  validateEmail,
  validateName,
  validatePhone,
} from './master-data-validation';

describe('master-data config helpers', () => {
  it('defaults to warehouses when tab is missing or invalid', () => {
    expect(parseTab(null)).toBe('warehouses');
    expect(parseTab('invalid')).toBe('warehouses');
    expect(parseTab('suppliers')).toBe('suppliers');
  });

  it('parses filters from URLSearchParams', () => {
    const params = new URLSearchParams('code=W001&name=Main&isActive=true');

    expect(parseFilters(params)).toEqual({
      code: 'W001',
      name: 'Main',
      isActive: 'true',
    });
  });

  it('ignores invalid status filter values', () => {
    const params = new URLSearchParams('isActive=maybe');

    expect(parseFilters(params)).toEqual({
      code: '',
      name: '',
      isActive: '',
    });
  });

  it('serializes query string with trimmed values', () => {
    expect(
      buildQueryString('customers', {
        code: ' C001 ',
        name: ' Alice ',
        isActive: 'false',
      }),
    ).toBe('tab=customers&code=C001&name=Alice&isActive=false');
  });

  it('builds API path with active filters only', () => {
    expect(
      buildApiPath('/api/bff/warehouses', {
        code: ' W001 ',
        name: '',
        isActive: 'true',
      }),
    ).toBe('/api/bff/warehouses?code=W001&isActive=true');
  });
});

describe('master-data validation helpers', () => {
  it('validates code rules', () => {
    expect(validateCode('')).toBe('编码不能为空。');
    expect(validateCode('abc*')).toBe('编码仅支持字母、数字、中划线和下划线。');
    expect(validateCode('VALID_CODE-1')).toBeNull();
  });

  it('validates name rules', () => {
    expect(validateName('')).toBe('名称不能为空。');
    expect(validateName('正常名称')).toBeNull();
  });

  it('validates optional email, phone and address', () => {
    expect(validateEmail('bad-email')).toBe('邮箱格式不正确。');
    expect(validateEmail('user@example.com')).toBeNull();
    expect(validatePhone('abc')).toBe('联系电话格式不正确。');
    expect(validatePhone('+86 138-0013-8000')).toBeNull();
    expect(validateAddress('正常地址')).toBeNull();
  });
});
