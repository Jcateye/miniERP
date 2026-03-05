interface StepperProps {
    steps: { label: string; description?: string }[];
    currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
        }}>
            {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;

                return (
                    <div
                        key={idx}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '14px 20px',
                            background: isActive ? '#1a1a1a' : '#E8E4DC',
                            borderTop: `3px solid ${isActive ? '#1a1a1a' : isCompleted ? '#2E7D32' : '#D1CCC4'}`,
                        }}
                    >
                        <div style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            background: isActive ? '#C05A3C' : isCompleted ? '#2E7D32' : '#D1CCC4',
                            color: '#FFFFFF',
                            flexShrink: 0,
                        }}>
                            {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div>
                            <div style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: isActive ? '#FFFFFF' : '#1a1a1a',
                            }}>
                                {step.label}
                            </div>
                            {step.description && (
                                <div style={{
                                    fontSize: 11,
                                    color: isActive ? 'rgba(255,255,255,0.6)' : '#888888',
                                    marginTop: 2,
                                }}>
                                    {step.description}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
