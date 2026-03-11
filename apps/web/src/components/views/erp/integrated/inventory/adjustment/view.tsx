'use client';

import React from 'react';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';

export default function InventoryAdjustmentPage() {
    const data = [
        {
            id: 'ADJ-20260310-001',
            warehouse: '深圳总仓',
            date: '2026-03-10',
            quantity: '5',
            trend: '-5',
            reason: '物料质量问题损耗',
            status: '已审核',
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">库存调整</h1>
                    <p className="text-sm text-muted mt-1">Adjustments - 损耗与异常</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm">
                    <Plus className="w-4 h-4" />
                    新增调整
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">调整单号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">仓库</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">日期</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">数量</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">调整趋势</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">原因</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 text-sm font-medium text-primary cursor-pointer hover:underline italic">
                                    {item.id}
                                </td>
                                <td className="px-4 py-4 text-sm font-bold text-foreground">
                                    {item.warehouse}
                                </td>
                                <td className="px-4 py-4 text-sm font-mono text-muted">
                                    {item.date}
                                </td>
                                <td className="px-4 py-4 text-sm text-right font-bold">
                                    {item.quantity}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className={`flex items-center justify-end gap-1.5 font-bold ${item.trend.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                                        {item.trend.startsWith('-') ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                        {item.trend}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-foreground">
                                    {item.reason}
                                </td>
                                <td className="px-4 py-4">
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
