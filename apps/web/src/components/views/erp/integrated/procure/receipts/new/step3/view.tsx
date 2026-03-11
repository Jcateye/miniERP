'use client';

import * as React from 'react';
import { Upload, Check, HelpCircle, Image as ImageIcon, Tag, Plus } from 'lucide-react';

export default function GrnWorkflowStep3() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">入库单 GRN-2026-0143</h1>
                    <p className="text-muted mt-1 text-sm">采购流程 / 入库单 GRN-2026-0143 / 差异与证据</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-medium">
                        保存草稿
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="flex w-full mt-2">
                <div className="flex-1 bg-[#EAF3EB] text-[#549363] flex items-center gap-3 p-4 border border-r border-white">
                    <div className="w-6 h-6 bg-[#549363] text-white flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']"><Check className="w-4 h-4" /></div>
                    <div className="font-bold text-sm">基础信息</div>
                </div>
                <div className="flex-1 bg-[#EAF3EB] text-[#549363] flex items-center gap-3 p-4 border border-r border-white">
                    <div className="w-6 h-6 bg-[#549363] text-white flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']"><Check className="w-4 h-4" /></div>
                    <div className="font-bold text-sm">导入明细</div>
                </div>
                <div className="flex-1 bg-[#1a1a1a] text-white flex items-center gap-3 p-4">
                    <div className="w-6 h-6 bg-primary text-white flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']">3</div>
                    <div className="font-bold text-sm">差异与证据</div>
                </div>
                <div className="flex-1 bg-[#E8E4DC] text-muted flex items-center gap-3 p-4 border border-l-0 border-white">
                    <div className="w-6 h-6 border border-muted text-muted flex items-center justify-center text-sm font-bold font-['var(--font-space-grotesk)']">4</div>
                    <div className="font-bold text-sm">过账凭证</div>
                </div>
            </div>

            {/* Main Split */}
            <div className="flex gap-6 w-full items-start mt-4 h-[calc(100vh-280px)] min-h-[500px]">

                {/* Left Form / Table */}
                <div className="flex-1 bg-white border border-border flex flex-col h-full rounded-sm overflow-hidden min-w-[700px]">
                    <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-[#FDFCFB]">
                        <h2 className="font-bold text-lg font-['var(--font-space-grotesk)'] tracking-wide">STEP 3 — PO 对比差异</h2>
                        <button className="bg-primary hover:bg-opacity-90 text-primary-foreground h-9 px-4 text-sm font-medium transition-colors">
                            完成入库
                        </button>
                    </div>

                    <div className="grid grid-cols-[300px_100px_100px_1fr_100px_80px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                        <div>SKU</div>
                        <div className="text-right">PO 数量</div>
                        <div className="text-right">实收</div>
                        <div className="text-right">差异</div>
                        <div className="text-center">备注原因</div>
                        <div className="text-center">证据</div>
                    </div>

                    <div className="overflow-y-auto flex-1 text-sm bg-white">

                        {/* Row 1 - OK */}
                        <div className="grid grid-cols-[300px_100px_100px_1fr_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50">
                            <div>
                                <div className="font-medium font-['var(--font-space-grotesk)']">CAB-HDMI-2M</div>
                                <div className="text-xs text-muted max-w-[280px] truncate mt-1">HDMI 高清视频线 2米</div>
                            </div>
                            <div className="text-right font-['var(--font-space-grotesk)']">200</div>
                            <div className="text-right font-['var(--font-space-grotesk)'] text-[#549363] font-bold">200</div>
                            <div className="text-right font-['var(--font-space-grotesk)'] text-muted">0</div>
                            <div className="text-center text-muted">--</div>
                            <div className="text-center flex justify-center">
                                <button className="w-10 h-8 border border-border flex items-center justify-center hover:bg-gray-100"><ImageIcon className="w-4 h-4 text-muted" /></button>
                            </div>
                        </div>

                        {/* Row 2 - Shortage */}
                        <div className="grid grid-cols-[300px_100px_100px_1fr_100px_80px] px-6 py-4 border-b border-border items-center bg-[#FFF8F6]">
                            <div>
                                <div className="font-medium font-['var(--font-space-grotesk)'] text-primary">CON-RJ45-CAT6</div>
                                <div className="text-xs text-muted max-w-[280px] truncate mt-1">RJ45 水晶头 CAT6</div>
                            </div>
                            <div className="text-right font-['var(--font-space-grotesk)']">500</div>
                            <div className="text-right font-['var(--font-space-grotesk)'] text-primary font-bold">480</div>
                            <div className="text-right font-['var(--font-space-grotesk)'] font-bold text-primary">-20</div>
                            <div className="text-center flex justify-center text-xs">
                                <span className="bg-primary text-white px-2 py-1 flex items-center gap-1 cursor-pointer"><HelpCircle className="w-3 h-3" /> 漏发</span>
                            </div>
                            <div className="text-center flex items-center justify-center gap-2">
                                <span className="text-primary font-bold font-['var(--font-space-grotesk)'] bg-[#FFEFEA] px-1.5 py-0.5 border border-[#FFD9CD]">3</span>
                                <button className="w-8 h-8 border border-primary bg-primary text-white flex items-center justify-center hover:bg-opacity-90"><ImageIcon className="w-4 h-4" /></button>
                            </div>
                        </div>

                        {/* Row 3 - Shortage */}
                        <div className="grid grid-cols-[300px_100px_100px_1fr_100px_80px] px-6 py-4 border-b border-border items-center bg-[#FFF8F6]">
                            <div>
                                <div className="font-medium font-['var(--font-space-grotesk)'] text-primary">ADP-USBC-VGA</div>
                                <div className="text-xs text-muted max-w-[280px] truncate mt-1">USB-C 转 VGA 转换器</div>
                            </div>
                            <div className="text-right font-['var(--font-space-grotesk)']">80</div>
                            <div className="text-right font-['var(--font-space-grotesk)'] text-primary font-bold">78</div>
                            <div className="text-right font-['var(--font-space-grotesk)'] font-bold text-primary">-2</div>
                            <div className="text-center flex justify-center text-xs">
                                <span className="bg-primary text-white px-2 py-1 flex items-center gap-1 cursor-pointer"><HelpCircle className="w-3 h-3" /> 破损</span>
                            </div>
                            <div className="text-center flex items-center justify-center gap-2">
                                <span className="text-primary font-bold font-['var(--font-space-grotesk)'] bg-[#FFEFEA] px-1.5 py-0.5 border border-[#FFD9CD]">1</span>
                                <button className="w-8 h-8 border border-border bg-white text-muted flex items-center justify-center hover:bg-gray-50"><ImageIcon className="w-4 h-4" /></button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Info Box: Document Evidence */}
                <div className="w-[320px] bg-white border border-border flex flex-col h-full rounded-sm overflow-hidden">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-[#FDFCFB]">
                        <h2 className="font-bold flex items-center gap-2 tracking-wide"><ImageIcon className="w-4 h-4 text-primary" /> 单据/附件</h2>
                        <span className="text-primary text-sm font-medium cursor-pointer flex items-center gap-1"><Plus className="w-3 h-3" /> 加入</span>
                    </div>

                    <div className="p-4 flex flex-col gap-4 border-b border-border">
                        <div className="border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center py-8 px-4 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                            <Upload className="w-6 h-6 text-muted mb-2" />
                            <p className="text-sm font-medium text-muted">拖拽上传 / 点击浏览</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 bg-[#1a1a1a] text-white py-2 text-sm font-medium hover:bg-opacity-90 flex items-center justify-center gap-2"><ImageIcon className="w-4 h-4" /> 摄像头照片</button>
                            <button className="flex-1 border border-border bg-white py-2 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"><FileText className="w-4 h-4" /> 选择文件中...</button>
                        </div>
                        <div className="flex gap-1 flex-wrap mt-1">
                            <span className="bg-[#1a1a1a] text-white text-xs px-2 py-1 cursor-pointer">全部 4</span>
                            <span className="bg-white border text-muted border-border text-xs px-2 py-1 cursor-pointer">发票单据 1</span>
                            <span className="bg-white border text-primary border-primary text-xs px-2 py-1 cursor-pointer bg-[#FFF8F6]">破损/漏发 2</span>
                            <span className="bg-white border text-muted border-border text-xs px-2 py-1 cursor-pointer">条码/外包装 1</span>
                        </div>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        <div className="text-sm font-medium mb-3">多图预览</div>
                        <div className="grid grid-cols-2 gap-3">

                            <div className="flex flex-col gap-1">
                                <div className="bg-[#E8E4DC] aspect-[4/3] flex items-center justify-center relative border border-transparent hover:border-black cursor-pointer group">
                                    <FileText className="w-6 h-6 text-muted opacity-50" />
                                    <div className="absolute top-1 left-1 bg-white/80 px-1 py-[1px] text-[10px] text-muted leading-none">发票</div>
                                </div>
                                <div className="text-xs truncate text-muted mt-1" title="PO-2026-0089_IN.jpg">PO-2026-0089_IN.jpg</div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="bg-[#E8E4DC] aspect-[4/3] flex items-center justify-center relative border border-transparent hover:border-black cursor-pointer group">
                                    <Tag className="w-6 h-6 text-muted opacity-50" />
                                    <div className="absolute top-1 left-1 bg-white/80 px-1 py-[1px] text-[10px] text-muted leading-none">条码外箱</div>
                                </div>
                                <div className="text-xs truncate text-muted mt-1" title="外包装条码照片.jpg">外包装条码照片.jpg</div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="bg-[#FFEFEA] aspect-[4/3] flex items-center justify-center relative border-2 border-primary cursor-pointer">
                                    <HelpCircle className="w-8 h-8 text-primary opacity-50" />
                                    <div className="absolute top-1 left-1 bg-primary text-white px-1 py-[1px] text-[10px] leading-none">破损漏发</div>
                                </div>
                                <div className="text-xs truncate text-primary mt-1">破损货物照片-1.jpg</div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="bg-[#FFEFEA] aspect-[4/3] flex items-center justify-center relative border border-primary opacity-60 cursor-pointer hover:opacity-100">
                                    <HelpCircle className="w-8 h-8 text-primary opacity-50" />
                                    <div className="absolute top-1 left-1 bg-primary text-white px-1 py-[1px] text-[10px] leading-none">破损漏发</div>
                                </div>
                                <div className="text-xs truncate text-muted mt-1">破损货物照片-2.jpg</div>
                            </div>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

function FileText(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    )
}
