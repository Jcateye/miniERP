'use client';

import React from 'react';
import { Plus, User } from 'lucide-react';

export default function CustomersPage() {
    const data = [
        {
            id: 'C-001',
            name: '华为技术有限公司',
            contact: '王经理',
            phone: '138-0000-0000',
            credit: '¥ 500,000',
            status: '启用',
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">客户管理</h1>
                    <p className="text-sm text-muted mt-1">Customers - 客户关系维护</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    新增客户
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">编号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">客户名称</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">联系人</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">电话</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">信用额度</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 text-primary font-mono font-bold italic">
                                    {item.id}
                                </td>
                                <td className="px-4 py-4 font-bold text-foreground">
                                    {item.name}
                                </td>
                                <td className="px-4 py-4 text-foreground flex items-center gap-1.5 mt-4">
                                    <User className="w-3.5 h-3.5 text-muted" />
                                    {item.contact}
                                </td>
                                <td className="px-4 py-4 text-muted font-mono">
                                    {item.phone}
                                </td>
                                <td className="px-4 py-4 text-right font-bold font-mono text-foreground">
                                    {item.credit}
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
