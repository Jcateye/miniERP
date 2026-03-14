import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AuthorizeGuard } from './authorize.guard';
import { RequireAuthorize } from './require-authorize.decorator';

describe('RequireAuthorize', () => {
  it('sets authz metadata and enforces AuthorizeGuard', () => {
    class TestController {
      @RequireAuthorize({ resource: 'erp:order', action: 'read' })
      handle(): void {
        // Method body intentionally empty for decorator test
      }
    }

    const target = TestController.prototype;
    const requirement = Reflect.getMetadata(
      'authz_requirement',
      target.handle,
    ) as unknown;
    const guardMetadata = Reflect.getMetadata(
      GUARDS_METADATA,
      target.handle,
    ) as unknown[];

    expect(requirement).toEqual({ resource: 'erp:order', action: 'read' });
    expect(guardMetadata).toContain(AuthorizeGuard);
  });
});
