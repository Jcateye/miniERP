'use client';

import React from 'react';
import { Search, Download } from 'lucide-react';

export default function InventoryLedgerPage() {
    const data = [
        {
            date: '2026-03-10 14:30',
            skuId: 'SKU-HDMI-2M',
            warehouse: '深圳总仓',
            type: '入库',
            direction: '+100',
            balance: '500',
            source: 'GRN-001',
            operator: '张三',
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">库存流水</h1>
                    <p className="text-sm text-muted mt-1">Inventory Ledger - 全量流水审计</p>
                </div>
                <button className="bg-white border border-border text-foreground px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:bg-background transition-colors shadow-sm">
                    <Download className="w-4 h-4" />
                    导出
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="搜索SKU、仓库、单据号..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">日期</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">物料编号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">仓库</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">业务类型</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">方向</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">余额</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">来源单据</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">操作人</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item, index) => (
                            <tr key={index} className="hover:bg-background/50 transition-colors group text-sm">
                                <td className="px-4 py-4 text-muted font-mono whitespace-nowrap">
                                    {item.date}
                                </td>
                                <td className="px-4 py-4 font-bold text-primary italic">
                                    {item.skuId}
                                </td>
                                <td className="px-4 py-4 text-foreground">
                                    {item.warehouse}
                                </td>
                                <td className="px-4 py-4 font-bold">
                                    {item.type}
                                </td>
                                <td className={`px-4 py-4 text-right font-bold ${item.direction.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.direction}
                                </td>
                                <td className="px-4 py-4 text-right font-mono font-bold">
                                    {item.balance}
                                </td>
                                <td className="px-4 py-4 text-primary cursor-pointer hover:underline">
                                    {item.source}
                                </td>
                                <td className="px-4 py-4 text-foreground">
                                    {item.operator}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
