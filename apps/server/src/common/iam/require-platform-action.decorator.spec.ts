/* eslint-disable @typescript-eslint/unbound-method */
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
      handle(): void {
        // Method body intentionally empty for decorator test
      }
    }

    const target = TestController.prototype;
    const metadataAction = Reflect.getMetadata(
      PLATFORM_ACTION_METADATA_KEY,
      target.handle,
    ) as unknown;
    const guardMetadata = Reflect.getMetadata(
      GUARDS_METADATA,
      target.handle,
    ) as unknown[];

    expect(metadataAction).toBe('platform.audit.read');
    expect(guardMetadata).toContain(IamGuard);
  });
});
