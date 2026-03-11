'use client';

import * as React from 'react';
import { AlertTriangle, FileBox, RefreshCcw, ArrowRight } from 'lucide-react';

export default function FinanceOverview() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
            {/* Header */}
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">财务概览</h1>
                    <p className="text-muted mt-1 text-sm">2026年度财务看板</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm">
                        导出报表
                    </button>
                </div>
            </div>

            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-4 gap-6 w-full mt-2">
                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-muted text-sm font-medium mb-1">年度营收</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] text-primary leading-tight">¥2.4M</div>
                    <div className="text-xs text-primary mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> 存在账期延误
                    </div>
                </div>

                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-muted text-sm font-medium mb-1">应收账款</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] leading-tight">¥1.8M</div>
                    <div className="text-xs text-muted mt-2 flex items-center gap-1">
                        含 30 天以上 ¥500K
                    </div>
                </div>

                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-muted text-sm font-medium mb-1 flex justify-between items-center w-full">
                        本月利润
                    </div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] text-[#549363] leading-tight">¥685K</div>
                    <div className="text-xs mt-2 text-[#549363] flex items-center gap-1 font-medium">
                        增速 +15.5%
                    </div>
                </div>

                <div className="bg-[#1a1a1a] text-white flex flex-col p-5 shadow-sm">
                    <div className="text-gray-400 text-sm font-medium mb-1">本月未付账款</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] leading-tight">¥920K</div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
                        去处理应付款
                    </div>
                </div>
            </div>

            <div className="flex gap-6 mt-2">
                {/* Left: To-do List */}
                <div className="flex-[2] bg-white border border-border shadow-sm p-6 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg">财务待办</h2>
                        <button className="bg-primary text-white text-xs px-3 py-1 font-bold">5 项待处理</button>
                    </div>

                    <div className="flex flex-col">
                        <div className="py-4 border-b border-border flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-primary" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-primary text-sm">3 笔逾期未到的应收款</span>
                            </div>
                            <div className="text-muted text-sm pl-6 mt-1 flex justify-between">
                                <span>合计应收 ¥256,000 · 逾期超过 20 天 · 已打标记</span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs text-foreground cursor-pointer">发函催款</button>
                            </div>
                        </div>

                        <div className="py-4 border-b border-border flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <FileBox className="w-4 h-4 text-foreground" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-foreground text-sm">8 期付款单待批</span>
                            </div>
                            <div className="text-muted text-sm pl-6 flex justify-between mt-1">
                                <span>合计 ¥990,000 · 等待复核放款 </span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs text-foreground cursor-pointer">开始审核</button>
                            </div>
                        </div>

                        <div className="py-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4 text-foreground" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-foreground text-sm">2 月凭证待结转</span>
                            </div>
                            <div className="text-muted text-sm pl-6 flex justify-between mt-1">
                                <span>2026年2月总计期末未结账 </span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs text-foreground cursor-pointer">期末结转</button>
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
                                + 新建账单
                            </button>
                            <button className="bg-[#2a2a2a] text-white py-2.5 font-medium hover:bg-[#333] flex items-center justify-between px-4 text-[13px] border border-[#333] transition-colors shadow-sm">
                                <div className="flex gap-2 items-center"><FileBox className="w-4 h-4" /> 收款认领登记</div>
                                <ArrowRight className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="bg-[#2a2a2a] text-white py-2.5 font-medium hover:bg-[#333] flex items-center justify-between px-4 text-[13px] border border-[#333] transition-colors shadow-sm">
                                <div className="flex gap-2 items-center"><RefreshCcw className="w-4 h-4" /> 新增记账凭证</div>
                                <ArrowRight className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
