'use client';

import * as React from 'react';
import { Search, ChevronDown, Download, Upload, Plus, ChevronLeft, ChevronRight, Settings, ArrowRight } from 'lucide-react';

export default function SkuList() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-5 h-full">
            {/* Header */}
            <div className="flex justify-between items-center w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">SKU 管理</h1>
                    <p className="text-muted mt-1 text-sm">SKU 列表 / 管理及筛选</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="h-9 px-4 border border-border bg-white flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm font-medium">
                        <Upload className="w-4 h-4" /> 导入
                    </button>
                    <button className="h-9 px-4 border border-border bg-white flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-sm font-medium">
                        <Download className="w-4 h-4" /> 导出
                    </button>
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center gap-2 hover:bg-opacity-90 transition-colors text-sm font-medium">
                        <Plus className="w-4 h-4" /> 新增 SKU
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 w-full">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
                    <input
                        type="text"
                        placeholder="搜索 SKU 编码、名称、品牌型号、条码..."
                        className="w-full h-10 pl-10 pr-4 bg-white border border-border outline-none focus:border-primary transition-colors text-sm"
                    />
                </div>

                <div className="flex justify-between items-center w-full mt-2">
                    <div className="flex gap-2">
                        <DropdownBtn label="类目" />
                        <DropdownBtn label="状态" />
                        <DropdownBtn label="仓库" />
                        <DropdownBtn label="库存告急" />
                        <DropdownBtn label="供应商" />
                        <button className="text-primary text-sm font-medium ml-2 flex items-center">
                            清除筛选
                        </button>
                    </div>
                </div>
            </div>

            {/* Table & Quick View Area */}
            <div className="flex gap-6 mt-2 h-full min-h-0">

                {/* Table */}
                <div className="flex-1 bg-white border border-border flex flex-col h-full rounded-sm overflow-hidden min-w-[700px]">
                    {/* Table Toolbar */}
                    <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-[#FDFCFB]">
                        <div className="flex gap-2 items-center">
                            <span className="text-sm font-medium">共 1,247 个 SKU</span>
                            <div className="flex bg-[#E8E4DC] px-2 py-1 items-center gap-1 rounded-sm text-xs">
                                <span>类目: 线材</span>
                                <span className="cursor-pointer">×</span>
                            </div>
                        </div>

                        <button className="text-muted hover:text-foreground">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-[40px_160px_1fr_100px_120px_100px_100px_80px_40px] px-4 py-3 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                        <div><input type="checkbox" /></div>
                        <div>SKU 编码</div>
                        <div>名称 / 规格</div>
                        <div>类目</div>
                        <div>默认供应商</div>
                        <div>可用库存</div>
                        <div>告急阈值</div>
                        <div>状态</div>
                        <div></div>
                    </div>

                    {/* Table Body (Scrollable) */}
                    <div className="overflow-y-auto flex-1 text-sm">
                        <TableRow
                            code="CAB-HDMI-2M"
                            name="HDMI 高清视频线 2米"
                            desc="2.0 / 编织外被 / 镀金"
                            cat="线材"
                            supp="金源科技"
                            stock="342"
                            threshold="50"
                            status="正常"
                        />
                        <TableRow
                            code="CON-RJ45-CAT6"
                            name="RJ45 水晶头 CAT6"
                            desc="超六类 / 纯铜 / 50个一包"
                            cat="连接器"
                            supp="宏发制造"
                            stock="12"
                            threshold="100"
                            status="补货"
                            isWarning
                        />
                        <TableRow
                            code="ADP-USBC-VGA"
                            name="USB-C 转 VGA 转换器"
                            desc="1080P / 铝合金 / 15cm"
                            cat="转换器"
                            supp="鸿鹏电子"
                            stock="80"
                            threshold="30"
                            status="正常"
                            isActive
                        />
                        <TableRow
                            code="PWR-65W-PD"
                            name="65W PD 快充电源适配器"
                            desc="氮化镓 / 2C1A / 白色中规"
                            cat="电源"
                            supp="立讯精密"
                            stock="560"
                            threshold="30"
                            status="正常"
                        />
                        <TableRow
                            code="HUB-USB3-7P"
                            name="USB 3.0 七口集线器"
                            desc="带独立开关 / 12V电源 / 铝壳"
                            cat="扩展坞"
                            supp="未知供应"
                            stock="0"
                            threshold="-"
                            status="下架"
                            isDisabled
                        />
                    </div>

                    {/* Pagination */}
                    <div className="p-3 border-t border-border flex justify-between items-center">
                        <span className="text-sm text-muted">显示 1 到 5 / 共 1,247 条</span>
                        <div className="flex gap-1">
                            <button className="w-8 h-8 border border-border flex items-center justify-center bg-white hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
                            <button className="w-8 h-8 border border-[#1a1a1a] bg-[#1a1a1a] text-white flex items-center justify-center font-medium">1</button>
                            <button className="w-8 h-8 flex items-center justify-center text-muted">2</button>
                            <button className="w-8 h-8 flex items-center justify-center text-muted">3</button>
                            <button className="w-8 h-8 flex items-center justify-center text-muted">...</button>
                            <button className="w-8 h-8 flex items-center justify-center text-muted">50</button>
                            <button className="w-8 h-8 border border-border flex items-center justify-center bg-white hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                {/* Right Drawer / Quick view */}
                <div className="w-[320px] bg-white border border-border flex flex-col">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-[#FDFCFB]">
                        <h2 className="font-bold">快速预览</h2>
                        <span className="cursor-pointer text-muted hover:text-foreground">×</span>
                    </div>

                    <div className="p-5 flex flex-col gap-6 overflow-y-auto">

                        {/* Title Area */}
                        <div>
                            <h3 className="text-lg font-bold">ADP-USBC-VGA</h3>
                            <p className="text-sm mt-1 text-muted">USB-C 转 VGA 转换器</p>
                            <div className="mt-2 flex gap-2">
                                <span className="px-2 py-0.5 border border-border text-xs bg-[#FDFCFB]">转换器</span>
                            </div>
                        </div>

                        {/* Quick Actions Tags */}
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-gray-100 text-xs font-medium cursor-pointer">入库单</span>
                            <span className="px-3 py-1 bg-[#E8E4DC] border-b-2 border-primary text-xs font-medium cursor-pointer">最近动态</span>
                            <span className="px-3 py-1 bg-gray-100 text-xs font-medium cursor-pointer">出库单</span>
                        </div>

                        {/* Stats list */}
                        <div className="flex flex-col gap-3">
                            <div className="font-bold text-sm mb-1">可用库存</div>

                            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                                <span className="text-muted">主仓库</span>
                                <span className="font-medium">50</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                                <span className="text-muted">备用仓</span>
                                <span className="font-medium">30</span>
                            </div>
                            <div className="flex justify-between items-center py-2 text-sm bg-gray-50 px-2 font-bold">
                                <span>总计</span>
                                <span>80</span>
                            </div>
                        </div>

                        {/* Threshold & Supplier */}
                        <div className="flex flex-col gap-3 mt-2">
                            <div className="text-xs text-muted">供应商货号/条码</div>
                            <div className="text-sm">SZ-VGA-80A</div>

                            <div className="text-xs text-muted mt-2">快捷操作</div>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <button className="bg-[#1a1a1a] text-white py-2 text-sm font-medium">去补货</button>
                                <button className="border border-border bg-white py-2 text-sm hover:bg-gray-50 font-medium">去盘点</button>
                                <button className="border border-border bg-white py-2 text-sm hover:bg-gray-50 font-medium col-span-2">去详情页</button>
                            </div>
                        </div>

                        {/* Activity log */}
                        <div className="mt-4">
                            <div className="text-xs text-muted mb-3">最近动态(3项)</div>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#549363] rounded-sm mt-1" />
                                    <div className="text-xs">
                                        <div className="font-medium mb-0.5">入库 +20 (GRN-2026-0140)</div>
                                        <div className="text-muted">2026-02-27 16:30</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-sm mt-1" />
                                    <div className="text-xs">
                                        <div className="font-medium mb-0.5">出库 -5 (OUT-2026-0089)</div>
                                        <div className="text-muted">2026-02-25 10:15</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-1.5 h-1.5 bg-[#548093] rounded-sm mt-1" />
                                    <div className="text-xs">
                                        <div className="font-medium mb-0.5">盘点 +2 (ST-2026-0012)</div>
                                        <div className="text-muted">2026-01-15 09:00</div>
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

function DropdownBtn({ label }: { label: string }) {
    return (
        <button className="h-8 px-3 border border-border bg-white flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors text-sm">
            {label}
            <ChevronDown className="w-3.5 h-3.5 text-muted" />
        </button>
    );
}

function TableRow({
    code, name, desc, cat, supp, stock, threshold, status,
    isWarning = false, isActive = false, isDisabled = false
}: {
    code: string; name: string; desc: string; cat: string; supp: string; stock: string; threshold: string; status: string;
    isWarning?: boolean; isActive?: boolean; isDisabled?: boolean;
}) {
    return (
        <div className={`grid grid-cols-[40px_160px_1fr_100px_120px_100px_100px_80px_40px] px-4 py-3 border-b border-border items-center ${isActive ? 'bg-[#FFF8F6]' : 'hover:bg-gray-50'
            } ${isDisabled ? 'opacity-50' : ''}`}>
            <div><input type="checkbox" /></div>
            <div className={`font-medium ${isActive ? 'text-primary' : ''} ${isDisabled ? 'line-through text-muted' : ''}`}>{code}</div>
            <div>
                <div className="font-medium">{name}</div>
                <div className="text-xs text-muted max-w-[200px] truncate">{desc}</div>
            </div>
            <div>{cat}</div>
            <div>{supp}</div>
            <div className={`font-medium font-['var(--font-space-grotesk)'] ${isWarning ? 'text-primary' : ''}`}>{stock}</div>
            <div className="text-muted">{threshold}</div>
            <div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isWarning ? 'text-primary' : 'text-[#549363]'} ${isDisabled ? 'text-muted' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-sm ${isWarning ? 'bg-primary' : isDisabled ? 'bg-muted' : 'bg-[#549363]'}`} />
                    {status}
                </span>
            </div>
            <div className="text-center">
                <ArrowRight className="w-4 h-4 text-muted inline-block cursor-pointer hover:text-foreground" />
            </div>
        </div>
    );
}
