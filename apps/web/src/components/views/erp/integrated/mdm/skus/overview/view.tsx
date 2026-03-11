'use client';

import * as React from 'react';
import { ArrowUpRight, Plus, Download, ArrowRight } from 'lucide-react';

export default function SkuOverview() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">SKU 概览</h1>
                    <p className="text-muted mt-1 text-sm">2026年3月10日 · 星期二</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <ArrowUpRight className="w-5 h-5" />
                    </button>
                    <button className="h-10 px-4 bg-[#1a1a1a] text-white flex items-center gap-2 hover:bg-opacity-90 transition-colors text-sm font-medium">
                        导入工作台
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6 w-full">
                <div className="bg-[#E8E4DC] p-6 flex flex-col gap-2 relative">
                    <div className="text-muted text-sm font-medium">总 SKU 数</div>
                    <div className="text-4xl font-bold font-['var(--font-space-grotesk)'] mt-1">1,247</div>
                    <div className="text-[#549363] text-xs font-medium mt-2">▲ 23 本月新增</div>
                </div>

                <div className="bg-[#E8E4DC] p-6 flex flex-col gap-2 relative">
                    <div className="text-muted text-sm font-medium">缺货/需补货</div>
                    <div className="text-4xl font-bold font-['var(--font-space-grotesk)'] text-primary mt-1">14</div>
                    <div className="text-primary text-xs font-medium mt-2">● 立即补货</div>
                </div>

                <div className="bg-[#E8E4DC] p-6 flex flex-col gap-2 relative">
                    <div className="text-muted text-sm font-medium">即将断货 SKU</div>
                    <div className="text-4xl font-bold font-['var(--font-space-grotesk)'] mt-1">38</div>
                    <div className="text-[#549363] text-xs font-medium mt-2">● 7天内告急</div>
                </div>

                <div className="bg-[#1a1a1a] text-white p-6 flex flex-col gap-2 relative">
                    <div className="text-gray-400 text-sm font-medium">废旧 SKU</div>
                    <div className="text-4xl font-bold font-['var(--font-space-grotesk)'] mt-1">67</div>
                    <div className="text-gray-400 text-xs font-medium mt-2">● 占总 5.3%</div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="flex gap-6 w-full items-start">

                {/* Left: To-do list */}
                <div className="flex-1 bg-white border border-border flex flex-col">
                    <div className="p-5 border-b border-border flex justify-between items-center">
                        <h2 className="font-bold">待办事项</h2>
                        <button className="bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-opacity-90 transition-opacity">
                            去处理
                        </button>
                    </div>

                    <div className="flex flex-col">
                        {[
                            { id: 1, title: '14 个 SKU 待库存盘点', desc: '距离上次盘点已超过 30 天，建议重新评估', iconColor: 'bg-primary' },
                            { id: 2, title: '38 个 SKU 缺少外部包装规格', desc: '入库和出库时可能受阻', iconColor: 'bg-primary' },
                            { id: 3, title: '5 个即将断货 SKU 需跟进', desc: '涉及金额大约 34,000 RMB，请尽快处理', iconColor: 'bg-[#548093]' },
                            { id: 4, title: 'PO-2026-0089 今日已到货', desc: '包含 5 个 SKU (HDMI 线材)，请确认入库', iconColor: 'bg-primary' },
                        ].map(item => (
                            <div key={item.id} className="p-5 border-b border-border flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className={`w-2 h-2 mt-2 ${item.iconColor}`} />
                                    <div>
                                        <div className="font-medium text-[15px]">{item.title}</div>
                                        <div className="text-sm text-muted mt-1">{item.desc}</div>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Quick actions & Activity */}
                <div className="w-[340px] flex flex-col gap-6">

                    {/* Quick Actions */}
                    <div className="bg-sidebar p-5 flex flex-col gap-4">
                        <h2 className="font-bold text-sidebar-foreground mb-2">快捷操作</h2>

                        <button className="w-full bg-primary hover:bg-opacity-90 text-primary-foreground py-2.5 px-4 flex items-center gap-2 font-medium transition-colors">
                            <Plus className="w-4 h-4" />
                            新增 SKU
                        </button>
                        <button className="w-full bg-[#2b2b2b] hover:bg-[#3b3b3b] text-sidebar-foreground border border-sidebar-border py-2.5 px-4 flex items-center gap-2 font-medium transition-colors">
                            <Plus className="w-4 h-4" />
                            新增入库单
                        </button>
                        <button className="w-full bg-[#2b2b2b] hover:bg-[#3b3b3b] text-sidebar-foreground border border-sidebar-border py-2.5 px-4 flex items-center gap-2 font-medium transition-colors">
                            <Download className="w-4 h-4" />
                            数据导入/导出
                        </button>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-white border border-border flex flex-col">
                        <div className="p-4 border-b border-border flex justify-between items-center">
                            <h2 className="font-bold text-sm">最近热销</h2>
                            <span className="text-primary text-xs cursor-pointer hover:underline">查看全部</span>
                        </div>

                        <div className="flex flex-col">
                            {[
                                { title: '新增 SKU PWR-100W-USBC', time: '12 个销单 · 高频' },
                                { title: '新增 SKU CAB-HDMI-2M', time: '8 个销单 · 平均' },
                                { title: '新增 SKU HUB-USB3-7P', time: '5 个销单 · 稳定' },
                                { title: '库存消耗 ADP-USBC-VGA', time: '2 个销单 · 极低' },
                            ].map((activity, idx) => (
                                <div key={idx} className="p-4 border-b border-border flex gap-3 items-start last:border-b-0">
                                    <div className={`w-1.5 h-1.5 mt-1.5 flex-shrink-0 ${idx < 2 ? 'bg-[#549363]' : idx === 2 ? 'bg-primary' : 'bg-primary'}`} />
                                    <div>
                                        <div className="text-sm font-medium">{activity.title}</div>
                                        <div className="text-xs text-muted mt-1">{activity.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
