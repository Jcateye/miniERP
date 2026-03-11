'use client';

import React from 'react';
import { CheckCircle2, XCircle, User } from 'lucide-react';

export default function QCRecordsPage() {
    const data = [
        {
            id: 'QC-20260310-001',
            description: '例行巡检',
            sku: 'SKU-AJW-100',
            batch: '20260310-01',
            result: '不合格',
            operator: '李华',
            time: '03-10 16:35',
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">质检记录</h1>
                    <p className="text-sm text-muted mt-1">QC Records - 质量检测与分析</p>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">QC编号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">描述</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">物料</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">批次号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-center">结果</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">检验人</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">时间</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 text-primary font-medium italic">
                                    {item.id}
                                </td>
                                <td className="px-4 py-4 bg-orange-50/20">
                                    <span className="px-2 py-0.5 rounded-sm bg-orange-100 text-orange-600 font-bold text-[10px] uppercase">
                                        {item.description}
                                    </span>
                                </td>
                                <td className="px-4 py-4 font-bold text-foreground">
                                    {item.sku}
                                </td>
                                <td className="px-4 py-4 text-muted font-mono">
                                    {item.batch}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <div className={`flex items-center justify-center gap-1.5 font-bold ${item.result === '不合格' ? 'text-red-500' : 'text-green-600'}`}>
                                        {item.result === '不合格' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        {item.result}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-foreground flex items-center gap-1.5 mt-4">
                                    <User className="w-3.5 h-3.5" />
                                    {item.operator}
                                </td>
                                <td className="px-4 py-4 text-right text-muted font-mono">
                                    {item.time}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
