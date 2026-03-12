'use client';

import React from 'react';

export default function ApprovalTasksPage() {
    const data = [
        {
            id: 'PO-20260310-001',
            type: '采购单',
            applicant: '张三',
            summary: '采购散热器 - 散热片模块供应 1000 套',
            amount: '¥ 12,000',
        },
        {
            id: 'PAY-20260310-012',
            type: '付款单',
            applicant: '李四',
            summary: '申领包材辅料 - 用于仓库支拨',
            amount: '¥ 18,900',
        }
    ];

    return (
        <div className="flex h-full flex-col gap-6 p-8 pb-20 sm:p-10 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start text-left">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">审批任务</h1>
                    <p className="mt-2 text-[13px] text-muted">Approvals - 待办工作流 / 已核准记录 / 发起查询</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button className="h-9 px-4 bg-[#C05A3C] text-white text-xs font-bold shadow-sm">
                    待我审批 (12)
                </button>
                <button className="h-9 px-4 border border-border bg-white text-muted text-xs font-bold hover:bg-background transition-colors">
                    我已审批
                </button>
                <button className="h-9 px-4 border border-border bg-white text-muted text-xs font-bold hover:bg-background transition-colors">
                    我发起的
                </button>
            </div>

            {/* Table Area */}
            <div className="mt-2 flex min-w-[860px] flex-1 flex-col overflow-hidden border border-border bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="h-10 border-b border-border bg-[#FDFCFB]">
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">单据编号</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">类型</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">申请人</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">摘要</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">金额</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="border-b border-border hover:bg-background/50 transition-colors group">
                                <td className="px-6 py-4 text-sm font-medium italic text-[#C05A3C]">
                                    {item.id}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-sm font-bold text-[10px] uppercase ${item.type === '采购单' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[15px] font-bold text-[#1a1a1a]">
                                    {item.applicant}
                                </td>
                                <td className="px-6 py-4 text-muted text-sm max-w-[300px] truncate">
                                    {item.summary}
                                </td>
                                <td className="px-6 py-4 text-right text-[15px] font-bold text-[#1a1a1a] font-mono">
                                    {item.amount}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="bg-[#22C55E] text-white h-7 px-4 rounded-sm text-[11px] font-bold hover:bg-opacity-90 transition-opacity">
                                            通过
                                        </button>
                                        <button className="bg-[#EF4444] text-white h-7 px-4 rounded-sm text-[11px] font-bold hover:bg-opacity-90 transition-opacity">
                                            拒绝
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
