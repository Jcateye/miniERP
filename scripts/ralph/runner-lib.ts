type RunnerArgs = {
  extraPrompt: string;
  maxIterations: number;
};

type RunnerOutcome = {
  status: number | null;
  signal: NodeJS.Signals | null;
  error?: Error;
};

function getFlagValue(argv: string[], flag: string): string | undefined {
  const index = argv.findIndex((argument) => argument === flag);
  if (index === -1) {
    return undefined;
  }

  const nextValue = argv[index + 1];
  if (!nextValue || nextValue.startsWith('--')) {
    throw new Error(`${flag} 需要提供值`);
  }

  return nextValue;
}

export function parseRunnerArgs(argv: string[]): RunnerArgs {
  const maxIterationsValue = getFlagValue(argv, '--max-iterations');
  const extraPrompt = getFlagValue(argv, '--prompt') ?? '';

  if (maxIterationsValue === undefined) {
    return {
      extraPrompt,
      maxIterations: 100,
    };
  }

  const maxIterations = Number.parseInt(maxIterationsValue, 10);
  if (!Number.isInteger(maxIterations) || maxIterations <= 0) {
    throw new Error('--max-iterations 必须是正整数');
  }

  return {
    extraPrompt,
    maxIterations,
  };
}

export function resolveRunnerOutcome(result: RunnerOutcome): number {
  if (result.error) {
    throw new Error(
      [
        '启动 Ralph Loop 失败。',
        `原因: ${result.error.message}`,
        '请检查 claude CLI 是否已安装、命令是否可用，以及当前 shell PATH 是否正确。',
      ].join('\n'),
    );
  }

  if (result.signal) {
    throw new Error(`Ralph Loop 被信号中断: ${result.signal}`);
  }

  if (typeof result.status !== 'number') {
    throw new Error('Ralph Loop 退出状态未知，无法确认是否执行成功。');
  }

  return result.status;
}
