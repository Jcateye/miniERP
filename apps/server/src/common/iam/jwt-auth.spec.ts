import * as jwt from 'jsonwebtoken';
import { verifyHs256Jwt } from './jwt-auth';

describe('jwt-auth', () => {
  it('verifies HS256 token and extracts sub + tenantId', async () => {
    const secret = 'test-jwt-secret';

    const token = jwt.sign(
      {
        tenantId: 'TENANT-1001',
      },
      secret,
      {
        algorithm: 'HS256',
        subject: '9001',
        expiresIn: '1h',
      },
    );

    await expect(verifyHs256Jwt({ token, secret })).resolves.toEqual({
      sub: '9001',
      tenantId: 'TENANT-1001',
    });
  });

  it('rejects token missing tenantId claim', async () => {
    const secret = 'test-jwt-secret';

    const token = jwt.sign({}, secret, {
      algorithm: 'HS256',
      subject: '9001',
      expiresIn: '1h',
    });

    await expect(verifyHs256Jwt({ token, secret })).rejects.toThrow(
      'JWT claim tenantId must be a string',
    );
  });
});
