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
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">生产订单</h1>
                    <p className="text-sm text-muted mt-1">Production Orders - 工单管理</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    新增工单
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">MO编号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">产品</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">BOM</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">计划量</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">已完工</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">计划日期</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors group text-sm">
                                <td className="px-4 py-4 font-medium text-primary cursor-pointer hover:underline italic">
                                    {item.id}
                                </td>
                                <td className="px-4 py-4 font-bold text-foreground">
                                    {item.product}
                                </td>
                                <td className="px-4 py-4 text-muted">
                                    {item.bom}
                                </td>
                                <td className="px-4 py-4 text-right font-bold">
                                    {item.planned}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-green-600">
                                    {item.completed}
                                </td>
                                <td className="px-4 py-4 text-muted flex items-center gap-1.5 mt-4">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {item.date}
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
