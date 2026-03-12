'use client';

import React from 'react';
import { Plus, Shield } from 'lucide-react';

export default function RolesPage() {
    const data = [
        {
            name: '系统管理员',
            desc: '拥有系统所有访问权限',
            perms: '全部',
            users: '2',
            status: '启用',
        }
    ];

    return (
        <div className="flex h-full flex-col gap-6 p-8 pb-20 sm:p-10 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">角色权限</h1>
                    <p className="mt-2 text-[13px] text-muted">Roles - 权限与安全分配</p>
                </div>
                <button className="bg-primary text-white h-10 px-5 flex items-center gap-2 text-sm font-bold hover:bg-opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" />
                    新增角色
                </button>
            </div>

            {/* Table Area */}
            <div className="mt-2 flex min-w-[860px] flex-1 flex-col overflow-hidden border border-border bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="h-10 border-b border-border bg-[#FDFCFB]">
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">角色名称</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider">描述</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-center">权限数</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-center">用户数</th>
                            <th className="px-6 text-xs font-bold text-muted uppercase tracking-wider text-right">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item, index) => (
                            <tr key={index} className="border-b border-border hover:bg-background/50 transition-colors group">
                                <td className="px-6 py-4 text-[15px] font-bold text-primary flex items-center gap-2 mt-4">
                                    <Shield className="w-4 h-4" />
                                    {item.name}
                                </td>
                                <td className="px-6 py-4 text-[14px] text-[#1a1a1a] font-medium">
                                    {item.desc}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-0.5 rounded-sm bg-[#EBF5FF] text-[#2D5BFF] font-bold text-[10px] uppercase">
                                        {item.perms}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-[15px] font-bold text-[#1a1a1a] font-mono">
                                    {item.users}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="px-2 py-0.5 rounded-full bg-[#F6FFF8] text-[#22C55E] text-[10px] font-bold uppercase tracking-tight">
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
