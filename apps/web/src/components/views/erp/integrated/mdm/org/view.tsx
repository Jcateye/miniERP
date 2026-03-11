'use client';

import * as React from 'react';

export default function OrgList() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">组织管理</h1>
                    <p className="text-muted mt-1 text-sm">公司 · 组织单元</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新增组织
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-4">
                <div className="grid grid-cols-[160px_200px_100px_160px_80px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                    <div>编号</div>
                    <div>名称</div>
                    <div>类型</div>
                    <div>上级组织</div>
                    <div className="text-center">状态</div>
                </div>

                <div className="flex flex-col text-sm bg-white overflow-y-auto">
                    <div className="grid grid-cols-[160px_200px_100px_160px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
                        <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">ORG-001</div>
                        <div className="font-medium truncate pr-4">深圳极云有限公司</div>
                        <div className="font-medium text-muted">公司</div>
                        <div className="text-muted">--</div>
                        <div className="text-center">
                            <span className="bg-[#EAF3EB] text-[#549363] px-2 py-0.5 text-xs font-medium border-transparent border">
                                启用
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
