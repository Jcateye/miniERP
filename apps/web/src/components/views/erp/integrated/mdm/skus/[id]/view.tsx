'use client';

import * as React from 'react';
import { ArrowLeft, Edit, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SkuDetail() {
    const params = useParams();
    const id = params.id as string || 'CAB-HDMI-2M';

    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start w-full">
                <div className="flex gap-4 items-start">
                    <Link href="/mdm/skus" className="w-8 h-8 flex items-center justify-center border border-border bg-white hover:bg-gray-50 transition-colors mt-0.5">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-[28px] font-bold font-['var(--font-space-grotesk)'] leading-none">{id}</h1>
                            <div className="bg-[#EAF3EB] text-[#549363] px-2 py-0.5 text-xs font-medium flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-[#549363] rounded-sm" />正常
                            </div>
                        </div>
                        <p className="text-muted mt-1 text-sm">HDMI 高清视频线 2米 / 编织外被 / 镀金</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="h-10 px-5 bg-[#1a1a1a] text-white flex items-center gap-2 hover:bg-opacity-90 font-medium text-sm">
                        <Edit className="w-4 h-4" /> 编辑
                    </button>
                    <button className="h-10 px-5 border border-border bg-white flex items-center gap-2 hover:bg-gray-50 font-medium text-sm">
                        <Clock className="w-4 h-4" /> 查看历史
                    </button>
                    <button className="h-10 px-5 border border-border bg-white flex items-center gap-2 hover:bg-gray-50 font-medium text-sm text-primary">
                        导出
                    </button>
                </div>
            </div>

            {/* Top 3 Cards Area */}
            <div className="grid grid-cols-[1fr_1fr_300px] gap-6 w-full">
                {/* Basic Info */}
                <div className="bg-white border border-border flex flex-col p-5 h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold">基本信息</h2>
                    </div>

                    <div className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 text-sm whitespace-nowrap">
                        <div className="text-muted">类目</div>
                        <div className="font-medium text-right">线材</div>

                        <div className="text-muted">状态</div>
                        <div className="font-medium text-right">正常</div>

                        <div className="text-muted">默认供应商</div>
                        <div className="font-medium text-right text-primary cursor-pointer hover:underline">金源科技</div>

                        <div className="text-muted">告急阈值</div>
                        <div className="font-medium text-right font-['var(--font-space-grotesk)']">50.00</div>

                        <div className="text-muted">创建时间</div>
                        <div className="font-medium text-right">2026-01-16</div>

                        <div className="text-muted">备注</div>
                        <div className="font-medium text-right border-b border-border border-dashed pb-0.5 max-w-[180px] justify-self-end truncate">
                            编织材质耐拉伸
                        </div>
                    </div>
                </div>

                {/* Package Info */}
                <div className="bg-white border border-border flex flex-col p-5 h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold">包装参数</h2>
                        <div className="text-muted text-xs flex items-center gap-1 cursor-pointer">
                            <Edit className="w-3 h-3" /> 修改参数
                        </div>
                    </div>

                    <div className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 text-sm whitespace-nowrap">
                        <div className="text-muted">包装标准</div>
                        <div className="font-medium text-right">HDMI 2.0</div>

                        <div className="text-muted">颜色</div>
                        <div className="font-medium text-right">黑色</div>

                        <div className="text-muted">产地</div>
                        <div className="font-medium text-right">深圳宝安</div>

                        <div className="text-muted">重量</div>
                        <div className="font-medium text-right font-['var(--font-space-grotesk)']">2.4 kg</div>

                        <div className="text-muted">支持协议</div>
                        <div className="font-medium text-right font-['var(--font-space-grotesk)']">4K@60Hz</div>
                    </div>
                </div>

                {/* Black Stock Card */}
                <div className="bg-[#1a1a1a] text-white flex flex-col p-6 h-full justify-between">
                    <div>
                        <div className="text-sm text-gray-400 font-medium mb-1">可用库存</div>
                        <div className="text-[42px] font-bold font-['var(--font-space-grotesk)'] leading-tight">342</div>
                    </div>

                    <div className="flex flex-col gap-3 mt-6">
                        <div className="text-xs text-gray-400">各仓库明细</div>
                        <div className="flex justify-between items-center text-sm border-b border-[#333] pb-2">
                            <span className="text-gray-300">主仓库</span>
                            <span className="font-medium font-['var(--font-space-grotesk)']">245</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-[#333] pb-2">
                            <span className="text-gray-300">备用仓</span>
                            <span className="font-medium font-['var(--font-space-grotesk)']">97</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-300">报废仓</span>
                            <span className="font-medium text-primary font-['var(--font-space-grotesk)']">00</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button className="bg-white text-[#1a1a1a] py-2.5 font-bold hover:bg-gray-100 flex items-center justify-center gap-2 text-sm transition-colors">
                            入库
                        </button>
                        <button className="border border-[#444] text-white py-2.5 font-bold hover:bg-[#2b2b2b] flex items-center justify-center gap-2 text-sm transition-colors">
                            出库
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs and Content Section */}
            <div className="bg-white border border-border flex flex-col flex-1 min-h-[400px]">

                {/* Tabs Header */}
                <div className="flex border-b border-border px-2">
                    <TabItem label="外部附件" active />
                    <TabItem label="流转流水" />
                    <TabItem label="关联单据" />
                    <TabItem label="附件" />
                    <TabItem label="操作日志" />
                </div>

                {/* Table inside Tab */}
                <div className="flex-1 flex flex-col">
                    {/* Table Header */}
                    <div className="grid grid-cols-[140px_200px_200px_1fr_100px] px-6 py-3 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                        <div>支持条码</div>
                        <div>条码样式 / 名称</div>
                        <div>关联编码</div>
                        <div>支持类型</div>
                        <div>操作</div>
                    </div>

                    {/* Table Rows */}
                    <div className="flex flex-col">
                        <BarcodeRow code="289*68" name="深圳宝安区标贴" related="SZ-HDMI-2M-BOX" type="箱号" active />
                        <BarcodeRow code="9903" name="广州极客电商" related="GZ-PD-SK-2M" type="--" />
                    </div>
                </div>

            </div>
        </div>
    );
}

function TabItem({ label, active = false }: { label: string, active?: boolean }) {
    return (
        <div className={`px-6 py-4 cursor-pointer text-sm font-medium border-b-[3px] transition-colors ${active ? 'border-primary text-foreground' : 'border-transparent text-muted hover:text-foreground'
            }`}>
            {label}
        </div>
    );
}

function BarcodeRow({ code, name, related, type, active = false }: { code: string, name: string, related: string, type: string, active?: boolean }) {
    return (
        <div className={`grid grid-cols-[140px_200px_200px_1fr_100px] px-6 py-4 border-b border-border items-center text-sm ${active ? 'bg-[#FFF8F6]' : 'hover:bg-gray-50'}`}>
            <div><span className="bg-[#E8E4DC] px-2 py-0.5 font-['var(--font-space-grotesk)'] text-xs">{code}</span></div>
            <div className="font-medium">{name}</div>
            <div className="font-['var(--font-space-grotesk)']">{related}</div>
            <div>{type === '--' ? <span className="text-muted">--</span> : <span className="bg-[#EAF3EB] text-[#549363] px-2 py-0.5 text-xs font-medium">{type}</span>}</div>
            <div className="text-muted hover:text-foreground cursor-pointer tracking-wider text-xl leading-none">...</div>
        </div>
    );
}
