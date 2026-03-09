import {
  buildQualityRecordsActiveFilters,
  buildQualityRecordsNavigationTarget,
  getQualityRecordsNavigationReplaceTarget,
  getSeedQualityRecordListItems,
} from './use-records-page-vm';

describe('quality records page vm', () => {
  it('returns seeded quality record items while upstream source is pending', () => {
    expect(getSeedQualityRecordListItems()).toEqual([
      {
        id: 'qc_001',
        recordNumber: 'QC-20260308-001',
        inspectionTypeLabel: '来料检验',
        sourceNumber: 'DOC-PO-20260305-008',
        subjectLabel: '网络交换机批次 A01',
        inspectorName: '王五',
        conclusionLabel: '待检',
        status: 'pending',
        initiatedByMe: false,
      },
      {
        id: 'qc_002',
        recordNumber: 'QC-20260308-002',
        inspectionTypeLabel: '出货检验',
        sourceNumber: 'DOC-SHP-20260308-003',
        subjectLabel: '客户订单 SO-91',
        inspectorName: '赵六',
        conclusionLabel: '合格',
        status: 'passed',
        initiatedByMe: true,
      },
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedQualityRecordListItems();
    const second = getSeedQualityRecordListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.recordNumber).toBe('QC-20260308-001');
  });

  it('builds active filters from current input state for immediate list updates', () => {
    expect(
      buildQualityRecordsActiveFilters({
        keywordInput: ' 王五 ',
        scopeInput: 'mine-pending',
      }),
    ).toEqual({
      keyword: '王五',
      scope: 'mine-pending',
    });
  });

  it('builds navigation target from pathname, keyword, and scope', () => {
    expect(
      buildQualityRecordsNavigationTarget('/quality/records', {
        keyword: ' 王五 ',
        scope: 'mine-pending',
      }),
    ).toBe('/quality/records?keyword=%E7%8E%8B%E4%BA%94&scope=mine-pending');

    expect(
      buildQualityRecordsNavigationTarget('/quality/records', {
        keyword: ' ',
        scope: 'mine-recorded',
      }),
    ).toBe('/quality/records?scope=mine-recorded');
  });

  it('returns null when current URL already matches quality record filter state', () => {
    expect(
      getQualityRecordsNavigationReplaceTarget(
        '/quality/records',
        new URLSearchParams('keyword=%E7%8E%8B%E4%BA%94&scope=mine-pending'),
        {
          keyword: ' 王五 ',
          scope: 'mine-pending',
        },
      ),
    ).toBeNull();
  });

  it('returns next URL when quality record filter state changes', () => {
    expect(
      getQualityRecordsNavigationReplaceTarget(
        '/quality/records',
        new URLSearchParams('keyword=%E7%8E%8B%E4%BA%94&scope=mine-pending'),
        {
          keyword: ' 赵六 ',
          scope: 'mine-closed',
        },
      ),
    ).toBe('/quality/records?keyword=%E8%B5%B5%E5%85%AD&scope=mine-closed');
  });
});
