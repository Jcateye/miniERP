import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateStoryDocument } from './ralph/story-schema';

type StoryFile = {
  filePath: string;
  content: string;
};

type StorySummary = {
  errors: string[];
  passed: number;
  total: number;
};

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(SCRIPT_DIR, '..');
const STORIES_ROOT = join(REPO_ROOT, 'docs', 'user-stories');

function collectJsonFiles(directory: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const filePath = join(directory, entry);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      files.push(...collectJsonFiles(filePath));
      continue;
    }

    if (entry.endsWith('.json')) {
      files.push(filePath);
    }
  }

  return files;
}

function collectStoryFiles(root: string): StoryFile[] {
  return collectJsonFiles(root).map((filePath) => ({
    filePath,
    content: readFileSync(filePath, 'utf8'),
  }));
}

export function summarizeStoryFiles(files: StoryFile[]): StorySummary {
  const errors: string[] = [];
  let total = 0;
  let passed = 0;

  for (const file of files) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(file.content);
    } catch (error) {
      errors.push(
        `${file.filePath}: JSON 解析失败 -> ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      continue;
    }

    errors.push(...validateStoryDocument(parsed, file.filePath));

    if (!Array.isArray(parsed)) {
      continue;
    }

    total += parsed.length;
    passed += parsed.filter(
      (story) => typeof story === 'object' && story !== null && 'passes' in story && story.passes === true,
    ).length;
  }

  return {
    errors,
    passed,
    total,
  };
}

function main() {
  const files = collectStoryFiles(STORIES_ROOT).map((file) => ({
    ...file,
    filePath: relative(REPO_ROOT, file.filePath),
  }));

  if (files.length === 0) {
    throw new Error('docs/user-stories/ 下未找到任何 .json 文件');
  }

  const summary = summarizeStoryFiles(files);

  if (summary.errors.length > 0) {
    for (const error of summary.errors) {
      console.error(error);
    }
    process.exit(1);
  }

  console.log(`user stories 校验通过：${summary.passed}/${summary.total} 已通过`);
}

if (import.meta.main) {
  main();
}
