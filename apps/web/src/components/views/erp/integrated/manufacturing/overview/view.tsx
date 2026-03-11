'use client';

import * as React from 'react';
import { AlertTriangle, FileBox, Factory, ArrowRight } from 'lucide-react';

export default function MfgOverview() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
            {/* Header */}
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">制造概览</h1>
                    <p className="text-muted mt-1 text-sm">2026年度制造看板</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新建工单
                    </button>
                </div>
            </div>

            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-4 gap-6 w-full mt-2">
                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-primary text-sm font-medium mb-1">在制工单</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] text-primary leading-tight">24</div>
                    <div className="text-xs text-primary mt-2 flex items-center gap-1">
                        12 个预警
                    </div>
                </div>

                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-muted text-sm font-medium mb-1">本月产量</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] leading-tight">1,340</div>
                    <div className="text-xs text-[#549363] mt-2 flex items-center gap-1">
                        达成率 89%
                    </div>
                </div>

                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-muted text-sm font-medium mb-1 flex justify-between items-center w-full">
                        良品率
                    </div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] text-[#549363] leading-tight">98.5%</div>
                    <div className="text-xs mt-2 text-muted flex items-center gap-1 font-medium">
                        环比 +0.4%
                    </div>
                </div>

                <div className="bg-[#1a1a1a] text-white flex flex-col p-5 shadow-sm">
                    <div className="text-gray-400 text-sm font-medium mb-1">设备利用率</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] leading-tight">76%</div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        2 台停机
                    </div>
                </div>
            </div>

            <div className="flex gap-6 mt-2">
                {/* Left: To-do List */}
                <div className="flex-[2] bg-white border border-border shadow-sm p-6 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg">生产待办</h2>
                        <button className="bg-primary text-white text-xs px-3 py-1 font-bold">3 项待处理</button>
                    </div>

                    <div className="flex flex-col">
                        <div className="py-4 border-b border-border flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-primary" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-primary text-sm">WO-20260216-041 濒临逾期未完工</span>
                            </div>
                            <div className="text-muted text-sm pl-6 mt-1 flex justify-between">
                                <span>外协加工订单，已超期 2 天</span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs text-foreground cursor-pointer">发函催办</button>
                            </div>
                        </div>

                        <div className="py-4 border-b border-border flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Factory className="w-4 h-4 text-foreground" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-foreground text-sm">物料申请 MR-20260205-006 待领料</span>
                            </div>
                            <div className="text-muted text-sm pl-6 flex justify-between mt-1">
                                <span>配料完成，虚领料员确认 </span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs text-foreground cursor-pointer">确认领料</button>
                            </div>
                        </div>

                        <div className="py-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-foreground" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-foreground text-sm">质检报告 QC-20260215-003 不合格</span>
                            </div>
                            <div className="text-muted text-sm pl-6 flex justify-between mt-1">
                                <span>成品良率 92%，低于标准 98% </span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs text-foreground cursor-pointer">处理不合格品</button>
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
                                + 新建工单
                            </button>
                            <button className="bg-[#2a2a2a] text-white py-2.5 font-medium hover:bg-[#333] flex items-center justify-between px-4 text-[13px] border border-[#333] transition-colors shadow-sm">
                                <div className="flex gap-2 items-center"><Factory className="w-4 h-4" /> 委外配置</div>
                                <ArrowRight className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="bg-[#2a2a2a] text-white py-2.5 font-medium hover:bg-[#333] flex items-center justify-between px-4 text-[13px] border border-[#333] transition-colors shadow-sm">
                                <div className="flex gap-2 items-center"><FileBox className="w-4 h-4" /> 质检结算</div>
                                <ArrowRight className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
