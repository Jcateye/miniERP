'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

export default function SoList() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto relative w-full">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">销售订单管理</h1>
                    <p className="text-muted mt-1 text-sm">销售订单、发运工作台</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
                        导出
                    </button>
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新建销售订单
                    </button>
                </div>
            </div>

            <div className="w-full bg-white border border-border p-2">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="搜索 SO 编号、客户、物料..."
                        className="w-full h-10 pl-10 pr-4 text-sm outline-none placeholder:text-muted bg-transparent font-['var(--font-space-grotesk)']"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center w-full mt-2">
                <div className="flex gap-2 text-sm">
                    <button className="bg-[#1a1a1a] text-white px-4 py-1.5 font-medium shadow-sm">全部</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">待发货</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">已发货</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">草稿箱</button>
                </div>
                <div className="text-xs text-muted flex items-center gap-2">
                    共 852 个 SO · 显示 1-20
                </div>
            </div>

            <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-2">
                <div className="grid grid-cols-[140px_200px_100px_120px_80px_100px_80px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                    <div>SO 编号</div>
                    <div>客户</div>
                    <div>下单日期</div>
                    <div>金额</div>
                    <div className="text-center">项数</div>
                    <div className="text-center">状态</div>
                    <div className="text-center">操作</div>
                </div>

                <div className="flex flex-col text-sm bg-white overflow-y-auto">
                    <TableRow
                        so="SO-20260216-088"
                        customer="海外极客电子"
                        date="2026-02-16"
                        amount="¥26,500.00"
                        skuCount="62件"
                        status="待发货"
                        statusType="warning"
                    />
                    <TableRow
                        so="SO-20260215-021"
                        customer="武汉星光网咖"
                        date="2026-02-15"
                        amount="¥7,020.00"
                        skuCount="25件"
                        status="已出库"
                        statusType="success"
                    />
                </div>
            </div>
        </div>
    );
}

function TableRow({ so, customer, date, amount, skuCount, status, statusType }: { so: string, customer: string, date: string, amount: string, skuCount: string, status: string, statusType: 'default' | 'success' | 'warning' | 'error' }) {
    const getStatusColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-[#EAF3EB] text-[#549363] border-transparent';
            case 'warning': return 'bg-[#FFF8F6] text-primary border-transparent';
            default: return 'bg-[#F2F5FF] text-[#3D63DD] border-transparent';
        }
    };

    return (
        <div className="grid grid-cols-[140px_200px_100px_120px_80px_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
            <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">{so}</div>
            <div className="font-medium truncate pr-4">{customer}</div>
            <div className="font-['var(--font-space-grotesk)'] text-muted">{date}</div>
            <div className="font-['var(--font-space-grotesk)'] font-medium">{amount}</div>
            <div className="text-center font-['var(--font-space-grotesk)']">{skuCount}</div>
            <div className="text-center">
                <span className={`px-2 py-0.5 text-xs font-medium border ${getStatusColor(statusType)}`}>
                    {status}
                </span>
            </div>
            <div className="text-center text-muted tracking-widest cursor-pointer hover:text-foreground text-lg leading-none">...</div>
        </div>
    );
}
