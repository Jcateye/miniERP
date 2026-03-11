'use client';

import * as React from 'react';
import { Search, Plus, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="p-8 pb-20 sm:p-10 font-[family-name:var(--font-geist-sans)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-start w-full">
        <div>
          <h1 className="text-2xl font-bold font-['var(--font-space-grotesk)']">工作台</h1>
          <p className="text-muted mt-1 text-sm">2026年3月10日 · 星期二</p>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="全文搜索 SKU / 订单 / 供应商..."
            className="w-full h-10 pl-10 pr-4 bg-white border border-border outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 w-full">
        <div className="bg-[#FFF8F6] border-t-2 border-[#C05A3C] p-5 flex flex-col gap-2 relative">
          <div className="text-muted text-sm">总库存 SKU</div>
          <div className="text-3xl font-bold font-['var(--font-space-grotesk)'] text-[#C05A3C]">14</div>
          <div className="text-[#C05A3C] text-xs">▲ 4条新增项</div>
        </div>

        <div className="bg-[#F6FFF8] border-t-2 border-[#549363] p-5 flex flex-col gap-2 relative">
          <div className="text-muted text-sm">低库存 SKU</div>
          <div className="text-3xl font-bold font-['var(--font-space-grotesk)'] text-[#549363]">3</div>
          <div className="text-[#549363] text-xs">● 紧急补货</div>
        </div>

        <div className="bg-[#F6FAFF] border-t-2 border-[#548093] p-5 flex flex-col gap-2 relative">
          <div className="text-muted text-sm">待出库 OUT</div>
          <div className="text-3xl font-bold font-['var(--font-space-grotesk)'] text-[#548093]">7</div>
          <div className="text-[#548093] text-xs">● 今日发货</div>
        </div>

        <div className="bg-[#E8E4DC] border-t-2 border-[#C05A3C] p-5 flex flex-col gap-2 relative">
          <div className="text-muted text-sm">待入库 IN</div>
          <div className="text-3xl font-bold font-['var(--font-space-grotesk)'] text-[#C05A3C]">2</div>
          <div className="text-muted text-xs">● 预计明日送达</div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex gap-6 w-full items-start">

        {/* Left: To-do list */}
        <div className="flex-1 bg-white border border-border  flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h2 className="font-bold">待办事宜</h2>
            <button className="bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-opacity-90 transition-opacity">
              去处理
            </button>
          </div>

          <div className="flex flex-col">
            {[
              { id: 1, title: '14个 SKU 待库存盘点', desc: '库存盘点 · 昨天 12:00', iconColor: 'bg-primary' },
              { id: 2, title: '5个待入库 GRN 增加跟进项', desc: '入库单 · 2026-02-28', iconColor: 'bg-[#548093]' },
              { id: 3, title: '7个待出库订单今日要发货', desc: '出库单 · 今日 08:30', iconColor: 'bg-[#549363]' },
            ].map(item => (
              <div key={item.id} className="p-4 border-b border-border flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-2 ${item.iconColor}`} />
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted mt-1">{item.desc}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick actions & Activity */}
        <div className="w-[340px] flex flex-col gap-6">

          {/* Quick Actions */}
          <div className="bg-sidebar p-5 flex flex-col gap-4">
            <h2 className="font-bold text-sidebar-foreground mb-1">快捷入口</h2>

            <button className="w-full bg-primary hover:bg-opacity-90 text-primary-foreground py-2.5 px-4 flex items-center gap-2 font-medium transition-colors">
              <Plus className="w-4 h-4" />
              新增 SKU
            </button>
            <button className="w-full bg-[#2b2b2b] hover:bg-[#3b3b3b] text-sidebar-foreground border border-sidebar-border py-2.5 px-4 flex items-center gap-2 font-medium transition-colors">
              <Plus className="w-4 h-4" />
              新增入库单 GRN
            </button>
            <button className="w-full bg-[#2b2b2b] hover:bg-[#3b3b3b] text-sidebar-foreground border border-sidebar-border py-2.5 px-4 flex items-center gap-2 font-medium transition-colors">
              <Plus className="w-4 h-4" />
              新增出库单 OUT
            </button>
            <button className="w-full bg-[#2b2b2b] hover:bg-[#3b3b3b] text-sidebar-foreground border border-sidebar-border py-2.5 px-4 flex items-center gap-2 font-medium transition-colors">
              <Search className="w-4 h-4" />
              库存盘点
            </button>
          </div>

          {/* Activity Log */}
          <div className="bg-white border border-border flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="font-bold text-sm">最近动态</h2>
              <span className="text-primary text-xs cursor-pointer hover:underline">查看全部</span>
            </div>

            <div className="flex flex-col">
              {[
                { title: '入库 GRN-2024-0512 完成', time: '10 分钟前' },
                { title: '出库 OUT-2026-0158 发货', time: '1 小时前' },
                { title: '新增 SKU: PWR-100W-USBC', time: '2 小时前' },
                { title: '盘点 ST-2026-0012 完成', time: '昨天 12:00' },
              ].map((activity, idx) => (
                <div key={idx} className="p-4 border-b border-border flex gap-3 items-start last:border-b-0">
                  <div className="w-1.5 h-1.5 bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{activity.title}</div>
                    <div className="text-xs text-muted mt-1">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
