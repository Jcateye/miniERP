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
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center text-left">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">发运管理</h1>
                    <p className="text-sm text-muted mt-1">Shipments - 销售物流与发运记录</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    新增发运
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button className="px-4 py-1.5 rounded-sm bg-primary text-white text-xs font-bold shadow-sm">
                    全部 (1)
                </button>
                <button className="px-4 py-1.5 rounded-sm border border-border text-muted text-xs font-bold hover:bg-background transition-colors">
                    待发货
                </button>
                <button className="px-4 py-1.5 rounded-sm border border-border text-muted text-xs font-bold hover:bg-background transition-colors">
                    已发货
                </button>
                <button className="px-4 py-1.5 rounded-sm border border-border text-muted text-xs font-bold hover:bg-background transition-colors">
                    已取消
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">单据编号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">客户</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">数量</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">运单号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">关联单据</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-center">状态</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 text-primary font-medium italic">
                                    {item.id}
                                </td>
                                <td className="px-4 py-4 font-bold text-foreground">
                                    {item.customer}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-foreground font-mono">
                                    {item.quantity}
                                </td>
                                <td className="px-4 py-4 text-muted font-mono flex items-center gap-1.5 mt-4">
                                    <Truck className="w-3.5 h-3.5" />
                                    {item.tracking}
                                </td>
                                <td className="px-4 py-4 text-primary font-bold cursor-pointer hover:underline">
                                    {item.relDoc}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-tight">
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
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
