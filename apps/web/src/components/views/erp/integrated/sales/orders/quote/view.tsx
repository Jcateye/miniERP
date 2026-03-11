'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

export default function QuoteList() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto relative w-full">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">报价管理</h1>
                    <p className="text-muted mt-1 text-sm">跟进中 · 报价工作台</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新建报价
                    </button>
                </div>
            </div>

            <div className="w-full bg-white border border-border p-2">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="搜索报价编号、客户..."
                        className="w-full h-10 pl-10 pr-4 text-sm outline-none placeholder:text-muted bg-transparent font-['var(--font-space-grotesk)']"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center w-full mt-2">
                <div className="flex gap-2 text-sm">
                    <button className="bg-[#1a1a1a] text-white px-4 py-1.5 font-medium shadow-sm">全部</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">草稿</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">已发送</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">已失效</button>
                </div>
                <div className="text-xs text-muted flex items-center gap-2">
                    共 35 个报价单
                </div>
            </div>

            <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-2">
                <div className="grid grid-cols-[140px_200px_120px_120px_100px_80px_1fr] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                    <div>报价编号</div>
                    <div>客户</div>
                    <div>发出日期</div>
                    <div>有效期至</div>
                    <div>金额</div>
                    <div className="text-center">状态</div>
                    <div></div>
                </div>

                <div className="flex flex-col text-sm bg-white overflow-y-auto">
                    <div className="grid grid-cols-[140px_200px_120px_120px_100px_80px_1fr] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
                        <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">Q-20260215-099</div>
                        <div className="font-medium truncate pr-4">大海控股</div>
                        <div className="font-['var(--font-space-grotesk)'] text-muted">2026-02-15</div>
                        <div className="font-['var(--font-space-grotesk)'] text-primary font-medium">2026-02-18</div>
                        <div className="font-['var(--font-space-grotesk)'] font-medium">¥160,500</div>
                        <div className="text-center">
                            <span className="bg-[#FFF8F6] text-primary px-2 py-0.5 text-xs font-medium border-transparent border">
                                待确认
                            </span>
                        </div>
                        <div className="text-right text-muted tracking-widest cursor-pointer hover:text-foreground text-lg leading-none">...</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
