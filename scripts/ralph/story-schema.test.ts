import { describe, expect, test } from 'bun:test';

import { validateStoryDocument } from './story-schema';

describe('validateStoryDocument', () => {
  test('要求 route story 提供 route 元数据', () => {
    const errors = validateStoryDocument(
      [
        {
          id: 'customers-list',
          scope: 'route',
          stage: 'planned',
          description: 'customers list',
          steps: ['实现页面'],
          passes: false,
          category: 'ui',
        },
      ],
      'docs/user-stories/customers.json',
    );

    expect(errors).toContain('docs/user-stories/customers.json#0: route story 必须提供 route');
    expect(errors).toContain('docs/user-stories/customers.json#0: route story 必须提供 routeType');
    expect(errors).toContain('docs/user-stories/customers.json#0: route story 必须提供 family');
    expect(errors).toContain('docs/user-stories/customers.json#0: route story 必须提供 designNodeId');
    expect(errors).toContain('docs/user-stories/customers.json#0: route story 必须提供 expectedRuntime');
  });

  test('只允许 rebuilt 阶段的 route story 标记 passes=true', () => {
    const errors = validateStoryDocument(
      [
        {
          id: 'customers-list',
          scope: 'route',
          route: '/mdm/customers',
          routeType: 'list',
          family: 'T2',
          designNodeId: 'iYRfh',
          expectedRuntime: 'page-level-view',
          stage: 'visual-done',
          description: 'customers list',
          steps: ['实现页面'],
          passes: true,
          category: 'ui',
        },
      ],
      'docs/user-stories/customers.json',
    );

    expect(errors).toContain('docs/user-stories/customers.json#0: 只有 stage=rebuilt 的 route story 才能标记 passes=true');
  });

  test('允许 meta story 不提供 route 元数据', () => {
    const errors = validateStoryDocument(
      [
        {
          id: 'ralph-foundation',
          scope: 'meta',
          stage: 'tests-passed',
          description: 'ralph foundation',
          steps: ['校验脚本可运行'],
          passes: false,
          category: 'functional',
        },
      ],
      'docs/user-stories/foundation.json',
    );

    expect(errors).toEqual([]);
  });
});
