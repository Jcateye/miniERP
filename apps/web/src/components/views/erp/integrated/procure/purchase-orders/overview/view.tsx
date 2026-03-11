'use client';

import * as React from 'react';
import { FileText, ArrowRight, AlertTriangle, FileBox, Inbox, Clock } from 'lucide-react';

export default function PoOverview() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
            {/* Header */}
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">采购概览</h1>
                    <p className="text-muted mt-1 text-sm">供应链管理核心数据看板</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新建采购单
                    </button>
                </div>
            </div>

            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-4 gap-6 w-full mt-2">

                {/* Card 1 */}
                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-muted text-sm font-medium mb-1">本月采购单</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] text-primary leading-tight">12</div>
                    <div className="text-xs text-muted mt-2 flex items-center gap-1">
                        同比上月 <span className="text-muted">+2</span>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-muted text-sm font-medium mb-1">本月总额</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] leading-tight">¥285,430</div>
                    <div className="text-xs text-muted mt-2 flex items-center gap-1">
                        同比上月 <span className="text-muted">+12.4%</span>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white border border-border flex flex-col p-5 shadow-sm">
                    <div className="text-muted text-sm font-medium mb-1 flex justify-between items-center w-full">
                        待收货
                    </div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] text-[#549363] leading-tight">8</div>
                    <div className="text-xs mt-2 text-primary flex items-center gap-1">
                        其中 2 个异常
                    </div>
                </div>

                {/* Card 4 - Dark */}
                <div className="bg-[#1a1a1a] text-white flex flex-col p-5 shadow-sm">
                    <div className="text-gray-400 text-sm font-medium mb-1">本月入库 SKU</div>
                    <div className="text-[32px] font-bold font-['var(--font-space-grotesk)'] leading-tight">47</div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        总货值 ¥10,000
                    </div>
                </div>

            </div>

            <div className="flex gap-6 mt-2">
                {/* Left: To-do List */}
                <div className="flex-[2] bg-white border border-border shadow-sm p-6 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg">紧急待办</h2>
                        <button className="bg-primary text-white text-xs px-3 py-1 font-bold">5 项待处理</button>
                    </div>

                    <div className="flex flex-col">
                        {/* Task 1 */}
                        <div className="py-4 border-b border-border flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-primary" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-primary text-sm">PO-20260215-028 异常收货</span>
                            </div>
                            <div className="text-muted text-sm pl-6 mt-1 flex justify-between">
                                <span>实收到货与采购单数量不匹配，缺货 20 件</span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs">查看并处理</button>
                            </div>
                        </div>

                        {/* Task 2 */}
                        <div className="py-4 border-b border-border flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <FileBox className="w-4 h-4 text-foreground" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-foreground text-sm">GRN-20260216-112 需要财务检查</span>
                            </div>
                            <div className="text-muted text-sm pl-6 flex justify-between mt-1">
                                <span>请确认发票数目及入库总价一致</span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs">去开票</button>
                            </div>
                        </div>

                        {/* Task 3 */}
                        <div className="py-4 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-foreground" />
                                <span className="font-bold text-foreground text-sm">3 个供应商未按期交货预警</span>
                            </div>
                            <div className="text-muted text-sm pl-6 flex justify-between mt-1">
                                <span>最长超时 5 天未反馈进度说明</span>
                                <button className="border border-border bg-white hover:bg-gray-50 px-3 py-1 text-xs">去催缴</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Actions & Activity */}
                <div className="flex-[1] flex flex-col gap-6">
                    {/* Quick Actions Dark Card */}
                    <div className="bg-[#1a1a1a] text-white p-6 shadow-sm flex flex-col">
                        <h2 className="font-bold mb-4">快捷入口</h2>
                        <div className="flex flex-col gap-3">
                            <button className="bg-primary text-white py-3 font-bold hover:bg-opacity-90 flex items-center justify-center gap-2 text-sm transition-colors border-none w-full shadow-sm">
                                + 新建采购单
                            </button>
                            <button className="bg-[#2a2a2a] text-white py-2.5 font-medium hover:bg-[#333] flex items-center justify-between px-4 text-[13px] border border-[#333] transition-colors shadow-sm">
                                <div className="flex gap-2 items-center"><Inbox className="w-4 h-4" /> 查看入库单 GRN</div>
                                <ArrowRight className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="bg-[#2a2a2a] text-white py-2.5 font-medium hover:bg-[#333] flex items-center justify-between px-4 text-[13px] border border-[#333] transition-colors shadow-sm">
                                <div className="flex gap-2 items-center"><FileText className="w-4 h-4" /> 供应商发票管理</div>
                                <ArrowRight className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white border border-border shadow-sm p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-base">最近动态</h2>
                            <span className="text-xs text-primary cursor-pointer hover:underline">查看全部</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1 border-b border-border pb-4">
                                <div className="text-sm font-medium flex justify-between items-center">
                                    <span className="font-['var(--font-space-grotesk)']">采购 PO-20260216-015 已审批通过</span>
                                </div>
                                <div className="text-xs text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> 1 小时前</div>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-border pb-4">
                                <div className="text-sm font-medium flex justify-between items-center">
                                    <span className="font-['var(--font-space-grotesk)']">GRN-20260215-028 入库过账完成</span>
                                </div>
                                <div className="text-xs text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> 5 小时前</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="text-sm font-medium flex justify-between items-center">
                                    <span>供应商 [新明建材] 更新交期到周五</span>
                                </div>
                                <div className="text-xs text-muted flex items-center gap-1"><Clock className="w-3 h-3" /> 8 小时前</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
