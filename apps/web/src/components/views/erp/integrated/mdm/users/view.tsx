'use client';

import * as React from 'react';

export default function UserList() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full overflow-y-auto w-full relative">
            <div className="flex justify-between items-start w-full">
                <div>
                    <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">用户管理</h1>
                    <p className="text-muted mt-1 text-sm">账户 · 权限分配</p>
                </div>

                <div className="flex gap-2">
                    <button className="h-9 px-4 bg-primary text-primary-foreground flex items-center justify-center hover:bg-opacity-90 transition-colors text-sm font-bold shadow-sm">
                        新增用户
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white border border-border flex flex-col rounded-sm overflow-hidden min-w-[800px] shadow-sm mt-4">
                <div className="grid grid-cols-[160px_120px_120px_160px_160px_80px] px-6 py-4 border-b border-border text-sm font-medium text-muted bg-[#FDFCFB]">
                    <div>用户名</div>
                    <div>姓名</div>
                    <div>角色</div>
                    <div>部门</div>
                    <div>最后登录</div>
                    <div className="text-center">状态</div>
                </div>

                <div className="flex flex-col text-sm bg-white overflow-y-auto">
                    <div className="grid grid-cols-[160px_120px_120px_160px_160px_80px] px-6 py-4 border-b border-border items-center hover:bg-gray-50 transition-colors">
                        <div className="font-['var(--font-space-grotesk)'] font-medium text-primary cursor-pointer hover:underline">zhangsan</div>
                        <div className="font-medium truncate pr-4">张三</div>
                        <div className="font-medium text-muted">管理员</div>
                        <div className="text-muted font-medium">IT部</div>
                        <div className="font-['var(--font-space-grotesk)'] text-[#549363] text-sm">2 分钟前</div>
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
