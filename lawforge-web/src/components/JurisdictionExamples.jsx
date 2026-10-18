// src/components/JurisdictionExamples.jsx
import React from 'react';
import { Lightbulb, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const JURISDICTION_EXAMPLES = {
  IN: [
    { label: "Traffic Challan Dispute", query: "Traffic police issued a ₹2,000 speeding challan on an expressway with missing limit signage. How can I contest this under the Motor Vehicles Act?" },
    { label: "Rental Deposit Refund", query: "My landlord in Bengaluru is refusing to return my ₹60,000 security deposit after vacating with full 30-day notice. What legal notice can I send?" },
    { label: "Unpaid Severance", query: "My employer terminated my position with immediate effect without providing the contractual 2-month notice pay or severance." }
  ],
  US: [
    { label: "Security Deposit Withholding", query: "Landlord in California did not return my $2,500 security deposit within 21 days or provide an itemized deduction statement under Civil Code 1950.5." },
    { label: "Speeding Ticket Defense", query: "I was issued a citation for going 12 mph over the limit on an interstate highway. Can I request radar calibration records in court?" },
    { label: "Independent Contractor Misclassification", query: "My employer requires 40 scheduled hours weekly, sets my equipment, but classifies me as a 1099 contractor instead of W-2." }
  ],
  GB: [
    { label: "Tenancy Deposit Scheme", query: "My landlord failed to protect my £1,200 deposit in an approved Tenancy Deposit Scheme (TDS) within 30 days of payment." },
    { label: "Private Parking Notice", query: "A private parking operator issued a £100 Parking Charge Notice for an alleged 10-minute overstay in a supermarket car park." },
    { label: "Constructive Dismissal", query: "I was forced to resign after management refused to address documented workplace safety violations and retaliation." }
  ],
  CA: [
    { label: "Bad-Faith Eviction", query: "Landlord issued an N12 notice for personal use in Ontario but immediately re-listed the rental apartment at a 30% higher rent." },
    { label: "Airline Delay Compensation", query: "My domestic flight was delayed by 6 hours due to airline crew scheduling under Air Passenger Protection Regulations (APPR)." },
    { label: "Employment Severance", query: "Terminated after 5 years of service with only 2 weeks of statutory notice. Am I entitled to common law reasonable notice pay?" }
  ],
  AU: [
    { label: "Unfair Dismissal (Fair Work)", query: "Terminated from my job after 18 months of employment without any prior written warnings or opportunity to respond." },
    { label: "Rental Bond Dispute", query: "Real estate property manager is claiming my entire $2,000 bond for pre-existing carpet wear noted on entry condition report." },
    { label: "Consumer Guarantee (ACL)", query: "Laptop motherboard failed 14 months after purchase; retailer refuses repair claiming the 1-year manufacturer warranty expired." }
  ],
  DEFAULT: [
    { label: "Wrongful Termination", query: "My employer terminated my contract without giving the required notice period or statutory severance pay." },
    { label: "Consumer Defective Product", query: "The merchant refuses to provide a replacement or refund for an expensive defective product under consumer warranty laws." },
    { label: "Police Stop & Rights", query: "What are my legal rights during a police stop regarding identification, search of vehicle, and right to remain silent?" }
  ]
};

export function JurisdictionExamples({ countryCode, onSelectQuery }) {
  const examples = JURISDICTION_EXAMPLES[countryCode] || JURISDICTION_EXAMPLES.DEFAULT;

  return (
    <div style={{ marginBottom: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', fontSize: '0.72rem', color: 'var(--on-surface-variant)', opacity: 0.85 }}>
        <Lightbulb size={13} style={{ color: 'var(--secondary)' }} />
        <span>Example situations for this jurisdiction (click to load):</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {examples.map((item, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectQuery(item.query)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(186, 158, 255, 0.15)',
              borderRadius: '20px',
              padding: '0.3rem 0.75rem',
              fontSize: '0.73rem',
              color: 'var(--on-surface)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(186, 158, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(186, 158, 255, 0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(186, 158, 255, 0.15)';
            }}
          >
            <span>{item.label}</span>
            <ArrowUpRight size={11} style={{ opacity: 0.6 }} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
