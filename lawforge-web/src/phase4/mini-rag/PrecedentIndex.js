// src/phase4/mini-rag/PrecedentIndex.js
import { PRECEDENTS } from '../../data/precedents';

export class PrecedentIndex {
  static search(userQuery) {
    if (!userQuery) return [];
    
    const query = userQuery.toLowerCase();
    const scored = PRECEDENTS.map(p => {
      let score = 0;
      
      // Category match (+5)
      if (query.includes(p.category.toLowerCase())) score += 5;
      
      p.keywords.forEach(kw => {
        if (query.includes(kw.toLowerCase())) score += 2;
      });
      
      return { ...p, score };
    });
    
    // Return top 2 matching cases
    return scored.filter(p => p.score > 0).sort((a,b) => b.score - a.score).slice(0, 2);
  }
}
