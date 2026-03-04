import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export interface ApprovalInput {
  readonly overallDiffPercent: number;
  readonly threshold: number;
  readonly assumeYes: boolean;
}

export interface ApprovalResult {
  readonly required: boolean;
  readonly approved: boolean;
  readonly reason:
    | 'within-threshold'
    | 'assume-yes'
    | 'interactive-approved'
    | 'interactive-rejected'
    | 'non-interactive-rejected';
}

export async function evaluateApprovalGate(
  inputData: ApprovalInput,
): Promise<ApprovalResult> {
  const required = inputData.overallDiffPercent > inputData.threshold;

  if (!required) {
    return {
      required,
      approved: true,
      reason: 'within-threshold',
    };
  }

  if (inputData.assumeYes) {
    return {
      required,
      approved: true,
      reason: 'assume-yes',
    };
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return {
      required,
      approved: false,
      reason: 'non-interactive-rejected',
    };
  }

  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(
      `Codemap diff ${inputData.overallDiffPercent}% exceeds threshold ${inputData.threshold}%. Approve update? (y/N): `,
    );
    const approved = answer.trim().toLowerCase() === 'y';

    return {
      required,
      approved,
      reason: approved ? 'interactive-approved' : 'interactive-rejected',
    };
  } finally {
    rl.close();
  }
}
