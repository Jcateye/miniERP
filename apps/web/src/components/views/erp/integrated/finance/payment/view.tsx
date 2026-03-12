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
        <div className="flex h-full flex-col gap-6 p-8 pb-20 sm:p-10 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">付款管理</h1>
                    <p className="mt-2 text-[13px] text-muted">Payments - 供应商结账</p>
                </div>
                <button className="bg-primary text-white h-10 px-5 flex items-center gap-2 text-sm font-bold hover:bg-opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" />
                    新增付款
                </button>
            </div>

            {/* Table Area */}
            <div className="mt-2 flex min-w-[860px] flex-1 flex-col overflow-hidden border border-border bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="h-10 border-b border-border bg-[#FDFCFB]">
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">付款编号</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">供应商</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">日期</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">金额</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">方式</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right font-bold text-[#22C55E]">已校验</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="border-b border-border hover:bg-background/50 transition-colors group">
                                <td className="px-6 py-4 text-sm font-medium italic text-[#C05A3C]">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4 text-[15px] font-bold text-[#1a1a1a]">
                                    {item.supplier}
                                </td>
                                <td className="px-6 py-4 text-sm text-muted font-mono whitespace-nowrap">
                                    {item.date}
                                </td>
                                <td className="px-6 py-4 text-right text-[15px] font-bold text-[#1a1a1a] font-mono">
                                    {item.amount}
                                </td>
                                <td className="px-6 py-4 text-sm text-[#1a1a1a]">
                                    {item.method}
                                </td>
                                <td className="px-6 py-4 text-right text-[15px] font-bold text-[#22C55E] font-mono">
                                    {item.verified}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 rounded-full bg-[#FFF8F6] text-[#C05A3C] text-[10px] font-bold uppercase tracking-tight">
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
