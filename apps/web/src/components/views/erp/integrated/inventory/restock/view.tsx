'use client';

import React from 'react';
import { AlertTriangle, ShoppingCart } from 'lucide-react';

export default function RestockSuggestionsPage() {
    const data = [
        {
            skuId: 'SKU-LED-40A',
            name: 'LED-40A 显示模组',
            currentStock: '15',
            safeStock: '50',
            gap: '-35',
            suggestion: '100',
            leadTime: '7天',
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">补货建议</h1>
                    <p className="text-sm text-muted mt-1">Replenishment - 自动库存触发</p>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
                    <ShoppingCart className="w-4 h-4" />
                    生成采购单
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-border rounded-sm overflow-hidden mt-2 text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background border-b border-border">
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">物料编号</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">物料名称</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">当前库存</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">安全库存</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right text-red-500">缺口</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right text-green-600">建议补货量</th>
                            <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-right">前置</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={item.skuId} className="hover:bg-background/50 transition-colors group">
                                <td className="px-4 py-4 font-bold text-primary italic">
                                    {item.skuId}
                                </td>
                                <td className="px-4 py-4 text-foreground font-medium">
                                    {item.name}
                                </td>
                                <td className="px-4 py-4 text-right font-mono text-muted">
                                    {item.currentStock}
                                </td>
                                <td className="px-4 py-4 text-right font-mono text-muted">
                                    {item.safeStock}
                                </td>
                                <td className="px-4 py-4 text-right text-red-500 font-bold font-mono">
                                    {item.gap}
                                </td>
                                <td className="px-4 py-4 text-right text-green-600 font-bold font-mono">
                                    {item.suggestion}
                                </td>
                                <td className="px-4 py-4 text-right text-muted font-bold">
                                    {item.leadTime}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Warning Info */}
            <div className="bg-red-50 border border-red-100 p-4 rounded-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-red-600 mb-1 text-left">库存警告</h4>
                    <p className="text-xs text-red-500 leading-relaxed text-left">
                        当前共有 3 个物料低于安全库存水位，建议立即生成采购订单或从备选仓库调拨。
                    </p>
                </div>
            </div>
        </div>
    );
}
