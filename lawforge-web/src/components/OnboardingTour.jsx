// src/components/OnboardingTour.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { Globe, FileText, Cpu, Bot, Sparkles, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Select Sovereign Jurisdiction',
    icon: <Globe size={24} style={{ color: 'var(--secondary)' }} />,
    description: 'LAWFORGE AI spans 195+ jurisdictions. Choose your nation or region to lock legal reasoning into exact local statutes, criminal codes, and employment laws.',
    tip: 'Tip: You can use Cmd+K or Ctrl+K anytime to quickly jump between countries.'
  },
  {
    step: 2,
    title: 'Describe Your Factual Situation',
    icon: <FileText size={24} style={{ color: 'var(--primary)' }} />,
    description: 'Enter your case details, police encounters, employment disputes, or traffic stops. Use voice dictation or contract upload for quick extraction.',
    tip: 'Your text is sanitized and processed under zero-telemetry client-side privacy.'
  },
  {
    step: 3,
    title: 'Sovereign Pipeline Toggle',
    icon: <Cpu size={24} style={{ color: '#f59e0b' }} />,
    description: 'Switch between Cloud Live Sync (for live search and gazette grounding) and Sovereign Local Host (100% offline air-gapped on-device WebGPU reasoning).',
    tip: 'Offline mode works with zero internet connection via IndexedDB snapshots.'
  },
  {
    step: 4,
    title: 'Agent Mode & Multi-Persona Defense',
    icon: <Bot size={24} style={{ color: '#10b981' }} />,
    description: 'Enable Autonomous Agent mode to generate step-by-step action checklists, legal notice drafts, risk forecasting, and adversarial mock cross-examinations.',
    tip: 'Simulate debates against aggressive prosecutors or corporate counsel before real hearings.'
  },
  {
    step: 5,
    title: 'Official Dossier & Evidence Vault',
    icon: <Sparkles size={24} style={{ color: 'var(--primary)' }} />,
    description: 'Inspect your structured legal analysis, download official branded PDF reports, and timestamp evidentiary documents in the tamper-evident RFC-3161 vault.',
    tip: 'All reports include statutory citations, risk scores, and actionable defense strategies.'
  }
];

export function OnboardingTour({ isOpen, onClose }) {
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useStore();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen && hasCompletedOnboarding) return null;

  const currentStep = STEPS[currentStepIdx];
  const isLast = currentStepIdx === STEPS.length - 1;

  const handleFinish = () => {
    setHasCompletedOnboarding(true);
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5, 10, 24, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '1.5rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card"
          style={{
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
            borderRadius: '20px',
            border: '1px solid rgba(186, 158, 255, 0.25)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(186, 158, 255, 0.1)'
          }}
        >
          {/* Close button */}
          <button
            onClick={handleFinish}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'none',
              border: 'none',
              color: 'var(--on-surface-variant)',
              cursor: 'pointer',
              opacity: 0.6,
              transition: 'opacity 0.2s'
            }}
            title="Skip Tour"
            aria-label="Skip Tour"
          >
            <X size={18} />
          </button>

          {/* Step Icon & Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {currentStep.icon}
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Step {currentStep.step} of {STEPS.length}
              </span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--on-surface)' }}>
                {currentStep.title}
              </h2>
            </div>
          </div>

          {/* Description */}
          <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {currentStep.description}
          </p>

          {/* Tip Banner */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: 'rgba(186, 158, 255, 0.06)',
              border: '1px solid rgba(186, 158, 255, 0.15)',
              fontSize: '0.78rem',
              color: 'var(--on-surface)',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>💡</span>
            <span>{currentStep.tip}</span>
          </div>

          {/* Step Indicators & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Step Dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {STEPS.map((s, idx) => (
                <div
                  key={s.step}
                  onClick={() => setCurrentStepIdx(idx)}
                  style={{
                    width: idx === currentStepIdx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: idx === currentStepIdx ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {currentStepIdx > 0 && (
                <button
                  onClick={handleBack}
                  className="btn-glass"
                  style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="btn-primary"
                style={{ padding: '0.5rem 1.15rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {isLast ? (
                  <>Get Started <Check size={14} /></>
                ) : (
                  <>Next <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
