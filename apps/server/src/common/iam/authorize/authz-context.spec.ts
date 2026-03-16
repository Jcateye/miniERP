import { authzContextStorage, requireAuthzResult } from './authz-context';

describe('authzContextStorage', () => {
  it('requires authz result within ALS context', () => {
    expect(() => requireAuthzResult()).toThrow(
      'Authorization context is not available in current execution context',
    );

    authzContextStorage.run(
      {
        result: {
          decision: 'allow',
          obligations: {},
        },
      },
      () => {
        expect(requireAuthzResult()).toEqual({
          decision: 'allow',
          obligations: {},
        });
      },
    );
  });
});
