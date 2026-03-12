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
        <div className="flex h-full flex-col gap-6 p-8 pb-20 sm:p-10 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">质检记录</h1>
                    <p className="mt-2 text-[13px] text-muted">QC Records - 质量检测与分析</p>
                </div>
            </div>

            {/* Table Area */}
            <div className="mt-2 flex min-w-[860px] flex-1 flex-col overflow-hidden border border-border bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="h-10 border-b border-border bg-[#FDFCFB]">
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">QC编号</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">描述</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">物料</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">批次号</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-center">结果</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">检验人</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">时间</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="border-b border-border hover:bg-background/50 transition-colors group">
                                <td className="px-6 py-4 text-sm font-medium italic text-[#C05A3C]">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4 bg-orange-50/20">
                                    <span className="px-2 py-0.5 rounded-sm bg-orange-100 text-orange-600 font-bold text-[10px] uppercase">
                                        {item.description}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[15px] font-bold text-[#1a1a1a]">
                                    {item.sku}
                                </td>
                                <td className="px-6 py-4 text-sm text-muted font-mono">
                                    {item.batch}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className={`flex items-center justify-center gap-1.5 font-bold text-sm ${item.result === '不合格' ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                                        {item.result === '不合格' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        {item.result}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-[13px] text-[#1a1a1a] flex items-center gap-1.5 mt-4">
                                    <User className="w-3.5 h-3.5 text-muted" />
                                    {item.operator}
                                </td>
                                <td className="px-6 py-4 text-right text-sm text-muted font-mono">
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
