import SettingsSecondaryNav from '@/components/layout/settings-secondary-nav';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100%',
      }}
    >
      <SettingsSecondaryNav />
      <section style={{ flex: 1, minWidth: 0 }}>{children}</section>
    </div>
  );
}
