import { redactAuditMetadata } from './audit-redactor';

describe('redactAuditMetadata', () => {
  it('redacts secret-like keys', () => {
    expect(
      redactAuditMetadata({
        accessToken: 'abc',
        password: 'pwd',
        normalField: 'ok',
      }),
    ).toEqual({
      accessToken: '[REDACTED]',
      password: '[REDACTED]',
      normalField: 'ok',
    });
  });

  it('returns empty object for undefined metadata', () => {
    expect(redactAuditMetadata(undefined)).toEqual({});
  });
});
