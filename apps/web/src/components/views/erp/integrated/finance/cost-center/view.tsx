'use client';

import React from 'react';
import { Plus, User } from 'lucide-react';

export default function CostCenterPage() {
    const data = [
        {
            id: 'CC-PROD-01',
            name: '生产制造中心',
            operator: '王生产',
            status: '启用',
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">成本中心</h1>
                    <p className="text-sm text-muted mt-1">Cost Centers - 成本归集</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    新增成本中心
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">编码</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">名称</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">负责人</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 text-primary font-mono font-bold tracking-wider italic">
                                    {item.id}
                                </td>
                                <td className="px-4 py-4 font-bold text-foreground">
                                    {item.name}
                                </td>
                                <td className="px-4 py-4 text-foreground flex items-center gap-1.5 mt-4">
                                    <User className="w-3.5 h-3.5" />
                                    {item.operator}
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
