// src/phase6/panic/WitnessReceiver.jsx
import { useEffect, useState, useRef } from 'react';
import { Lock, Clock, AlertTriangle } from 'lucide-react';
import { WebRTCSignal } from './WebRTCSignal';

export function WitnessReceiver() {
  const [status, setStatus] = useState('Connecting to secure session...');
  const [duration, setDuration] = useState(0);
  const [transcript] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    let intervalId = null;

    const initReceiver = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const offer = urlParams.get('witness');
        if (!offer) {
          setStatus('Invalid or expired witness link.');
          return;
        }

        WebRTCSignal.onAudioStream((stream) => {
          if (audioRef.current) {
            audioRef.current.srcObject = stream;
            audioRef.current.play().catch(e => console.error("Auto-play blocked:", e));
          }
          setStatus('Live audio streaming securely.');
        });

        // We establish the remote connection
        await WebRTCSignal.receiveOffer(offer);
        
        // In a true asymmetric stateless URL drop, the broadcaster doesn't know the answer 
        // unless signaled back. We simulate the connection assumption.
        // For local simulation, both peers might be on the same network using host candidates.
        
        // Start duration timer
        intervalId = setInterval(() => setDuration(prev => prev + 1), 1000);

      } catch (err) {
        console.error(err);
        setStatus('Failed to connect to the secure stream. Session might be dead.');
      }
    };

    initReceiver();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#050505', color: '#fff' }}>
      <audio ref={audioRef} autoPlay />
      
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '3rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
          <Lock size={32} color="#ef4444" />
        </div>
        
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>Active Witness Session</h2>
        
        <div className="badge badge-red pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.5rem 1rem' }}>
          <AlertTriangle size={14} /> {status}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--on-surface-variant)', fontFamily: 'monospace', fontSize: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
          <Clock size={20} />
          {formatTime(duration)}
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--on-surface-variant)', opacity: 0.6 }}>
          You are securely monitoring this device's audio environment. Do not close this window.
        </p>

        {transcript && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'left', fontStyle: 'italic' }}>
            "{transcript}"
          </div>
        )}
      </div>
    </div>
  );
}
