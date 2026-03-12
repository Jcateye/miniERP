'use client';

import React from 'react';
import { Truck, Plus } from 'lucide-react';

export default function ShipmentManagementPage() {
    const data = [
        {
            id: 'SHIP-20260310-001',
            customer: '佳鼎电子',
            tracking: 'SF1234567890',
            quantity: '10',
            relDoc: 'SO-1004',
            status: '运输中',
        }
    ];

    return (
        <div className="flex h-full flex-col gap-6 p-8 pb-20 sm:p-10 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start text-left">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">发运管理</h1>
                    <p className="mt-2 text-[13px] text-muted">Shipments - 销售物流与发运记录</p>
                </div>
                <button className="bg-primary text-white h-10 px-5 flex items-center gap-2 text-sm font-bold hover:bg-opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" />
                    新增发运
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button className="h-9 px-4 bg-[#C05A3C] text-white text-xs font-bold shadow-sm">
                    全部 (1)
                </button>
                <button className="h-9 px-4 border border-border bg-white text-muted text-xs font-bold hover:bg-background transition-colors">
                    待发货
                </button>
                <button className="h-9 px-4 border border-border bg-white text-muted text-xs font-bold hover:bg-background transition-colors">
                    已发货
                </button>
                <button className="h-9 px-4 border border-border bg-white text-muted text-xs font-bold hover:bg-background transition-colors">
                    已取消
                </button>
            </div>

            {/* Table Area */}
            <div className="mt-2 flex min-w-[860px] flex-1 flex-col overflow-hidden border border-border bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="h-10 border-b border-border bg-[#FDFCFB]">
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">单据编号</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">客户</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">数量</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">运单号</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">关联单据</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-center">状态</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="border-b border-border hover:bg-background/50 transition-colors group">
                                <td className="px-6 py-4 text-sm font-medium italic text-[#C05A3C]">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4 text-[15px] font-bold text-[#1a1a1a]">
                                    {item.customer}
                                </td>
                                <td className="px-6 py-4 text-right text-[15px] font-bold text-[#1a1a1a] font-mono">
                                    {item.quantity}
                                </td>
                                <td className="px-6 py-4 text-sm text-muted font-mono flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5" />
                                    {item.tracking}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-[#C05A3C] cursor-pointer hover:underline">
                                    {item.relDoc}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-0.5 rounded-full bg-[#EBF5FF] text-[#2D5BFF] text-[10px] font-bold uppercase tracking-tight">
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-muted italic text-[10px]">--</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
