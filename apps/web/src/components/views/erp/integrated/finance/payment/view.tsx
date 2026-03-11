'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export default function PaymentsPage() {
    const data = [
        {
            id: 'PAY-20260310-001',
            supplier: '华为技术',
            date: '2026-03-10',
            amount: '¥ 12,000',
            method: '电汇',
            verified: '¥ 12,000',
            status: '待审核',
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">付款管理</h1>
                    <p className="text-sm text-muted mt-1">Payments - 供应商结账</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    新增付款
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">付款编号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">供应商</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">日期</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">金额</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">方式</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right font-bold text-green-600">已校验</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 text-primary font-medium italic">
                                    {item.id}
                                </td>
                                <td className="px-4 py-4 font-bold text-foreground">
                                    {item.supplier}
                                </td>
                                <td className="px-4 py-4 text-muted font-mono whitespace-nowrap">
                                    {item.date}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-foreground font-mono">
                                    {item.amount}
                                </td>
                                <td className="px-4 py-4 text-foreground">
                                    {item.method}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-green-600 font-mono text-center">
                                    {item.verified}
                                </td>
                                <td className="px-4 py-4">
                                    <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-tight">
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
