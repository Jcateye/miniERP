import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseRunnerArgs, resolveRunnerOutcome } from './runner-lib';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, '..', '..');
const promptPath = join(REPO_ROOT, 'scripts', 'ralph', 'prompt.md');
const { extraPrompt, maxIterations } = parseRunnerArgs(process.argv);
const promptContent = readFileSync(promptPath, 'utf8');
const finalPrompt = extraPrompt ? `${promptContent}\n\n## 本次附加指令\n\n${extraPrompt}\n` : promptContent;

const preflight = spawnSync('claude', ['--help'], {
  cwd: REPO_ROOT,
  encoding: 'utf8',
  env: process.env,
});

if (preflight.error) {
  throw new Error(
    [
      'Ralph Loop preflight 失败。',
      `原因: ${preflight.error.message}`,
      '请确认本机已安装 Claude Code CLI，并且 claude 命令可在当前 shell 中访问。',
    ].join('\n'),
  );
}

if (!existsSync(join(REPO_ROOT, '.claude', 'skills', 'ralph-loop'))) {
  throw new Error('Ralph Loop preflight 失败：仓库内未找到 .claude/skills/ralph-loop，当前自动循环入口不可复现。');
}

const result = spawnSync(
  'claude',
  [
    '/ralph-loop:ralph-loop',
    '--max-iterations',
    String(maxIterations),
    finalPrompt,
  ],
  {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: process.env,
  },
);

process.exit(resolveRunnerOutcome(result));
