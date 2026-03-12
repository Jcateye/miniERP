'use client';

import * as React from 'react';
import { AlertTriangle, FileBox, Send, ArrowRight, Plus } from 'lucide-react';

export default function SoOverview() {
    return (
        <div className="flex h-full flex-col gap-6 p-8 pb-20 sm:p-10 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">销售概览</h1>
                    <p className="mt-2 text-[13px] text-muted">2026年度销售业绩看板 / 数据中心</p>
                </div>

                <div className="flex gap-2 text-sm font-bold">
                    <button className="h-10 px-5 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-opacity shadow-sm">
                        新建销售订单
                    </button>
                </div>
            </div>

            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-4 gap-0 border border-[#C05A3C] w-full overflow-hidden">
                <div className="bg-[#FFF5F5] border-r border-[#C05A3C] p-6 h-[180px] flex flex-col justify-between relative group hover:bg-[#FFF0F0] transition-colors">
                    <div className="border-l-[2px] border-[#E5484D] pl-3">
                        <div className="text-muted text-[13px] font-medium uppercase tracking-wider">本月销售额</div>
                    </div>
                    <div className="text-[36px] font-bold font-['var(--font-space-grotesk)'] text-[#E5484D] leading-none mb-2">¥1,285.6k</div>
                    <div className="text-[#E5484D] text-[12px] font-bold uppercase tracking-tight opacity-70">同比上月 +18.4%</div>
                </div>

                <div className="bg-[#F6FFF8] border-r border-[#C05A3C] p-6 h-[180px] flex flex-col justify-between relative group hover:bg-[#F0FFF4] transition-colors">
                    <div className="border-l-[2px] border-[#22C55E] pl-3">
                        <div className="text-muted text-[13px] font-medium uppercase tracking-wider">待发货订单</div>
                    </div>
                    <div className="text-[36px] font-bold font-['var(--font-space-grotesk)'] text-[#22C55E] leading-none mb-2">23</div>
                    <div className="text-[#22C55E] text-[12px] font-bold uppercase tracking-tight opacity-70">3 单超期须预警</div>
                </div>

                <div className="bg-[#F0F9FF] border-r border-[#C05A3C] p-6 h-[180px] flex flex-col justify-between relative group hover:bg-[#E6F4FF] transition-colors">
                    <div className="border-l-[2px] border-[#2D5BFF] pl-3">
                        <div className="text-muted text-[13px] font-medium uppercase tracking-wider">活跃客户</div>
                    </div>
                    <div className="text-[36px] font-bold font-['var(--font-space-grotesk)'] text-[#2D5BFF] leading-none mb-2">156</div>
                    <div className="text-[#2D5BFF] text-[12px] font-bold uppercase tracking-tight opacity-70">本月新增 12 个</div>
                </div>

                <div className="bg-[#1a1a1a] p-6 h-[180px] flex flex-col justify-between relative group hover:bg-black transition-colors">
                    <div className="border-l-[2px] border-gray-500 pl-3">
                        <div className="text-gray-400 text-[13px] font-medium uppercase tracking-wider">报价转化率</div>
                    </div>
                    <div className="text-[36px] font-bold font-['var(--font-space-grotesk)'] text-white leading-none mb-2">67%</div>
                    <div className="text-gray-400 text-[12px] font-bold uppercase tracking-tight opacity-70">同比上升 3%</div>
                </div>
            </div>

            <div className="flex gap-6 mt-2 items-start">
                {/* Left: To-do List */}
                <div className="flex-[2] bg-white border border-border shadow-sm flex flex-col min-h-[450px]">
                    <div className="p-6 border-b border-border">
                        <h2 className="font-bold text-[15px] uppercase tracking-wider">紧急待办清单</h2>
                    </div>

                    <div className="flex flex-col">
                        <div className="p-6 border-b border-border group hover:bg-[#FFF8F6] transition-colors cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-[#C05A3C]" />
                                <span className="font-bold font-['var(--font-space-grotesk)'] text-[#C05A3C] text-[15px]">SO-20260215-022 超期未发货</span>
                            </div>
                            <div className="text-[14px] text-[#1a1a1a] font-medium ml-6">客户 [深圳科技] 紧急催单，延期超过 2 天</div>
                            <div className="text-[12px] text-muted mt-2 ml-6 flex justify-between items-center">
                                <span>销售二组 · 李明</span>
                                <button className="h-8 px-4 border border-border bg-white text-xs font-bold hover:bg-gray-50 transition-colors">去处理发运</button>
                            </div>
                        </div>

                        <div className="p-6 border-b border-border group hover:bg-[#F6FFF8] transition-colors cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                                <Send className="w-4 h-4 text-[#22C55E]" />
                                <span className="font-bold text-[#1a1a1a] text-[15px]">6 个大额报价单待发出</span>
                            </div>
                            <div className="text-[14px] text-[#1a1a1a] font-medium ml-6">平均停留时长 1 天，需业务跟进确认</div>
                            <div className="text-[12px] text-muted mt-2 ml-6 flex justify-between items-center">
                                <span>销售一组 · 王强</span>
                                <button className="h-8 px-4 border border-border bg-white text-xs font-bold hover:bg-gray-50 transition-colors">查看详情</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Quick Actions */}
                <div className="flex-[1] flex flex-col gap-6">
                    <div className="bg-[#1a1a1a] text-white p-6 shadow-sm flex flex-col">
                        <h2 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-6">快捷操作</h2>
                        <div className="flex flex-col">
                            <button className="w-full h-14 border-t border-white/5 flex items-center justify-between text-[14px] font-medium hover:bg-white/5 transition-colors px-1 group">
                                <span>新建销售订单</span>
                                <Plus className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                            </button>
                            <button className="w-full h-14 border-t border-white/5 flex items-center justify-between text-[14px] font-medium hover:bg-white/5 transition-colors px-1 group">
                                <span>查看发运单 SHP</span>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                            </button>
                            <button className="w-full h-14 border-t border-b border-white/5 flex items-center justify-between text-[14px] font-medium hover:bg-white/5 transition-colors px-1 group">
                                <span>退货与售后</span>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
