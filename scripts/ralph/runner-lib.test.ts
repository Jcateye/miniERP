import { describe, expect, test } from 'bun:test';

import { parseRunnerArgs, resolveRunnerOutcome } from './runner-lib';

describe('parseRunnerArgs', () => {
  test('默认 maxIterations 为 100', () => {
    expect(parseRunnerArgs(['node', 'runner.ts'])).toEqual({
      extraPrompt: '',
      maxIterations: 100,
    });
  });

  test('拒绝非法 maxIterations', () => {
    expect(() => parseRunnerArgs(['node', 'runner.ts', '--max-iterations', 'abc'])).toThrow(
      '--max-iterations 必须是正整数',
    );
  });
});

describe('resolveRunnerOutcome', () => {
  test('子进程被 signal 终止时抛错，不允许误报成功', () => {
    expect(() => resolveRunnerOutcome({ status: null, signal: 'SIGTERM', error: undefined })).toThrow(
      'Ralph Loop 被信号中断: SIGTERM',
    );
  });

  test('正常 status 直接返回退出码', () => {
    expect(resolveRunnerOutcome({ status: 3, signal: null, error: undefined })).toBe(3);
  });
});
