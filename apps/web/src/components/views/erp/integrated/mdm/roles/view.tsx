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
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">角色权限</h1>
                    <p className="text-sm text-muted mt-1">Roles - 权限与安全分配</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    新增角色
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">角色名称</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">描述</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-center">权限数</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-center">用户数</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">状态</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item, index) => (
                            <tr key={index} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 font-bold text-red-500 flex items-center gap-2 mt-4">
                                    <Shield className="w-4 h-4" />
                                    {item.name}
                                </td>
                                <td className="px-4 py-4 text-foreground font-medium">
                                    {item.desc}
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className="px-2 py-0.5 rounded-sm bg-blue-50 text-blue-600 font-bold text-[10px] uppercase">
                                        {item.perms}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center font-bold text-foreground font-mono">
                                    {item.users}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-tight">
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
