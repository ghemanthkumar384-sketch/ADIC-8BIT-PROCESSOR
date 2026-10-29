import React from 'react';
import { Cpu, ArrowUp, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '3.5rem 0 2.5rem 0'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '2rem',
          marginBottom: '2.5rem'
        }}>
          {/* Brand Info */}
          <div style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                padding: '0.4rem',
                borderRadius: '6px',
                color: '#030712'
              }}>
                <Cpu size={18} strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                ADIC 8-BIT PROCESSOR
              </span>
              <span className="badge badge-sky">3-STAGE PIPELINE</span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A complete, simulation-verified academic digital integrated circuit (ADIC) project designed
              in synthesizable Verilog HDL with dedicated hazard forwarding, self-checking testbench,
              and interactive verification dashboard.
            </p>
          </div>

          {/* Quick Specifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Hardware Standards
            </div>
            <div>&bull; IEEE 1364-2001 Standard Compliant</div>
            <div>&bull; Target Simulator: Xilinx Vivado XSim</div>
            <div>&bull; 100 MHz Synchronous Active-High Reset</div>
            <div>&bull; 32 / 32 Reference Co-simulation Passed</div>
          </div>

          {/* Back to top button */}
          <div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={scrollToTop}
              style={{ gap: '0.4rem' }}
            >
              <ArrowUp size={14} />
              <span>Back to Top</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; 2026 Academic ADIC Processor Project &bull; OLYMPUS Workspace &bull; All Rights Reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            <span>Phase 6 Web Platform &bull; Built with React + Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

