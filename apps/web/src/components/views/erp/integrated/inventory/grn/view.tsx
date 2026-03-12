'use client';

import React from 'react';
import { Search, Plus } from 'lucide-react';

export default function GRNListPage() {
    const data = [
        {
            id: 'GRN-20260310-001',
            poId: 'PO-001',
            supplier: '华为技术',
            warehouse: '深圳总仓',
            quantity: '100',
            time: '03-10 14:25',
            status: '已收货',
        }
    ];

    return (
        <div className="flex h-full flex-col gap-6 p-8 pb-20 sm:p-10 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">收货单管理</h1>
                    <p className="mt-2 text-[13px] text-muted">GRN Receipts - 进货入库</p>
                </div>
                <button className="bg-primary text-white h-10 px-5 flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" />
                    新增收货
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="搜索收货单号、PO单号、供应商..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="mt-2 flex min-w-[860px] flex-1 flex-col overflow-hidden border border-border bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="h-10 border-b border-border bg-[#FDFCFB]">
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">GRN编号</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">关联PO</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">供应商</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">仓库</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">数量</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">收货时间</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="border-b border-border hover:bg-background/50 transition-colors group">
                                <td className="px-6 py-4 text-sm font-medium text-primary cursor-pointer hover:underline">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4 text-sm text-foreground">
                                    {item.poId}
                                </td>
                                <td className="px-6 py-4 text-sm text-foreground">
                                    {item.supplier}
                                </td>
                                <td className="px-6 py-4 text-sm text-foreground">
                                    {item.warehouse}
                                </td>
                                <td className="px-6 py-4 text-sm text-foreground text-right font-mono">
                                    {item.quantity}
                                </td>
                                <td className="px-6 py-4 text-sm text-muted text-right">
                                    {item.time}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-tight">
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
