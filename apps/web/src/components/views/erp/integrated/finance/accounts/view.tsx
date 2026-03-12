'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export default function ChartOfAccountsPage() {
    const data = [
        {
            id: '1001',
            name: '库存现金',
            type: '资产',
            currency: 'CNY',
            parent: '--',
            status: '启用',
        }
    ];

    return (
        <div className="flex h-full flex-col gap-6 p-8 pb-20 sm:p-10 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">科目表</h1>
                    <p className="mt-2 text-[13px] text-muted">Chart of Accounts - 会计科目</p>
                </div>
                <button className="bg-primary text-white h-10 px-5 flex items-center gap-2 text-sm font-bold hover:bg-opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" />
                    新增科目
                </button>
            </div>

            {/* Table Area */}
            <div className="mt-2 flex min-w-[860px] flex-1 flex-col overflow-hidden border border-border bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="h-10 border-b border-border bg-[#FDFCFB]">
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">科目编号</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">科目名称</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">类型</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-center">币种</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">上级科目</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="border-b border-border hover:bg-background/50 transition-colors group">
                                <td className="px-6 py-4 text-[15px] font-bold text-[#C05A3C] font-mono tracking-wider italic">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4 text-[15px] font-bold text-[#1a1a1a]">
                                    {item.name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 rounded-sm bg-[#EBF5FF] text-[#2D5BFF] font-bold text-[10px] uppercase">
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-muted text-sm">
                                    {item.currency}
                                </td>
                                <td className="px-6 py-4 text-right text-muted italic text-sm">
                                    {item.parent}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="px-2 py-0.5 rounded-full bg-[#F6FFF8] text-[#22C55E] text-[10px] font-bold uppercase tracking-tight">
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
