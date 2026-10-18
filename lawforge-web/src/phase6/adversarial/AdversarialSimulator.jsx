// src/phase6/adversarial/AdversarialSimulator.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, RefreshCw, ShieldAlert, Scale, User, Briefcase, Gavel, Volume2, VolumeX } from 'lucide-react';
import { useAdversarialDebate } from './useAdversarialDebate';
import { VoiceProcessor } from '../../phase4/voice-agent/VoiceProcessor';
import { useTranslation } from 'react-i18next';

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -15 }
};

export function AdversarialSimulator() {
  const { isSimulating, messages, selectedPersona, persuasionScore, startDebate, submitUserSpeech, resetDebate } = useAdversarialDebate();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const voiceProcessor = useRef(null);
  const chatEndRef = useRef(null);
  const { i18n } = useTranslation();

  const speakText = useCallback((text) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/⚖️|🔨|🛡️/gu, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  }, [ttsEnabled]);

  // Defensive icon helper: prevents crash if an icon is missing in this version of lucide
  const IconRender = (Component, size = 16, color) => {
    if (typeof Component !== 'function' && typeof Component !== 'object') {
       return <span style={{ width: size, height: size, display: 'inline-block' }}>•</span>;
    }
    return <Component size={size} color={color} />;
  };

  // Scroll to bottom and optionally speak latest AI message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'ai') {
      speakText(lastMsg.text);
    }
  }, [messages, speakText]);

  const handleSend = () => {
    if (inputText.trim()) {
      submitUserSpeech(inputText);
      setInputText('');
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      voiceProcessor.current?.stop();
    } else {
      if (!voiceProcessor.current) {
        voiceProcessor.current = new VoiceProcessor(
          (final) => {
            if (final) setInputText(prev => (prev + ' ' + final).trim());
          },
          (err) => { console.error(err); setIsListening(false); },
          () => setIsListening(false)
        );
      }
      voiceProcessor.current.start(i18n.language || 'en');
      setIsListening(true);
    }
  };

  // Keyboard support for Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isSimulating) {
    return (
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 className="section-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          {IconRender(ShieldAlert, 18, "#ef4444")}
          Select Adversary Persona
        </h3>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Practice your defense. The AI will actively try to find loopholes in your argument to prepare you for the real deal.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { id: 'multi_agent_bench', icon: Gavel, label: 'Moot Court Bench', desc: 'Judge, Prosecutor & Co-Counsel panel' },
            { id: 'opposing_lawyer', icon: Scale, label: 'Opposing Counsel', desc: 'Aggressive legal scrutiny' },
            { id: 'police_officer', icon: User, label: 'Police Officer', desc: 'Hostile interrogation' },
            { id: 'landlord', icon: User, label: 'Angry Landlord', desc: 'Lease violation focus' },
            { id: 'employer', icon: Briefcase, label: 'Corporate HR', desc: 'Policy violation focus' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => startDebate(p.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                padding: '1.5rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{IconRender(p.icon, 24)}</div>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{p.label}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{p.desc}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Active Simulation View
  const scoreColor = persuasionScore > 70 ? '#22c55e' : persuasionScore > 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '600px', overflow: 'hidden' }}>
      
      {/* Header & Score */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ textTransform: 'capitalize' }}>{(selectedPersona || '').replace(/_/g, ' ')}</span> Simulator
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="btn-glass"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: ttsEnabled ? '#10b981' : 'var(--on-surface-variant)', borderColor: ttsEnabled ? 'rgba(16,185,129,0.3)' : '' }}
              title="Toggle Audio Voice Rebuttals"
            >
              {ttsEnabled ? <Volume2 size={13} color="#10b981" /> : <VolumeX size={13} />}
              <span>{ttsEnabled ? 'Voice: On' : 'Voice: Mute'}</span>
            </button>
            <button onClick={resetDebate} className="btn-glass" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              {IconRender(RefreshCw, 14)} Reset
            </button>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
            <span>Defense Strength</span>
            <span style={{ fontWeight: 700, color: scoreColor }}>{persuasionScore} / 100</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: `${persuasionScore}%` }}
              transition={{ duration: 0.5 }}
              style={{ height: '100%', background: scoreColor }}
            />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AnimatePresence>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div key={i} {...fadeUp} style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  borderBottomRightRadius: isUser ? '4px' : '16px',
                  borderBottomLeftRadius: !isUser ? '4px' : '16px',
                  background: isUser ? 'rgba(124, 58, 237, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                  border: isUser ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  lineHeight: 1.5
                }}>
                  {msg.text}
                </div>
                {!isUser && msg.score && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: '0.4rem', display: 'block', marginLeft: '0.5rem' }}>
                    AI Analysis Score: {msg.score}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)', display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={toggleVoice}
          className="btn-glass"
          style={{ 
            padding: '0.8rem', 
            borderRadius: '50%',
            background: isListening ? 'rgba(239,68,68,0.2)' : '',
            color: isListening ? '#ef4444' : 'inherit',
            border: isListening ? '1px solid #ef4444' : ''
          }}
        >
          {IconRender(Mic, 20, isListening ? '#ef4444' : 'inherit')}
        </button>
        <input 
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or speak your defense..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '0 1rem', color: '#fff' }}
        />
        <button onClick={handleSend} className="btn-primary" style={{ padding: '0.8rem', borderRadius: '50%' }}>
          {IconRender(Send, 18)}
        </button>
      </div>

    </div>
  );
}
