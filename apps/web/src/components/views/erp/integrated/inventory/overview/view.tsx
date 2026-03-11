'use client';

import * as React from 'react';
import { AlertTriangle, ArrowRight, PackageOpen, Boxes } from 'lucide-react';

export default function InvOverview() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto relative w-full">
            {/* Header */}
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">库存概览</h1>
                    <p className="text-muted mt-1 text-sm">2026年度库存、盘点看板</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新建盘点
                    </button>
                </div>
            </div>

            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-4 gap-6 w-full mt-2">
                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-muted text-sm font-medium mb-1">物理总库存</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] leading-tight">1,247</div>
                    <div className="text-xs text-muted mt-2 flex items-center gap-1">
                        SKU 数量分布
                    </div>
                </div>

                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-muted text-sm font-medium mb-1">库存总估值</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] leading-tight">¥8.2M</div>
                    <div className="text-xs text-[#549363] mt-2 flex items-center gap-1">
                        同比上月 <span className="font-medium">+7.2%</span>
                    </div>
                </div>

                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-primary text-sm font-medium mb-1 flex justify-between items-center w-full">
                        积压过长库位
                    </div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] text-primary leading-tight">38</div>
                    <div className="text-xs mt-2 text-primary flex items-center gap-1 font-medium hover:underline cursor-pointer">
                        点击处理
                    </div>
                </div>

                <div className="bg-[#1a1a1a] text-white flex flex-col p-5 shadow-sm">
                    <div className="text-gray-400 text-sm font-medium mb-1">本月发货明细</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] leading-tight">1,856</div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                        查看流向流水
                    </div>
                </div>
            </div>

            <div className="flex gap-6 mt-2">
                {/* Left: To-do List */}
                <div className="flex-[2] bg-white border border-border shadow-sm p-6 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg">库存异常提醒</h2>
                        <button className="bg-primary text-white text-xs px-3 py-1 font-bold">28 项目处理</button>
                    </div>

                    <div className="flex flex-col">
                        <div className="py-4 border-b border-border flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-primary" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-primary text-sm">SKU-ICMB-2M 库存低于安全阀值</span>
                            </div>
                            <div className="text-muted text-sm pl-6 mt-1 flex justify-between">
                                <span>当前 36 · 安全线为 50 · 需要备采物料</span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs text-foreground cursor-pointer">自动带出采购单</button>
                            </div>
                        </div>

                        <div className="py-4 border-b border-border flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Boxes className="w-4 h-4 text-foreground" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-foreground text-sm">A20-LED50-V9B 移库提醒</span>
                            </div>
                            <div className="text-muted text-sm pl-6 flex justify-between mt-1">
                                <span>装配区缺少 · 建议从成品库转移 · 数量 100 </span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs text-foreground cursor-pointer">确认转调</button>
                            </div>
                        </div>

                        <div className="py-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-foreground" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-foreground text-sm">7 个批次物料即将过期</span>
                            </div>
                            <div className="text-muted text-sm pl-6 flex justify-between mt-1">
                                <span>距过期 30 天的防湿漆 · 需紧急处理库存 </span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs text-foreground cursor-pointer">进入明细</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Actions */}
                <div className="flex-[1] flex flex-col gap-6">
                    <div className="bg-[#1a1a1a] text-white p-6 shadow-sm flex flex-col">
                        <h2 className="font-bold mb-4">快捷操作</h2>
                        <div className="flex flex-col gap-3">
                            <button className="bg-primary text-white py-3 font-bold hover:bg-opacity-90 flex items-center justify-center gap-2 text-sm transition-colors border-none w-full shadow-sm">
                                + 新建盘点
                            </button>
                            <button className="bg-[#2a2a2a] text-white py-2.5 font-medium hover:bg-[#333] flex items-center justify-between px-4 text-[13px] border border-[#333] transition-colors shadow-sm">
                                <div className="flex gap-2 items-center"><PackageOpen className="w-4 h-4" /> 查看库存流水</div>
                                <ArrowRight className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="bg-[#2a2a2a] text-white py-2.5 font-medium hover:bg-[#333] flex items-center justify-between px-4 text-[13px] border border-[#333] transition-colors shadow-sm">
                                <div className="flex gap-2 items-center"><Boxes className="w-4 h-4" /> 移库调整</div>
                                <ArrowRight className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
