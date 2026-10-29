import React from 'react';
import { Cpu, Zap, ShieldCheck, CheckCircle2, ArrowRight, Clock, Box, Database, GitMerge } from 'lucide-react';
import { PROCESSOR_SPECS } from '../data/processorData';

export default function ProjectOverview({ onNavigate }) {
  const specItems = [
    { label: "Datapath Width", value: PROCESSOR_SPECS.datapathWidth, icon: Box, note: "8-bit arithmetic & logical operations" },
    { label: "Instruction Format", value: PROCESSOR_SPECS.instructionWidth, icon: Cpu, note: "Fixed 16-bit word format (256 ROM words)" },
    { label: "Pipeline Structure", value: "3 Stages (IF, ID, EX/WB)", icon: GitMerge, note: "Fully decoupled with pipeline registers" },
    { label: "Register File", value: "8 Registers (R0 - R7)", icon: Database, note: "R0 hardwired to 0; write-through bypass" },
    { label: "Hazard Resolution", value: "Zero-Stall Forwarding", icon: Zap, note: "EX/WB -> ID operand bypass with 0 bubbles" },
    { label: "Clock & Reset", value: "100 MHz • Sync Reset", icon: Clock, note: "10 ns cycle period, active-high synchronous reset" },
    { label: "Synthesizability", value: "100% Verilog-2001", icon: ShieldCheck, note: "Latch-free, standard compliant RTL" },
    { label: "Verification Status", value: "32/32 Passing Checks", icon: CheckCircle2, note: "Cycle-accurate reference engine verified" }
  ];

  return (
    <section id="overview" className="section">
      <div className="container">
        {/* Hero Header */}
        <div style={{ maxWidth: '960px', marginBottom: '3.5rem' }}>
          <div className="section-tag">
            <Cpu size={14} />
            <span>Academic ADIC RTL Design Project</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem'
          }}>
            3-Stage Pipelined <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #06b6d4 50%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>8-Bit Processor</span> in Verilog HDL
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}>
            A complete, synthesizable, simulation-verified 8-bit RISC microprocessor architecture
            featuring Instruction Fetch (IF), Instruction Decode (ID), and Execute/Write-Back (EX/WB)
            stages with dedicated data forwarding to eliminate data hazard stalls.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('pipeline')}
              style={{ gap: '0.6rem' }}
            >
              <span>Explore Interactive Pipeline</span>
              <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate('architecture')}
            >
              Microarchitecture Diagram
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate('source')}
            >
              Inspect Verilog RTL
            </button>
          </div>
        </div>

        {/* Specifications Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '3rem'
        }}>
          {specItems.map((spec, idx) => {
            const Icon = spec.icon;
            return (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {spec.label}
                  </span>
                  <div style={{
                    padding: '0.4rem',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: 'var(--accent-sky)'
                  }}>
                    <Icon size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {spec.value}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {spec.note}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Stage Summary Cards */}
        <div className="card-elevated">
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Microarchitecture Pipeline Flow</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Three distinct synchronous stages executing concurrently every clock cycle.
              </p>
            </div>
            <div className="badge badge-emerald">
              <span>Throughput: 1 Instruction / Cycle (Steady State)</span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            {PROCESSOR_SPECS.pipelineStages.map((stage, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <span className="badge badge-sky" style={{ fontSize: '0.85rem' }}>{stage.name}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{stage.fullName}</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>

          {/* R0 Hardwire & Forwarding Rule Highlights */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Register Zero (R0):</strong> Permanent ground (8'h00); write attempts discarded.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-sky)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Data Forwarding:</strong> RAW hazards resolve via EX/WB &rarr; ID multiplexer with 0 bubbles.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

