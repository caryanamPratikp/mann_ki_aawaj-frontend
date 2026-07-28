import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout.jsx';

export function AboutPage({ onNavigate }) {
  return (
    <PublicLayout activeRoute="/about" onNavigate={onNavigate}>
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 16px' }} className="flex-col gap-md">
        <h1 className="page-heading">About Man Ki Aavaj</h1>
        <div className="mka-card flex-col gap-md">
          <p className="body-text">
            Man Ki Aavaj is an 18+ anonymous, text-first social platform designed to create a safe, respectful space for self-expression without public social pressure.
          </p>
          <h2 className="card-heading">Core Philosophy</h2>
          <p className="body-text">
            We believe that written thoughts carry deep emotional resonance when freed from popularity algorithms, public follower counts, and real-name judgment.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
