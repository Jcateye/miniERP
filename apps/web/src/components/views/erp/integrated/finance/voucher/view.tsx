'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

export default function VoucherList() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">会计凭证</h1>
                    <p className="mt-2 text-[13px] text-muted">凭证 · 凭证查询</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-10 px-5 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新建凭证
                    </button>
                </div>
            </div>

            <div className="w-full bg-white border border-border p-2">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                        type="text"
                        placeholder="搜索凭证号、摘要..."
                        className="w-full h-10 pl-10 pr-4 text-sm outline-none placeholder:text-muted bg-transparent font-['var(--font-space-grotesk)']"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center w-full mt-2">
                <div className="flex gap-2 text-sm">
                    <button className="h-9 px-4 bg-[#1a1a1a] text-white text-xs font-bold shadow-sm">全部</button>
                    <button className="h-9 px-4 bg-white border border-border text-muted text-xs font-bold hover:bg-background shadow-sm transition-colors">待结转</button>
                    <button className="h-9 px-4 bg-white border border-border text-muted text-xs font-bold hover:bg-background shadow-sm transition-colors">已结转</button>
                </div>
                <div className="text-xs text-muted flex items-center gap-2">
                    共 1,850 张凭证
                </div>
            </div>

            <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-2">
                <div className="grid grid-cols-[160px_120px_100px_1fr_120px_120px_80px] h-10 items-center px-6 border-b border-border text-xs font-bold text-muted uppercase tracking-wider bg-[#FDFCFB]">
                    <div>凭证号</div>
                    <div>制单期</div>
                    <div>来源</div>
                    <div>摘要</div>
                    <div className="text-right">借方</div>
                    <div className="text-right">贷方</div>
                    <div className="text-center">状态</div>
                </div>

                <div className="flex flex-col text-sm bg-white overflow-y-auto">
                    <div className="grid grid-cols-[160px_120px_100px_1fr_120px_120px_80px] px-6 py-4 border-b border-border items-center hover:bg-background/50 transition-colors">
                        <div className="text-sm font-medium italic text-[#C05A3C] cursor-pointer hover:underline font-mono">JV-20260216-166</div>
                        <div className="text-sm text-muted font-mono">2026-02-16</div>
                        <div className="text-[13px] font-bold text-[#1a1a1a]">收银</div>
                        <div className="text-sm text-muted truncate pr-4">收到深圳星级网吧款项 3笔(含AR)</div>
                        <div className="text-right text-[15px] font-bold text-[#1a1a1a] font-mono">¥186,000.00</div>
                        <div className="text-right text-[15px] font-bold text-muted text-opacity-30 font-mono">¥186,000.00</div>
                        <div className="text-center">
                            <span className="bg-[#F6FFF8] text-[#22C55E] px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight">
                                已过账
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
