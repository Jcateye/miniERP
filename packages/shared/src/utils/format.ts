// 生成单据编号
export function generateDocNo(type: string, date: Date = new Date(), seq: number = 1): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seqStr = seq.toString().padStart(3, '0');
  return `DOC-${type}-${dateStr}-${seqStr}`;
}

// 格式化金额
export function formatAmount(amount: number, currency: string = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
  }).format(amount);
}

// 格式化日期
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN');
}
