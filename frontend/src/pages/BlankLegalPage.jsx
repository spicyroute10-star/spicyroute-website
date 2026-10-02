import React from 'react';
import LegalPolicyPage from './LegalPolicyPage';

export default function BlankLegalPage({ title = 'Terms & Conditions', onBack }) {
  let initialTab = 'terms';
  const lower = String(title).toLowerCase();
  if (lower.includes('privacy')) initialTab = 'privacy';
  else if (lower.includes('refund') || lower.includes('cancel')) initialTab = 'refund';
  else if (lower.includes('fssai') || lower.includes('compliance')) initialTab = 'compliance';

  return <LegalPolicyPage initialTab={initialTab} onBack={onBack} />;
}
