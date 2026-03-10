import { describe, expect, test } from 'bun:test';

import { summarizeStoryFiles } from './verify-user-stories';

describe('summarizeStoryFiles', () => {
  test('按新 schema 统计通过数，并透传 route story 校验错误', () => {
    const result = summarizeStoryFiles([
      {
        filePath: 'docs/user-stories/good.json',
        content: JSON.stringify([
          {
            id: 'customers-list',
            scope: 'route',
            route: '/mdm/customers',
            routeType: 'list',
            family: 'T2',
            designNodeId: 'iYRfh',
            expectedRuntime: 'page.tsx -> customers-list-view',
            stage: 'rebuilt',
            description: 'customers list rebuilt',
            steps: ['页面已独立实现'],
            passes: true,
            category: 'functional'
          },
        ]),
      },
      {
        filePath: 'docs/user-stories/bad.json',
        content: JSON.stringify([
          {
            id: 'warehouses-list',
            scope: 'route',
            stage: 'planned',
            description: 'warehouses list planned',
            steps: ['待实现'],
            passes: false,
            category: 'ui'
          },
        ]),
      },
    ]);

    expect(result.total).toBe(2);
    expect(result.passed).toBe(1);
    expect(result.errors).toContain('docs/user-stories/bad.json#0: route story 必须提供 route');
  });

  test('报告 JSON 解析错误', () => {
    const result = summarizeStoryFiles([
      {
        filePath: 'docs/user-stories/invalid.json',
        content: '{invalid json}',
      },
    ]);

    expect(result.total).toBe(0);
    expect(result.passed).toBe(0);
    expect(result.errors[0]).toMatch(/^docs\/user-stories\/invalid.json: JSON 解析失败 -> /);
  });
});
