'use client';

import * as React from 'react';
import { ArrowRight, Search, Check, AlertCircle, Trash2 } from 'lucide-react';

export default function OutWorkflowStep2() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">新建出库单 (OUT)</h1>
                    <p className="text-muted mt-1 text-sm">销售出库 / 出库单流程</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-medium">
                        保存草稿
                    </button>
                    <button className="h-9 px-4 border border-border bg-white text-primary flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-medium">
                        取消
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="flex w-full mt-2">
                <div className="flex-1 bg-[#EAF3EB] text-[#549363] flex items-center gap-3 p-4 border border-r border-white">
                    <div className="w-6 h-6 bg-[#549363] text-white flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']"><Check className="w-4 h-4" /></div>
                    <div className="font-bold text-sm">基础信息</div>
                </div>
                <div className="flex-1 bg-[#1a1a1a] text-white flex items-center gap-3 p-4">
                    <div className="w-6 h-6 bg-primary text-white flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']">2</div>
                    <div>
                        <div className="font-bold text-sm">导入出库明细</div>
                        <div className="text-xs text-gray-400">选择SKU及数量</div>
                    </div>
                </div>
                <div className="flex-1 bg-[#E8E4DC] text-muted flex items-center gap-3 p-4 border border-l-0 border-white">
                    <div className="w-6 h-6 border border-muted text-muted flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']">3</div>
                    <div className="font-bold text-sm">出库确认</div>
                </div>
                <div className="flex-1 bg-[#E8E4DC] text-muted flex items-center gap-3 p-4 border border-l-0 border-white">
                    <div className="w-6 h-6 border border-muted text-muted flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']">4</div>
                    <div className="font-bold text-sm">过账凭证</div>
                </div>
            </div>

            {/* Main Split */}
            <div className="flex gap-6 w-full items-start mt-4">

                {/* Left Form / Table */}
                <div className="flex-1 bg-white border border-border flex flex-col h-full rounded-sm overflow-hidden min-w-[700px] pb-10">
                    <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-[#FDFCFB]">
                        <h2 className="font-bold text-lg font-['var(--font-space-grotesk)'] tracking-wide">STEP 2 — 选择出库项</h2>

                        <div className="flex items-center gap-2">
                            <div className="relative w-64 border border-border">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                <input type="text" placeholder="搜索添加 SKU..." className="w-full h-9 pl-9 pr-3 text-sm outline-none placeholder:text-muted bg-white font-['var(--font-space-grotesk)']" />
                            </div>
                            <button className="bg-[#1a1a1a] text-white h-9 px-4 text-sm font-medium hover:bg-opacity-90">
                                批量导入
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-[300px_100px_120px_100px_1fr_40px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                        <div>SKU / 规格</div>
                        <div className="text-right">可用库存</div>
                        <div className="text-left pl-4">本次出库</div>
                        <div className="text-center">所在仓位</div>
                        <div>备注</div>
                        <div></div>
                    </div>

                    <div className="flex flex-col text-sm bg-white">

                        {/* Row 1 - OK */}
                        <div className="grid grid-cols-[300px_100px_120px_100px_1fr_40px] px-6 py-4 border-b border-border items-center hover:bg-gray-50">
                            <div>
                                <div className="font-medium font-['var(--font-space-grotesk)']">CAB-HDMI-2M</div>
                                <div className="text-xs text-muted max-w-[280px] truncate mt-1">HDMI 高清视频线 2米</div>
                            </div>
                            <div className="text-right font-['var(--font-space-grotesk)'] text-[#549363] font-bold">342</div>
                            <div className="text-left pl-4">
                                <input type="text" defaultValue="100" className="w-20 h-8 border border-border px-2 text-center font-['var(--font-space-grotesk)'] outline-none focus:border-black" />
                            </div>
                            <div className="text-center text-muted">--</div>
                            <div className="text-muted"><input type="text" placeholder="选填" className="w-full h-8 px-2 border border-transparent hover:border-border outline-none" /></div>
                            <div className="text-center text-muted cursor-pointer hover:text-primary"><Trash2 className="w-4 h-4" /></div>
                        </div>

                        {/* Row 2 - Shortage Error */}
                        <div className="grid grid-cols-[300px_100px_120px_100px_1fr_40px] px-6 py-4 border-b border-border items-center bg-[#FFF8F6]">
                            <div>
                                <div className="font-medium font-['var(--font-space-grotesk)'] text-primary">CON-RJ45-CAT6</div>
                                <div className="text-xs text-muted max-w-[280px] truncate mt-1">RJ45 水晶头 CAT6</div>
                            </div>
                            <div className="text-right font-['var(--font-space-grotesk)'] text-primary font-bold">12</div>
                            <div className="text-left pl-4 relative">
                                <input type="text" defaultValue="20" className="w-20 h-8 border border-primary px-2 text-center font-['var(--font-space-grotesk)'] text-primary outline-none focus:border-primary bg-[#FFEFEA]" />
                            </div>
                            <div className="text-center">
                                <span className="bg-primary text-white px-2 py-0.5 text-xs font-medium">缺货超额</span>
                            </div>
                            <div className="text-primary text-xs font-medium">库存不足!</div>
                            <div className="text-center text-primary cursor-pointer hover:opacity-80"><Trash2 className="w-4 h-4" /></div>
                        </div>

                        {/* Row 3 - OK */}
                        <div className="grid grid-cols-[300px_100px_120px_100px_1fr_40px] px-6 py-4 border-b border-border items-center hover:bg-gray-50">
                            <div>
                                <div className="font-medium font-['var(--font-space-grotesk)']">ADP-USBC-VGA</div>
                                <div className="text-xs text-muted max-w-[280px] truncate mt-1">USB-C 转 VGA 转换器</div>
                            </div>
                            <div className="text-right font-['var(--font-space-grotesk)'] text-[#549363] font-bold">80</div>
                            <div className="text-left pl-4">
                                <input type="text" defaultValue="25" className="w-20 h-8 border border-border px-2 text-center font-['var(--font-space-grotesk)'] outline-none focus:border-black" />
                            </div>
                            <div className="text-center text-muted">A-12-05</div>
                            <div className="text-muted"><input type="text" placeholder="选填" className="w-full h-8 px-2 border border-transparent hover:border-border outline-none" /></div>
                            <div className="text-center text-muted cursor-pointer hover:text-primary"><Trash2 className="w-4 h-4" /></div>
                        </div>

                    </div>
                </div>

                {/* Right Info Box */}
                <div className="w-[340px] flex flex-col gap-6">
                    <div className="bg-[#1a1a1a] text-white p-6 flex flex-col">
                        <h2 className="font-bold mb-6">出库概要</h2>

                        <div className="flex flex-col gap-4 text-sm border-b border-[#333] pb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">仓库</span>
                                <span className="font-medium">主仓库</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">关联 SO</span>
                                <span className="font-['var(--font-space-grotesk)'] font-medium text-primary">SO-2026-0034</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">客户</span>
                                <span className="font-medium">广州极客电子</span>
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-4 border-t border-[#333]">
                                <span className="text-gray-400">SKU 种类</span>
                                <span className="font-['var(--font-space-grotesk)'] font-bold">3 项</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">出库总量</span>
                                <span className="font-['var(--font-space-grotesk)'] font-bold">145 件</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">状态评估</span>
                                <span className="text-primary font-bold font-['var(--font-space-grotesk)']">1 项异常</span>
                            </div>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-[#FFEFEA] border border-[#FFD9CD] p-4 mt-6 flex gap-3 text-primary">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-1">
                                <div className="font-bold text-sm leading-none">库存不足拦截</div>
                                <div className="text-xs">
                                    <span className="font-['var(--font-space-grotesk)'] font-bold">CON-RJ45-CAT6</span> 申请出库 20 个，实际可用仅剩 12 个。请修改出库数量或移除该项。
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            <button className="border border-[#444] text-white py-3 h-12 font-bold hover:bg-[#2b2b2b] flex items-center justify-center text-sm transition-colors">
                                ← 上一步
                            </button>
                            <button className="bg-primary text-white opacity-50 cursor-not-allowed py-3 h-12 font-bold flex items-center justify-center gap-2 text-sm transition-colors">
                                下一步 | 推送至拾库 <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
