'use client';

import React from 'react';
import { Plus, Calendar } from 'lucide-react';

export default function BudgetManagementPage() {
    const data = [
        {
            id: 'BDG-2026-Q1',
            name: '研发部预算',
            period: '2026-Q1',
            amount: '¥ 500,000',
            used: '¥ 23,200',
            remaining: '¥ 476,800',
            status: '执行中',
        }
    ];

    return (
        <div className="flex h-full flex-col gap-6 p-8 pb-20 sm:p-10 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">预算管理</h1>
                    <p className="mt-2 text-[13px] text-muted">Budgets - 周期与费用控制</p>
                </div>
                <button className="bg-primary text-white h-10 px-5 flex items-center gap-2 text-sm font-bold hover:bg-opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" />
                    新增预算
                </button>
            </div>

            {/* Table Area */}
            <div className="mt-2 flex min-w-[860px] flex-1 flex-col overflow-hidden border border-border bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="h-10 border-b border-border bg-[#FDFCFB]">
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">编号</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">部门/项目</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">周期</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">预算金额</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right text-[#C05A3C]">已使用</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right text-[#22C55E]">剩余</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="border-b border-border hover:bg-background/50 transition-colors group">
                                <td className="px-6 py-4 text-[15px] font-bold text-[#C05A3C] font-mono tracking-wider italic">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4 text-[15px] font-bold text-[#1a1a1a] whitespace-nowrap">
                                    {item.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-muted flex items-center gap-1.5 mt-4">
                                    <Calendar className="w-3.5 h-3.5 text-muted" />
                                    {item.period}
                                </td>
                                <td className="px-6 py-4 text-right text-[15px] font-bold text-[#1a1a1a] font-mono whitespace-nowrap">
                                    {item.amount}
                                </td>
                                <td className="px-6 py-4 text-right text-[15px] font-bold text-[#C05A3C] font-mono whitespace-nowrap">
                                    {item.used}
                                </td>
                                <td className="px-6 py-4 text-right text-[15px] font-bold text-[#22C55E] font-mono whitespace-nowrap">
                                    {item.remaining}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="px-2 py-0.5 rounded-full bg-[#F6FAFF] text-[#2D5BFF] text-[10px] font-bold uppercase tracking-tight">
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
