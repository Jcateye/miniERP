import { evaluateApprovalGate } from './approval-gate';

describe('evaluateApprovalGate', () => {
  it('approves automatically when diff is within threshold', async () => {
    const result = await evaluateApprovalGate({
      overallDiffPercent: 20,
      threshold: 30,
      assumeYes: false,
    });

    expect(result).toEqual({
      required: false,
      approved: true,
      reason: 'within-threshold',
    });
  });

  it('approves automatically when assumeYes is enabled', async () => {
    const result = await evaluateApprovalGate({
      overallDiffPercent: 80,
      threshold: 30,
      assumeYes: true,
    });

    expect(result).toEqual({
      required: true,
      approved: true,
      reason: 'assume-yes',
    });
  });

  it('rejects in non-interactive environments when approval is required', async () => {
    const result = await evaluateApprovalGate({
      overallDiffPercent: 80,
      threshold: 30,
      assumeYes: false,
    });

    expect(result.required).toBe(true);
    expect(result.approved).toBe(false);
    expect(result.reason).toBe('non-interactive-rejected');
  });
});
