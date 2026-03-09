export type QualityRecordDetailSummaryItem = {
  id: string;
  label: string;
  value: string;
};

export type QualityRecordDetailSection = {
  id: string;
  title: string;
  body: string;
};

export const QUALITY_RECORD_DETAIL_PAGE_PRESENTATION = {
  family: 'T3',
  title: '质检记录详情',
  summary: '详情数据接入中',
  backLabel: '返回质检记录',
  backHref: '/quality/records',
} as const;

export function buildQualityRecordDetailSummary(recordId: string): readonly QualityRecordDetailSummaryItem[] {
  return [
    {
      id: 'record-id',
      label: '记录 ID',
      value: recordId,
    },
    {
      id: 'inspection-type',
      label: '检验类型',
      value: '待接入',
    },
    {
      id: 'conclusion',
      label: '检验结论',
      value: '待接入',
    },
  ];
}

export function buildQualityRecordDetailSections(): readonly QualityRecordDetailSection[] {
  return [
    {
      id: 'conclusion',
      title: '检验结论',
      body: '该区块待接入真实详情数据。',
    },
    {
      id: 'defects',
      title: '缺陷项',
      body: '该区块待接入真实详情数据。',
    },
    {
      id: 'attachments',
      title: '附件',
      body: '该区块待接入真实详情数据。',
    },
    {
      id: 'timeline',
      title: '处置轨迹',
      body: '该区块待接入真实详情数据。',
    },
  ];
}
