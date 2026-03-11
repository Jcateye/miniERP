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
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center text-left">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">审批任务</h1>
                    <p className="text-sm text-muted mt-1">Approvals - 待办工作流 / 已核准记录 / 发起查询</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button className="px-4 py-1.5 rounded-sm bg-primary text-white text-xs font-bold shadow-sm">
                    待我审批 (12)
                </button>
                <button className="px-4 py-1.5 rounded-sm border border-border text-muted text-xs font-bold hover:bg-background transition-colors">
                    我已审批
                </button>
                <button className="px-4 py-1.5 rounded-sm border border-border text-muted text-xs font-bold hover:bg-background transition-colors">
                    我发起的
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">单据编号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">类型</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">申请人</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">摘要</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">金额</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.id} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 text-primary font-medium italic">
                                    {item.id}
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-0.5 rounded-sm font-bold text-[10px] uppercase ${item.type === '采购单' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-4 py-4 font-bold text-foreground">
                                    {item.applicant}
                                </td>
                                <td className="px-4 py-4 text-muted max-w-[300px] truncate">
                                    {item.summary}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-foreground font-mono">
                                    {item.amount}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="bg-green-600 text-white px-3 py-1 rounded-sm text-[10px] font-bold hover:opacity-90 transition-opacity">
                                            通过
                                        </button>
                                        <button className="bg-red-500 text-white px-3 py-1 rounded-sm text-[10px] font-bold hover:opacity-90 transition-opacity">
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
