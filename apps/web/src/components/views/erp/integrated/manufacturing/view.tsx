export default function PlaceholderPage() {
    return (
        <div className="p-8 pb-20 sm:p-10 flex flex-col gap-6 h-full items-center justify-center">
            <div className="text-center flex flex-col items-center gap-4">
                <h1 className="text-4xl font-bold font-['var(--font-space-grotesk)'] text-muted">Construction</h1>
                <p className="text-muted">此模块尚未在当前设计稿范围内，研发建设中...</p>
            </div>
        </div>
    );
}
