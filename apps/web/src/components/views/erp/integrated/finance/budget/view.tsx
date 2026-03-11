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
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">预算管理</h1>
                    <p className="text-sm text-muted mt-1">Budgets - 周期与费用控制</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm">
                    <Plus className="w-4 h-4" />
                    新增预算
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">编号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">部门/项目</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">周期</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">预算金额</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right text-orange-600">已使用</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right text-green-600">剩余</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 text-primary font-mono font-bold tracking-wider italic">
                                    {item.id}
                                </td>
                                <td className="px-4 py-4 font-bold text-foreground whitespace-nowrap">
                                    {item.name}
                                </td>
                                <td className="px-4 py-4 text-muted flex items-center gap-1.5 mt-4">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {item.period}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-foreground font-mono whitespace-nowrap">
                                    {item.amount}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-orange-600 font-mono whitespace-nowrap">
                                    {item.used}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-green-600 font-mono whitespace-nowrap">
                                    {item.remaining}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-tight">
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
