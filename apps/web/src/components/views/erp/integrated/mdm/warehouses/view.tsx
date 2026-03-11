'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

export default function WarehouseList() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">仓库管理</h1>
                    <p className="text-muted mt-1 text-sm">仓库 · 库区货架主数据</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新建仓库
                    </button>
                </div>
            </div>

            <div className="w-full bg-white border border-border p-2">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="搜索仓库编号、名称..."
                        className="w-full h-10 pl-10 pr-4 text-sm outline-none placeholder:text-muted bg-transparent font-['var(--font-space-grotesk)']"
                    />
                </div>
            </div>

            <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-2">
                <div className="grid grid-cols-[160px_160px_100px_1fr_120px_100px_80px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                    <div>仓库编号</div>
                    <div>仓库名称</div>
                    <div>类型</div>
                    <div>地址</div>
                    <div>联系人</div>
                    <div>库位数量</div>
                    <div className="text-center">状态</div>
                </div>

                <div className="flex flex-col text-sm bg-white overflow-y-auto">
                    <div className="grid grid-cols-[160px_160px_100px_1fr_120px_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
                        <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">WH-001</div>
                        <div className="font-medium truncate pr-4">深圳总仓</div>
                        <div className="font-medium text-muted">实体仓</div>
                        <div className="truncate pr-4 text-muted">深圳市南山区科技园南区</div>
                        <div className="font-medium text-muted">王主管</div>
                        <div className="font-['var(--font-space-grotesk)'] text-[#549363] font-medium text-center">36</div>
                        <div className="text-center">
                            <span className="bg-[#EAF3EB] text-[#549363] px-2 py-0.5 text-xs font-medium border-transparent border">
                                启用
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-[160px_160px_100px_1fr_120px_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
                        <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">WH-002</div>
                        <div className="font-medium truncate pr-4">东莞备料仓</div>
                        <div className="font-medium text-muted">实体仓</div>
                        <div className="truncate pr-4 text-muted">东莞松山湖高新产业网</div>
                        <div className="font-medium text-muted">李主管</div>
                        <div className="font-['var(--font-space-grotesk)'] text-muted text-center">--</div>
                        <div className="text-center">
                            <span className="text-muted px-2 py-0.5 text-xs font-medium border-transparent border">
                                --
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
