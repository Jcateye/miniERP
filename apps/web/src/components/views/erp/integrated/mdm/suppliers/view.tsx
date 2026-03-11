'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export default function SuppliersPage() {
    const data = [
        {
            id: 'V-001',
            name: '华为技术有限公司',
            contact: 'A经理',
            cert: 'ISO9001/ISO14001',
            orders: '25',
            status: '启用',
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">供应商管理</h1>
                    <p className="text-sm text-muted mt-1">Suppliers - 供应链协作</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    新增供应商
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">编号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">供应商名称</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">联系人</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">联系资质</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">合作订单</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 text-primary font-mono font-bold italic tracking-wider">
                                    {item.id}
                                </td>
                                <td className="px-4 py-4 font-bold text-foreground">
                                    {item.name}
                                </td>
                                <td className="px-4 py-4 text-foreground flex items-center gap-1.5 mt-4">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                        {item.contact[0]}
                                    </span>
                                    {item.contact}
                                </td>
                                <td className="px-4 py-4 text-muted text-xs">
                                    {item.cert}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-foreground font-mono">
                                    {item.orders}
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
