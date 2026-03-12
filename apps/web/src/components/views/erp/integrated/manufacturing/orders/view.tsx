'use client';

import React from 'react';
import { Plus, Calendar } from 'lucide-react';

export default function ProductionOrdersPage() {
    const data = [
        {
            id: 'MO-20260310-001',
            product: 'AJW-100 散热器',
            bom: 'BOM-V2.1',
            planned: '200',
            completed: '20',
            date: '03-10 ~ 03-15',
            status: '生产中',
        }
    ];

    return (
        <div className="flex h-full flex-col gap-6 p-8 pb-20 sm:p-10 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">生产订单</h1>
                    <p className="mt-2 text-[13px] text-muted">Production Orders - 工单管理</p>
                </div>
                <button className="bg-primary text-white h-10 px-5 flex items-center gap-2 text-sm font-bold hover:bg-opacity-90 transition-opacity shadow-sm">
                    <Plus className="w-4 h-4" />
                    新增工单
                </button>
            </div>

            {/* Table Area */}
            <div className="mt-2 flex min-w-[860px] flex-1 flex-col overflow-hidden border border-border bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="h-10 border-b border-border bg-[#FDFCFB]">
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">MO编号</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">产品</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">BOM</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">计划量</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">已完工</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">计划日期</th>
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
                                    {item.product}
                                </td>
                                <td className="px-6 py-4 text-sm text-muted">
                                    {item.bom}
                                </td>
                                <td className="px-6 py-4 text-right text-[15px] font-bold text-[#1a1a1a]">
                                    {item.planned}
                                </td>
                                <td className="px-6 py-4 text-right text-[15px] font-bold text-[#22C55E]">
                                    {item.completed}
                                </td>
                                <td className="px-6 py-4 text-sm text-muted flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {item.date}
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
