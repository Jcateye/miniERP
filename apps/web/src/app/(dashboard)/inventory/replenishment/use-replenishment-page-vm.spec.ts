import { getSeedReplenishmentListItems } from './use-replenishment-page-vm';

describe('inventory replenishment page vm', () => {
  it('returns seeded replenishment items while upstream source is pending', () => {
    expect(getSeedReplenishmentListItems()).toEqual([
      {
        id: 'rep_1',
        itemCode: 'ADP-USBC-VGA',
        itemName: 'USB-C转VGA转换器',
        currentStockLabel: '15',
        safetyStockLabel: '50',
        gapLabel: '-35',
        suggestedPurchaseQuantityLabel: '100',
        leadTimeLabel: '7 天',
      },
      {
        id: 'rep_2',
        itemCode: 'CAB-HDMI-2M',
        itemName: 'HDMI 2米线',
        currentStockLabel: '22',
        safetyStockLabel: '40',
        gapLabel: '-18',
        suggestedPurchaseQuantityLabel: '60',
        leadTimeLabel: '5 天',
      },
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedReplenishmentListItems();
    const second = getSeedReplenishmentListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.itemCode).toBe('ADP-USBC-VGA');
  });
});
