'use client';

import * as React from 'react';

export default function StocktakeNew() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto relative w-full">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">新建盘点</h1>
                    <p className="text-muted mt-1 text-sm">分步向导 · 2步完成 · 锁定库存数据</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm text-foreground">
                        保存草稿
                    </button>
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        开始盘点
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-sm font-['var(--font-space-grotesk)'] font-medium">
                <div className="bg-primary text-white py-1.5 px-4">1 盘点范围</div>
                <div className="h-[2px] w-8 bg-border"></div>
                <div className="bg-white border border-border text-muted py-1.5 px-4">2 录入数据</div>
            </div>

            <div className="flex mt-6 gap-8">
                <div className="flex-[3] flex flex-col gap-6 max-w-3xl">
                    <h2 className="font-bold">STEP 1 — 选择盘点范围</h2>
                    <div className="grid grid-cols-2 gap-6 w-full">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">仓库 *</label>
                            <input type="text" placeholder="请选择仓库..." className="border border-border p-3 text-sm flex-1 outline-none w-full shadow-sm bg-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">盘点类型 *</label>
                            <input type="text" placeholder="全盘" className="border border-border p-3 text-sm flex-1 outline-none w-full shadow-sm bg-[#fafafa]" disabled value="全盘" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">盘点日期 *</label>
                            <input type="date" placeholder="2026-02-20" className="border border-border p-3 text-sm flex-1 outline-none w-full shadow-sm font-['var(--font-space-grotesk)'] bg-white" defaultValue="2026-02-20" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">负责人</label>
                            <input type="text" placeholder="请选择" className="border border-border p-3 text-sm flex-1 outline-none w-full shadow-sm bg-white" />
                        </div>
                    </div>

                    <div>
                        <button className="bg-primary text-white font-bold py-2.5 px-6 opacity-90 hover:opacity-100 flex items-center justify-center gap-2 mt-4 transition-all shadow-sm">
                            下一步 · 载入系统余额 →
                        </button>
                    </div>
                </div>

                {/* Right Info Panel */}
                <div className="flex-[1] bg-[#1a1a1a] shadow-sm flex flex-col p-8 text-white max-w-sm h-fit sticky top-10">
                    <h2 className="font-bold mb-6 text-xl">盘点预设</h2>
                    <div className="flex justify-between items-center py-3 border-b border-[#333] text-sm">
                        <span className="text-gray-400">单号</span>
                        <span className="font-['var(--font-space-grotesk)'] text-white">ST-20260220-006</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#333] text-sm">
                        <span className="text-gray-400">状态</span>
                        <span className="text-primary font-bold">草稿中</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#333] text-sm">
                        <span className="text-gray-400">类型</span>
                        <span className="text-white">全盘</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
