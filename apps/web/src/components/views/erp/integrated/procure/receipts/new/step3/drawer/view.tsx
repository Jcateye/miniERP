'use client';

import * as React from 'react';
import { Upload, HelpCircle, Image as ImageIcon, Tag, X } from 'lucide-react';

export default function EvidenceDrawerPage() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-hidden relative">
            {/* Header */}
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">入库单 GRN-2026-0143 / Step 3</h1>
                    <p className="text-muted mt-1 text-sm">采购流程 / 差异证据 (行级展开)</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 border border-border bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-sm font-medium">
                        保存草稿
                    </button>
                </div>
            </div>

            {/* Main Split */}
            <div className="flex gap-6 w-full items-start mt-4 h-full relative">

                {/* Left Form / Table (Faded out or background) */}
                <div className="flex-1 bg-white border border-border flex flex-col h-full rounded-sm overflow-hidden min-w-[600px] opacity-40 mix-blend-luminosity">
                    <div className="px-6 py-5 border-b border-border bg-[#FDFCFB]">
                        <h2 className="font-bold text-lg font-['var(--font-space-grotesk)'] tracking-wide">STEP 3 — PO 对比差异</h2>
                    </div>
                    <div className="flex-1 bg-gray-50 pt-32 text-center text-muted">
                        背景列表内容...
                    </div>
                </div>

                {/* Right Info Box: The Drawer over the normal right panel */}
                <div className="w-[360px] bg-white border border-border flex flex-col h-full rounded-sm overflow-hidden shadow-2xl relative z-10 animate-in slide-in-from-right duration-300">

                    {/* Drawer Header */}
                    <div className="bg-[#1a1a1a] text-white p-4 flex justify-between items-center">
                        <h2 className="font-bold flex items-center gap-2 text-sm"><ImageIcon className="w-4 h-4 text-primary" /> 行级证据</h2>
                        <button className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>

                    {/* Drawer Content */}
                    <div className="p-5 flex flex-col gap-4 overflow-y-auto">

                        {/* SKU Title */}
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold font-['var(--font-space-grotesk)']">ADP-USBC-VGA</h3>
                                <span className="bg-primary text-white text-xs px-2 py-0.5 font-medium">破损 -2</span>
                            </div>
                            <p className="text-sm mt-1 text-muted">USB-C 转 VGA 转换器 / 铝合金 / 黑色</p>
                        </div>

                        {/* Numbers */}
                        <div className="grid grid-cols-3 gap-2 mt-2 border-b border-border pb-4 font-['var(--font-space-grotesk)']">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted">PO 数量</span>
                                <span className="font-bold text-lg text-foreground">50</span>
                            </div>
                            <div className="flex flex-col border-l border-border pl-4">
                                <span className="text-xs text-muted">实收</span>
                                <span className="font-bold text-lg text-[#549363]">48</span>
                            </div>
                            <div className="flex flex-col border-l border-border pl-4">
                                <span className="text-xs text-muted">破损</span>
                                <span className="font-bold text-lg text-primary">2</span>
                            </div>
                        </div>

                        {/* Attachments Section */}
                        <div className="mt-2">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm font-bold flex gap-2">
                                    <span className="border-b-[3px] border-primary pb-1">本行附件 <span className="text-muted text-xs">(3 张)</span></span>
                                    <span className="text-muted pb-1 cursor-pointer hover:text-foreground">全部附件</span>
                                </div>
                                <button className="bg-[#1a1a1a] text-white text-xs px-3 py-1.5 font-medium hover:bg-opacity-90 flex items-center gap-1">
                                    <Upload className="w-3 h-3" /> 添加文件
                                </button>
                            </div>

                            {/* Attachment Cards */}
                            <div className="flex flex-col gap-3">

                                {/* Error Card 1 */}
                                <div className="border border-primary bg-[#FFF8F6] p-3 flex gap-3 relative hover:border-[#1a1a1a] cursor-pointer transition-colors">
                                    <div className="w-16 h-16 bg-[#FFEFEA] flex items-center justify-center shrink-0">
                                        <HelpCircle className="w-6 h-6 text-primary opacity-60" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="bg-primary text-white text-[10px] w-fit px-1 mb-1">破损</span>
                                        <div className="text-sm font-medium leading-snug">VGA转接头_破损正面.jpg</div>
                                        <div className="text-xs text-muted mt-1 truncate">由 [陈仓管] 扫描上传 · 16 KB</div>
                                    </div>
                                </div>

                                {/* Error Card 2 */}
                                <div className="border border-primary bg-[#FFF8F6] p-3 flex gap-3 relative hover:border-[#1a1a1a] cursor-pointer transition-colors">
                                    <div className="w-16 h-16 bg-[#FFEFEA] flex items-center justify-center shrink-0">
                                        <HelpCircle className="w-6 h-6 text-primary opacity-60" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="bg-primary text-white text-[10px] w-fit px-1 mb-1">破损</span>
                                        <div className="text-sm font-medium leading-snug">VGA转接头_破损侧面.jpg</div>
                                        <div className="text-xs text-muted mt-1 truncate">由 [陈仓管] 接收入库时拍照 · 12 KB</div>
                                    </div>
                                </div>

                                {/* Normal Card */}
                                <div className="border border-border bg-white p-3 flex gap-3 hover:border-black cursor-pointer transition-colors">
                                    <div className="w-16 h-16 bg-[#E8E4DC] flex items-center justify-center shrink-0">
                                        <Tag className="w-5 h-5 text-muted" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="bg-gray-100 text-muted border border-border text-[10px] w-fit px-1 mb-1">条码标签</span>
                                        <div className="text-sm font-medium leading-snug">ADP-USBC-VGA_外箱条码.jpg</div>
                                        <div className="text-xs text-muted mt-1 truncate">PO单收货扫描登记记录</div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
