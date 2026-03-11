'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';

export default function SettingsMaster() {
    return (
        <div className="flex h-full min-h-0 bg-background overflow-hidden relative">

            {/* Sidebar Navigation Config */}
            <div className="w-[220px] bg-white border-r border-border flex flex-col pt-6 font-['var(--font-space-grotesk)'] h-full shrink-0 relative overflow-y-auto">
                <div className="px-6 mb-4 font-bold text-sm tracking-wide">主数据配置</div>

                <div className="flex flex-col text-sm font-medium text-foreground">
                    <div className="px-6 py-3 border-l-2 border-primary bg-[#FFF8F6] text-primary cursor-pointer font-bold">
                        类目字典
                    </div>
                    <div className="px-6 py-3 border-l-2 border-transparent hover:bg-gray-50 text-muted hover:text-foreground cursor-pointer transition-colors">
                        规格体系
                    </div>
                    <div className="px-6 py-3 border-l-2 border-transparent hover:bg-gray-50 text-muted hover:text-foreground cursor-pointer transition-colors">
                        字段配置
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
                <div className="flex justify-between items-start w-full">
                    <div>
                        <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">类目管理</h1>
                        <p className="text-muted mt-1 text-sm">物料大类与类目的基础代码</p>
                    </div>

                    <div className="flex gap-2">
                        <button className="h-9 px-4 bg-[#1a1a1a] text-white flex items-center gap-2 hover:bg-opacity-90 font-medium text-sm">
                            <Plus className="w-4 h-4" /> 新增类目
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[500px]">
                    <div className="grid grid-cols-[120px_120px_1fr_120px_100px_80px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                        <div>类目编码</div>
                        <div>类目名称</div>
                        <div>系统说明</div>
                        <div className="text-center">SKU 数量</div>
                        <div className="text-center">状态</div>
                        <div className="text-center">操作</div>
                    </div>

                    <div className="flex flex-col text-sm bg-white overflow-y-auto">
                        <TableRow code="CAB" name="线材" desc="线缆类，包含视频线/数据线等" sku="457" status="启用" />
                        <TableRow code="CON" name="连接器" desc="接口、转换接头、水晶头等" sku="212" status="启用" />
                        <TableRow code="ADP" name="转换器" desc="扩展坞、转接线、信号转换等" sku="150" status="启用" />
                        <TableRow code="PWR" name="电源配件" desc="电源适配器、插排、充电头等" sku="80" status="启用" />
                    </div>
                </div>
            </div>

        </div>
    );
}

function TableRow({ code, name, desc, sku, status }: { code: string, name: string, desc: string, sku: string, status: string }) {
    return (
        <div className="grid grid-cols-[120px_120px_1fr_120px_100px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50">
            <div className="font-['var(--font-space-grotesk)'] font-medium">{code}</div>
            <div className="font-medium">{name}</div>
            <div className="text-muted text-xs truncate mr-4">{desc}</div>
            <div className="text-center font-['var(--font-space-grotesk)'] text-muted">{sku}</div>
            <div className="text-center">
                <span className="bg-[#EAF3EB] text-[#549363] px-2 py-0.5 text-xs font-medium">{status}</span>
            </div>
            <div className="text-center text-muted tracking-widest cursor-pointer hover:text-primary">...</div>
        </div>
    );
}
