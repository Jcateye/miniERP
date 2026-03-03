import { GUARDS_METADATA } from '@nestjs/common/constants';
import { PLATFORM_ACTION_METADATA_KEY, IamGuard } from './iam.guard';
import { RequirePlatformAction } from './require-platform-action.decorator';

describe('RequirePlatformAction', () => {
  it('returns a decorator function', () => {
    const decorator = RequirePlatformAction('platform.audit.read');
    expect(typeof decorator).toBe('function');
  });

  it('sets platform action metadata and enforces IamGuard', () => {
    class TestController {
      @RequirePlatformAction('platform.audit.read')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      handle() {}
    }

    const metadataAction = Reflect.getMetadata(PLATFORM_ACTION_METADATA_KEY, TestController.prototype.handle);
    const guardMetadata = Reflect.getMetadata(GUARDS_METADATA, TestController.prototype.handle) as unknown[];

    expect(metadataAction).toBe('platform.audit.read');
    expect(guardMetadata).toContain(IamGuard);
  });
});
