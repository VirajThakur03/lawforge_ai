// src/phase6/adversarial/useAdversarialDebate.js
import { useState, useCallback } from 'react';
import { AdversarialEngine } from './AdversarialEngine';
import { useStore } from '../../store';

export function useAdversarialDebate() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState('');
  const [persuasionScore, setPersuasionScore] = useState(100);
  
  // We grab context from the global store to feed into the adversary
  const { response, selectedCountry } = useStore();

  const startDebate = useCallback((persona) => {
    setSelectedPersona(persona);
    setMessages([]);
    setPersuasionScore(100);
    setIsSimulating(true);
    
    // Initial AI greeting
    setMessages([
      { role: 'ai', text: "State your defense.", score: 100 }
    ]);
  }, []);

  const submitUserSpeech = useCallback(async (text) => {
    if (!text.trim() || !selectedPersona) return;

    // 1. Add User string
    setMessages(prev => [...prev, { role: 'user', text }]);
    
    // 2. Fetch AI rebuttal
    const country = selectedCountry?.name || response?.country || "Unknown Location";
    const rebuttalText = await AdversarialEngine.challenge(text, selectedPersona, country, response);
    
    // 3. Calculate Score
    const newScore = AdversarialEngine.calculatePersuasionScore(rebuttalText);
    
    // 4. Update
    setPersuasionScore(newScore);
    setMessages(prev => [...prev, { role: 'ai', text: rebuttalText, score: newScore }]);

  }, [selectedPersona, response, selectedCountry]);

  const resetDebate = useCallback(() => {
    setIsSimulating(false);
    setMessages([]);
    setSelectedPersona('');
    setPersuasionScore(100);
  }, []);

  return {
    isSimulating,
    messages,
    selectedPersona,
    persuasionScore,
    startDebate,
    submitUserSpeech,
    resetDebate
  };
}
