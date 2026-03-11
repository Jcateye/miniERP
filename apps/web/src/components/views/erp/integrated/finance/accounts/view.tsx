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
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">科目表</h1>
                    <p className="text-sm text-muted mt-1">Chart of Accounts - 会计科目</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    新增科目
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">科目编号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">科目名称</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">类型</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-center">币种</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">上级科目</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 text-primary font-mono font-bold tracking-wider">
                                    {item.id}
                                </td>
                                <td className="px-4 py-4 font-bold text-foreground">
                                    {item.name}
                                </td>
                                <td className="px-4 py-4">
                                    <span className="px-2 py-0.5 rounded-sm bg-blue-50 text-blue-600 font-bold text-[10px] uppercase">
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center font-bold text-muted">
                                    {item.currency}
                                </td>
                                <td className="px-4 py-4 text-right text-muted italic">
                                    {item.parent}
                                </td>
                                <td className="px-4 py-4 text-right">
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
