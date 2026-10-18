// src/components/LawOfTheDay.jsx
import React, { useState } from 'react';
import { Scale, Sparkles, ChevronRight, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUTE_HIGHLIGHTS = {
  IN: [
    {
      title: "Bharatiya Nagarik Suraksha Sanhita 2023 (BNSS)",
      section: "Section 35 & Section 47",
      enactmentYear: "2024–2026 Active",
      summary: "Mandatory notice of appearance prior to arrest for offenses punishable by less than 7 years; statutory right to inform a relative/advocate immediately upon arrest.",
      scenarioPrompt: "Police summoned me for questioning regarding a neighbor dispute. What are my rights under BNSS Section 35 regarding notice and arrest?"
    },
    {
      title: "Digital Personal Data Protection Act 2023 (DPDP)",
      section: "Section 33 & Schedule",
      enactmentYear: "2024–2026 Enacted",
      summary: "Statutory fines up to ₹250 Crore for failure to take reasonable security safeguards to prevent personal data breaches.",
      scenarioPrompt: "A company leaked my financial and phone records online. What are the penalties and compensation under DPDP Act 2023?"
    },
    {
      title: "Bharatiya Sakshya Adhiniyam 2023 (BSA)",
      section: "Section 61",
      enactmentYear: "2024–2026 Active",
      summary: "Electronic and digital records have equal legal status as paper documents without mandatory physical certificates if generated through normal device operation.",
      scenarioPrompt: "How can I submit WhatsApp chats and call audio recordings as valid evidence in court under BSA 2023?"
    }
  ],
  US: [
    {
      title: "Federal Trade Commission Regulations",
      section: "16 CFR Part 910",
      enactmentYear: "2024–2026 Active",
      summary: "Comprehensive federal prohibition on non-compete clauses in employment contracts, empowering worker mobility and cross-employment.",
      scenarioPrompt: "My former employer is threatening to sue me over a 1-year non-compete clause in my contract. Is this enforceable?"
    },
    {
      title: "California Consumer Privacy Act (CCPA/CPRA)",
      section: "Cal. Civ. Code § 1798.100",
      enactmentYear: "2025–2026 Active",
      summary: "Right to opt out of automated decision-making and cross-context behavioral profiling, with statutory per-violation damages.",
      scenarioPrompt: "An app refuses to delete my biometric data and browsing profile despite my deletion request under CCPA."
    }
  ],
  GB: [
    {
      title: "Worker Protection (Equality Act 2010) Act",
      section: "Section 40A",
      enactmentYear: "2024–2026 Enacted",
      summary: "Imposes a mandatory positive duty on employers to take reasonable steps to prevent sexual harassment of employees, with 25% compensation uplifts.",
      scenarioPrompt: "My workplace ignored repeated harassment complaints about a contractor. What is the employer's statutory duty in the UK?"
    },
    {
      title: "Online Safety Act 2023",
      section: "Section 10 & 11",
      enactmentYear: "2024–2026 Active",
      summary: "Statutory duties of care for internet providers and platforms to eliminate illegal content and protect vulnerable users from cyber harassment.",
      scenarioPrompt: "A web forum refuses to remove defamatory and harassing personal information posted anonymously."
    }
  ],
  DE: [
    {
      title: "EU Artificial Intelligence Act",
      section: "Regulation (EU) 2024/1689",
      enactmentYear: "2024–2026 Enforcement",
      summary: "Strict prohibition on manipulative AI and biometric categorization; transparency obligations for AI-generated synthetic media.",
      scenarioPrompt: "A company deployed an AI tool that unilaterally rejected my loan application without explaining the criteria under the EU AI Act."
    }
  ],
  SG: [
    {
      title: "Personal Data Protection Act (PDPA)",
      section: "Section 48J",
      enactmentYear: "2024–2026 Active",
      summary: "Maximum financial penalties up to 10% of annual turnover in Singapore for organizations with turnover exceeding S$10 million.",
      scenarioPrompt: "An organization in Singapore suffered a customer data leak due to misconfigured cloud storage. What are the PDPA penalties?"
    }
  ],
  AE: [
    {
      title: "Federal Decree-Law No. 34 on Cybercrimes",
      section: "Article 24 & Article 43",
      enactmentYear: "2024–2026 Active",
      summary: "Strict prohibitions and fines up to AED 500,000 for electronic extortion, defamation, or recording individuals without consent.",
      scenarioPrompt: "Someone recorded a private conversation in Dubai and shared it on social media without consent. What are the legal consequences?"
    }
  ]
};

export function LawOfTheDay({ countryCode, onSelectPrompt }) {
  const [expanded, setExpanded] = useState(false);

  const countryLaws = STATUTE_HIGHLIGHTS[countryCode] || STATUTE_HIGHLIGHTS['IN'];
  // Rotate based on day of month
  const dayIndex = new Date().getDate() % countryLaws.length;
  const item = countryLaws[dayIndex];

  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'linear-gradient(135deg, rgba(186,158,255,0.06), rgba(0,227,253,0.03))',
        border: '1px solid rgba(186,158,255,0.18)',
        borderRadius: '14px',
        padding: '0.85rem 1.15rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 20px -8px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'rgba(186,158,255,0.12)', border: '1px solid rgba(186,158,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
          }}>
            <Scale size={15} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', fontWeight: 700 }}>
                Statute of the Day
              </span>
              <span style={{
                fontSize: '0.65rem', padding: '0.1rem 0.45rem', borderRadius: '4px',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981', fontWeight: 600
              }}>
                {item.enactmentYear}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--on-surface)', marginTop: '2px' }}>
              {item.title} <span style={{ color: 'var(--on-surface-variant)', fontWeight: 400, fontSize: '0.82rem' }}>({item.section})</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => onSelectPrompt?.(item.scenarioPrompt)}
            title="Load this legal query into your workspace"
            style={{
              background: 'rgba(186,158,255,0.15)',
              border: '1px solid rgba(186,158,255,0.35)',
              color: 'var(--primary)',
              borderRadius: '8px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(186,158,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(186,158,255,0.15)'}
          >
            Analyze <ArrowRight size={12} />
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--on-surface-variant)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronRight size={16} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(186,158,255,0.1)' }}
          >
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
              {item.summary}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
