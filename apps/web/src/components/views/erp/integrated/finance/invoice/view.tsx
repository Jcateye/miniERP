'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

export default function InvoiceList() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">发票管理</h1>
                    <p className="text-muted mt-1 text-sm">应收应付发票 · 管理工作台</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新建发票
                    </button>
                </div>
            </div>

            <div className="w-full bg-white border border-border p-2">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="搜索发票票号、客户、供应商..."
                        className="w-full h-10 pl-10 pr-4 text-sm outline-none placeholder:text-muted bg-transparent font-['var(--font-space-grotesk)']"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center w-full mt-2">
                <div className="flex gap-2 text-sm">
                    <button className="bg-[#1a1a1a] text-white px-4 py-1.5 font-medium shadow-sm">全部</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">待核销</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">部分核销</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">已核销</button>
                </div>
                <div className="text-xs text-muted flex items-center gap-2">
                    共 234 张发票
                </div>
            </div>

            <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-2">
                <div className="grid grid-cols-[160px_100px_200px_120px_120px_120px_80px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                    <div>发票编号</div>
                    <div>类型</div>
                    <div>客户/供应商</div>
                    <div>金额</div>
                    <div>开票日期</div>
                    <div>到期日</div>
                    <div className="text-center">状态</div>
                </div>

                <div className="flex flex-col text-sm bg-white overflow-y-auto">
                    <div className="grid grid-cols-[160px_100px_200px_120px_120px_120px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
                        <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">INV-20260205-081</div>
                        <div><span className="bg-[#F2F5FF] text-[#3D63DD] px-1 py-0.5 text-xs">AR</span></div>
                        <div className="font-medium truncate pr-4">顺丰速运</div>
                        <div className="font-['var(--font-space-grotesk)'] font-medium">¥186,000.00</div>
                        <div className="font-['var(--font-space-grotesk)'] text-muted">2026-02-05</div>
                        <div className="font-['var(--font-space-grotesk)'] font-medium">2026-03-05</div>
                        <div className="text-center">
                            <span className="bg-[#FFF8F6] text-primary px-2 py-0.5 text-xs font-medium border-transparent border">
                                部分核销
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
