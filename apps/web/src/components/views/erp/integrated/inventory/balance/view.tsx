'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

export default function InvBalList() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">库存余额</h1>
                    <p className="text-muted mt-1 text-sm">SKU现存量数据查询 · 单库层级盘点</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
                        导出
                    </button>
                </div>
            </div>

            <div className="w-full bg-white border border-border p-2">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="搜索物料编码、型号、仓库..."
                        className="w-full h-10 pl-10 pr-4 text-sm outline-none placeholder:text-muted bg-transparent font-['var(--font-space-grotesk)']"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center w-full mt-2">
                <div className="flex gap-2 text-sm">
                    <button className="bg-[#1a1a1a] text-white px-4 py-1.5 font-medium shadow-sm">全部仓库</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">低于安全库存</button>
                    <button className="bg-white border border-border text-foreground px-4 py-1.5 hover:bg-gray-50 shadow-sm transition-colors">推荐盘点</button>
                </div>
                <div className="text-xs text-muted flex items-center gap-2">
                    共 1,247 条 · 显示 1-20
                </div>
            </div>

            <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-2">
                <div className="grid grid-cols-[160px_200px_100px_100px_100px_100px_100px_80px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                    <div>物料编码</div>
                    <div>物料名称</div>
                    <div>仓库</div>
                    <div className="text-right">当前余额</div>
                    <div className="text-right">可用数量</div>
                    <div className="text-right">预留数量</div>
                    <div className="text-right">安全库存</div>
                    <div className="text-center">状态</div>
                </div>

                <div className="flex flex-col text-sm bg-white overflow-y-auto">
                    <div className="grid grid-cols-[160px_200px_100px_100px_100px_100px_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
                        <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">RAW-488B-2M</div>
                        <div className="font-medium truncate pr-4">ROHM 电源稳压管</div>
                        <div className="font-['var(--font-space-grotesk)']">深圳 A 仓</div>
                        <div className="font-['var(--font-space-grotesk)'] font-bold text-right">320</div>
                        <div className="font-['var(--font-space-grotesk)'] text-right">280</div>
                        <div className="font-['var(--font-space-grotesk)'] text-right">40</div>
                        <div className="font-['var(--font-space-grotesk)'] text-right text-muted">50</div>
                        <div className="text-center">
                            <span className="bg-[#EAF3EB] text-[#549363] px-2 py-0.5 text-xs font-medium border-transparent border">
                                正常
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-[160px_200px_100px_100px_100px_100px_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
                        <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">ADR-LED50-V9A</div>
                        <div className="font-medium truncate pr-4">LED大灯灯珠模组</div>
                        <div className="font-['var(--font-space-grotesk)']">青岛 B 仓</div>
                        <div className="font-['var(--font-space-grotesk)'] font-bold text-primary text-right">10</div>
                        <div className="font-['var(--font-space-grotesk)'] text-right">10</div>
                        <div className="font-['var(--font-space-grotesk)'] text-right">0</div>
                        <div className="font-['var(--font-space-grotesk)'] text-right text-muted">50</div>
                        <div className="text-center">
                            <span className="bg-[#FFF8F6] text-primary px-2 py-0.5 text-xs font-medium border-transparent border">
                                缺货警示
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
