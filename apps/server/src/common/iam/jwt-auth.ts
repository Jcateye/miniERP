import * as jwt from 'jsonwebtoken';

export interface JwtClaims {
  readonly sub: string;
  readonly tenantId: string;
}

function parseRequiredStringClaim(
  payload: jwt.JwtPayload,
  key: 'sub' | 'tenantId',
): string {
  const raw: unknown = (payload as Record<string, unknown>)[key];
  if (typeof raw !== 'string') {
    throw new Error(`JWT claim ${key} must be a string`);
  }

  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new Error(`JWT claim ${key} is required`);
  }

  return trimmed;
}

export function verifyHs256Jwt(options: {
  readonly token: string;
  readonly secret: string;
}): Promise<JwtClaims> {
  try {
    const decoded = jwt.verify(options.token, options.secret, {
      algorithms: ['HS256'],
    });

    if (!decoded || typeof decoded === 'string') {
      throw new Error('JWT payload must be an object');
    }

    const payload = decoded;

    return Promise.resolve<JwtClaims>({
      sub: parseRequiredStringClaim(payload, 'sub'),
      tenantId: parseRequiredStringClaim(payload, 'tenantId'),
    });
  } catch (error) {
    const reason = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(reason);
  }
}
