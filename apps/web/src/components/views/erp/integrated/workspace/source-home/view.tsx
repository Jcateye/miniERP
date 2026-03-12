'use client';

import * as React from 'react';
import { Search, Plus, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="p-8 pb-20 sm:p-10 font-[family-name:var(--font-geist-sans)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="font-['var(--font-space-grotesk)'] text-[28px] font-bold leading-none">工作台</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">2026年2月28日 · 周五 · 下午</p>
        </div>

        <div className="flex-1 flex justify-end">
          <div className="relative w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 w-4 h-4" />
            <input
              type="text"
              placeholder="全局搜索 SKU / 单号 / 供应商..."
              className="w-full h-11 pl-10 pr-4 bg-white border border-[#D1CCC4] rounded-sm outline-none focus:border-[#C05A3C] transition-all text-[14px] shadow-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-0 border border-[#C05A3C] w-full overflow-hidden">
        <div className="bg-[#FFF5F5] border-r border-[#C05A3C] p-6 h-[200px] flex flex-col justify-between relative group hover:bg-[#FFF0F0] transition-colors">
          <div className="border-l-[2px] border-[#E5484D] pl-3">
            <div className="text-muted text-[13px] font-medium uppercase tracking-wider">低库存 SKU</div>
          </div>
          <div className="text-[56px] font-bold font-['var(--font-space-grotesk)'] text-[#E5484D] leading-none mb-2">14</div>
          <div className="text-[#E5484D] text-[12px] font-bold uppercase tracking-tight opacity-70">需及时补货</div>
        </div>

        <div className="bg-[#F6FFF8] border-r border-[#C05A3C] p-6 h-[200px] flex flex-col justify-between relative group hover:bg-[#F0FFF4] transition-colors">
          <div className="border-l-[2px] border-[#22C55E] pl-3">
            <div className="text-muted text-[13px] font-medium uppercase tracking-wider">待入库 GRN</div>
          </div>
          <div className="text-[56px] font-bold font-['var(--font-space-grotesk)'] text-[#22C55E] leading-none mb-2">3</div>
          <div className="text-[#22C55E] text-[12px] font-bold uppercase tracking-tight opacity-70">草稿待过账</div>
        </div>

        <div className="bg-[#F0F9FF] border-r border-[#C05A3C] p-6 h-[200px] flex flex-col justify-between relative group hover:bg-[#E6F4FF] transition-colors">
          <div className="border-l-[2px] border-[#2D5BFF] pl-3">
            <div className="text-muted text-[13px] font-medium uppercase tracking-wider">待出库 OUT</div>
          </div>
          <div className="text-[56px] font-bold font-['var(--font-space-grotesk)'] text-[#2D5BFF] leading-none mb-2">7</div>
          <div className="text-[#2D5BFF] text-[12px] font-bold uppercase tracking-tight opacity-70">今日待发货</div>
        </div>

        <div className="bg-[#F5F3EF] p-6 h-[200px] flex flex-col justify-between relative group hover:bg-[#F0EEEA] transition-colors">
          <div className="border-l-[2px] border-[#706B5E] pl-3">
            <div className="text-muted text-[13px] font-medium uppercase tracking-wider">延迟 PO</div>
          </div>
          <div className="text-[56px] font-bold font-['var(--font-space-grotesk)'] text-[#C05A3C] leading-none mb-2">2</div>
          <div className="text-[#C05A3C] text-[12px] font-bold uppercase tracking-tight opacity-70">超过预计到货日</div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex gap-6 w-full items-start">

        {/* Left: To-do list */}
        <div className="flex-1 bg-white border border-border flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-border">
            <h2 className="font-bold text-[15px] uppercase tracking-wider">全局待办</h2>
          </div>

          <div className="flex flex-col">
            {[
              { id: 1, title: 'SKU 主数据核对', desc: '检查当前物料台账与关键字段完整性', time: '今天 09:12 · 主数据' },
              { id: 2, title: '报表中心待查看', desc: '确认经营分析首页与报表详情入口状态', time: '今天 09:47 · 报表' },
              { id: 3, title: '工作台信息待整理', desc: '回到首页补充当日协作摘要与操作入口', time: '今天 10:05 · 工作台' },
            ].map(item => (
              <div key={item.id} className="p-6 border-b border-border group hover:bg-[#FFF8F6] transition-colors cursor-pointer">
                <div>
                  <div className="text-[15px] font-bold text-[#C05A3C] mb-1">{item.title}</div>
                  <div className="text-[14px] text-[#1a1a1a] font-medium">{item.desc}</div>
                  <div className="text-[12px] text-muted mt-2">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick actions & Activity */}
        <div className="w-[340px] flex flex-col gap-6">

          {/* Quick Actions */}
          <div className="bg-[#1a1a1a] text-white p-6 flex flex-col">
            <h2 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-6">快捷入口</h2>

            <div className="flex flex-col">
              <button className="w-full h-14 border-t border-white/5 flex items-center justify-between text-[14px] font-medium hover:bg-white/5 transition-colors px-1 group">
                <span>工作台首页</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
              </button>
              <button className="w-full h-14 border-t border-white/5 flex items-center justify-between text-[14px] font-medium hover:bg-white/5 transition-colors px-1 group">
                <span>SKU 管理</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
              </button>
              <button className="w-full h-14 border-t border-b border-white/5 flex items-center justify-between text-[14px] font-medium hover:bg-white/5 transition-colors px-1 group">
                <span>报表中心</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
              </button>
            </div>
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
