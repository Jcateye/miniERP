import {
  hasPermission,
  parseAction,
  parseResource,
  toPermissionCode,
} from '@minierp/platform-policy';

describe('platform-policy', () => {
  it('accepts valid resource formats', () => {
    expect(parseResource('erp:order')).toBe('erp:order');
    expect(parseResource('erp:inventory-ledger')).toBe('erp:inventory-ledger');
    expect(parseResource('erp:order:line')).toBe('erp:order:line');
  });

  it('rejects invalid resource formats', () => {
    expect(() => parseResource('erp')).toThrow();
    expect(() => parseResource('erp:')).toThrow();
    expect(() => parseResource('erp::order')).toThrow();
    expect(() => parseResource('erp:Order')).toThrow();
  });

  it('accepts allowed actions', () => {
    expect(parseAction('read')).toBe('read');
    expect(parseAction('export')).toBe('export');
    expect(parseAction('*')).toBe('*');
  });

  it('builds permission code from resource+action', () => {
    expect(toPermissionCode({ resource: 'erp:order', action: 'read' })).toBe(
      'erp:order:read',
    );
  });

  it('matches exact permission', () => {
    expect(hasPermission(['erp:order:read'], 'erp:order:read')).toBe(true);
    expect(hasPermission(['erp:order:read'], 'erp:order:update')).toBe(false);
  });

  it('matches app wildcard', () => {
    const required = 'erp:order:read';
    expect(hasPermission(['erp:*'], required)).toBe(true);
    expect(hasPermission(['wms:*'], required)).toBe(false);
  });
});
