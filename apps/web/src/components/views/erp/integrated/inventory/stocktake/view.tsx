'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

export default function StocktakeList() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto relative w-full">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">盘点管理</h1>
                    <p className="text-muted mt-1 text-sm">盘点单 · 管理工作台</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新建盘点
                    </button>
                </div>
            </div>

            <div className="w-full bg-white border border-border p-2">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="搜索盘点单号、仓库..."
                        className="w-full h-10 pl-10 pr-4 text-sm outline-none placeholder:text-muted bg-transparent font-['var(--font-space-grotesk)']"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center w-full mt-2">
                <div className="flex gap-2 text-sm">
                    <button className="bg-[#1a1a1a] text-white px-4 py-1.5 font-medium shadow-sm">全部</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">进行中</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">已结算</button>
                </div>
                <div className="text-xs text-muted flex items-center gap-2">
                    共 32 份盘点单
                </div>
            </div>

            <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-2">
                <div className="grid grid-cols-[160px_160px_120px_100px_100px_100px_80px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                    <div>盘点编号</div>
                    <div>仓库</div>
                    <div>日期</div>
                    <div className="text-center">盘盈(项)</div>
                    <div className="text-center">盘亏(项)</div>
                    <div>负责人</div>
                    <div className="text-center">状态</div>
                </div>

                <div className="flex flex-col text-sm bg-white overflow-y-auto">
                    <div className="grid grid-cols-[160px_160px_120px_100px_100px_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
                        <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">ST-20260205-001</div>
                        <div className="font-medium truncate pr-4">深圳南山仓</div>
                        <div className="font-['var(--font-space-grotesk)'] text-muted">2026-02-05</div>
                        <div className="font-['var(--font-space-grotesk)'] text-center text-muted">+5</div>
                        <div className="font-['var(--font-space-grotesk)'] text-primary text-center font-bold">-12</div>
                        <div className="font-medium text-muted">张三</div>
                        <div className="text-center">
                            <span className="bg-[#FFF8F6] text-primary px-2 py-0.5 text-xs font-medium border-transparent border">
                                已结账
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
