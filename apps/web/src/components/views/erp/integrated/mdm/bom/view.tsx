'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

export default function BomList() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">BOM 物料清单</h1>
                    <p className="mt-2 text-[13px] text-muted">Bill of Materials · 基础数据管理</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-10 px-5 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新建BOM
                    </button>
                </div>
            </div>

            <div className="w-full bg-white border border-border p-2">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="搜索BOM编号、产品名称..."
                        className="w-full h-10 pl-10 pr-4 text-sm outline-none placeholder:text-muted bg-transparent font-['var(--font-space-grotesk)']"
                    />
                </div>
            </div>

            <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-2">
                <div className="grid grid-cols-[160px_300px_100px_120px_100px_100px_80px] h-10 items-center px-6 border-b border-border text-xs font-bold text-muted uppercase tracking-wider bg-[#FDFCFB]">
                    <div>BOM编号</div>
                    <div>产品名称</div>
                    <div>版本</div>
                    <div>生效日期</div>
                    <div className="text-center">组件数</div>
                    <div>类型</div>
                    <div className="text-center">状态</div>
                </div>

                <div className="flex flex-col text-sm bg-white overflow-y-auto">
                    <div className="grid grid-cols-[160px_300px_100px_120px_100px_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-background/50 transition-colors group">
                        <div className="text-sm font-medium italic text-[#C05A3C] cursor-pointer hover:underline font-mono">BOM-001</div>
                        <div className="text-[14px] font-bold text-[#1a1a1a] truncate pr-4">PCBA电路板总成</div>
                        <div className="text-sm text-muted font-mono">V2</div>
                        <div className="text-sm text-muted font-mono">2026-01-15</div>
                        <div className="text-[15px] font-bold text-[#1a1a1a] font-mono text-center">8</div>
                        <div className="text-sm text-muted">生产</div>
                        <div className="text-center">
                            <span className="bg-[#F6FFF8] text-[#22C55E] px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight">
                                生效中
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
