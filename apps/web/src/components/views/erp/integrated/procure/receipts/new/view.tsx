'use client';

import * as React from 'react';
import { ArrowRight, ChevronDown, Calendar } from 'lucide-react';

export default function GrnWorkflowStep1() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">新建入库单 (GRN)</h1>
                    <p className="text-muted mt-1 text-sm">库存变动 / 入库过账流程</p>
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
                <div className="flex-1 bg-[#1a1a1a] text-white flex items-center gap-3 p-4">
                    <div className="w-6 h-6 bg-primary text-white flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']">1</div>
                    <div>
                        <div className="font-bold text-sm">基础信息</div>
                        <div className="text-xs text-gray-400">仓库、PO、时间</div>
                    </div>
                </div>
                <div className="flex-1 bg-[#E8E4DC] text-muted flex items-center gap-3 p-4 border border-l-0 border-white">
                    <div className="w-6 h-6 border border-muted text-muted flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']">2</div>
                    <div>
                        <div className="font-bold text-sm">导入明细</div>
                        <div className="text-xs">SKU、数量、批次</div>
                    </div>
                </div>
                <div className="flex-1 bg-[#E8E4DC] text-muted flex items-center gap-3 p-4 border border-l-0 border-white">
                    <div className="w-6 h-6 border border-muted text-muted flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']">3</div>
                    <div>
                        <div className="font-bold text-sm">差异与证据</div>
                        <div className="text-xs">缺失/残损记录</div>
                    </div>
                </div>
                <div className="flex-1 bg-[#E8E4DC] text-muted flex items-center gap-3 p-4 border border-l-0 border-white">
                    <div className="w-6 h-6 border border-muted text-muted flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']">4</div>
                    <div>
                        <div className="font-bold text-sm">过账凭证</div>
                        <div className="text-xs">确认并提交</div>
                    </div>
                </div>
            </div>

            {/* Main Form Split */}
            <div className="flex gap-6 w-full items-start mt-4">

                {/* Left Form */}
                <div className="flex-1 bg-white border border-border p-8 flex flex-col gap-8">
                    <h2 className="font-bold text-lg font-['var(--font-space-grotesk)'] tracking-wide">STEP 1 — 基础信息</h2>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">入库仓库 <span className="text-primary">*</span></label>
                            <div className="relative border border-border hover:border-black transition-colors">
                                <select className="w-full h-11 px-4 appearance-none outline-none bg-transparent">
                                    <option>主仓库</option>
                                    <option>备用仓</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">关联 PO (可选)</label>
                            <div className="relative border border-border hover:border-black transition-colors">
                                <select className="w-full h-11 px-4 appearance-none outline-none bg-transparent font-['var(--font-space-grotesk)']">
                                    <option>PO-2026-0089</option>
                                    <option>无</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">入库日期 <span className="text-primary">*</span></label>
                            <div className="relative border border-border hover:border-black transition-colors">
                                <input
                                    type="text"
                                    defaultValue="2026-02-29"
                                    className="w-full h-11 px-4 outline-none font-['var(--font-space-grotesk)']"
                                />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">备注</label>
                            <input
                                type="text"
                                placeholder="网店急缺发货..."
                                className="w-full h-11 px-4 border border-border hover:border-black transition-colors outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="bg-primary hover:bg-opacity-90 text-primary-foreground h-11 px-6 font-bold flex items-center justify-center gap-3 transition-colors">
                            下一步 | 导入明细 <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right Info Box */}
                <div className="w-[340px] bg-[#1a1a1a] text-white p-6 flex flex-col">
                    <h2 className="font-bold mb-6">关联 PO 信息</h2>

                    <div className="flex flex-col gap-4 text-sm border-b border-[#333] pb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">PO 单号</span>
                            <span className="font-['var(--font-space-grotesk)'] font-medium">PO-2026-0089</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">供应商</span>
                            <span className="font-medium">金源科技</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">下单日期</span>
                            <span className="font-['var(--font-space-grotesk)']">2026-02-15</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">预计送达</span>
                            <span className="font-['var(--font-space-grotesk)'] text-primary">2026-02-28</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">SKU 种类</span>
                            <span className="font-['var(--font-space-grotesk)'] font-bold">5 项</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">状态</span>
                            <span className="text-primary font-medium flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-sm" /> 待发货
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 text-sm pt-6">
                        <div className="text-gray-400 text-xs mb-1">PO 预期明细</div>
                        <div className="flex justify-between items-center">
                            <span className="font-['var(--font-space-grotesk)'] font-medium truncate max-w-[200px]">CAB-HDMI-2M</span>
                            <span className="font-['var(--font-space-grotesk)'] text-gray-400">x 200</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-['var(--font-space-grotesk)'] font-medium truncate max-w-[200px]">CON-RJ45-CAT6</span>
                            <span className="font-['var(--font-space-grotesk)'] text-gray-400">x 500</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-['var(--font-space-grotesk)'] font-medium truncate max-w-[200px]">ADP-USBC-VGA</span>
                            <span className="font-['var(--font-space-grotesk)'] text-gray-400">x 80</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
