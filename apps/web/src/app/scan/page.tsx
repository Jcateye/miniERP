'use client';

import { Camera, ArrowRightLeft } from 'lucide-react';

export default function ScanPage() {
    return (
        <div style={{
            maxWidth: 390,
            minHeight: '100vh',
            margin: '0 auto',
            background: '#F5F3EF',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'var(--font-body-family), sans-serif',
        }}>
            {/* Top bar */}
            <div style={{
                background: '#1a1a1a',
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 20px',
            }}>
                <span style={{
                    fontFamily: 'var(--font-display-family), sans-serif',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#F5F3EF',
                }}>
                    扫码
                </span>
            </div>

            {/* Camera area */}
            <div style={{
                background: '#222222',
                height: 320,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
            }}>
                <div style={{
                    width: 200,
                    height: 200,
                    border: '3px solid #C05A3C',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Camera size={40} color="rgba(255,255,255,0.3)" />
                </div>
                <span style={{ fontSize: 14, color: '#FFFFFF' }}>
                    将条码/二维码对准框内
                </span>
            </div>

            {/* Action buttons */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <button style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    height: 48, borderRadius: 8, border: 'none',
                    background: '#C05A3C', color: '#fff',
                    fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-display-family), sans-serif',
                }}>
                    <ArrowRightLeft size={16} /> 扫码入库
                </button>
                <button style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    height: 48, borderRadius: 8,
                    border: '1px solid #C05A3C', background: '#fff', color: '#C05A3C',
                    fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-display-family), sans-serif',
                }}>
                    <ArrowRightLeft size={16} /> 扫码出库
                </button>
            </div>

            {/* Recent scans */}
            <div style={{ padding: '20px 24px', flex: 1 }}>
                <h3 style={{
                    margin: '0 0 12px',
                    fontSize: 16, fontWeight: 700,
                    fontFamily: 'var(--font-display-family), sans-serif',
                }}>
                    最近扫描
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                        { code: 'CAB-HDMI-2M', name: 'HDMI 2m 高速线缆', qty: '+12', time: '10:30' },
                        { code: 'ADP-USBC-VGA', name: 'USB-C 转 VGA 适配器', qty: '-5', time: '10:28' },
                    ].map(item => (
                        <div key={item.code} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px', background: '#fff', borderRadius: 8,
                            border: '1px solid #E0DDD8',
                        }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.code}</div>
                                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.name}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: 14, fontWeight: 700,
                                    color: item.qty.startsWith('+') ? '#2E7D32' : '#D94F4F',
                                }}>
                                    {item.qty}
                                </div>
                                <div style={{ fontSize: 11, color: '#888' }}>{item.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
