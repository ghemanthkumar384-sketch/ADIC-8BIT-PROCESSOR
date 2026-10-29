import React, { useState, useEffect } from 'react';
import { Activity, Play, Pause, SkipForward, SkipBack, RotateCcw, Zap, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { CYCLE_EXECUTION_DATA } from '../data/processorData';

export default function PipelineExplorer() {
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0); // 0 to 11 (Cycle 1 to 12)
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1500); // 1.5 seconds per cycle

  const currentData = CYCLE_EXECUTION_DATA[currentCycleIndex];

  // Auto-play timer
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentCycleIndex((prev) => {
          if (prev >= CYCLE_EXECUTION_DATA.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playSpeed]);

  const handleNext = () => {
    if (currentCycleIndex < CYCLE_EXECUTION_DATA.length - 1) {
      setCurrentCycleIndex(currentCycleIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentCycleIndex > 0) {
      setCurrentCycleIndex(currentCycleIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentCycleIndex(0);
    setIsPlaying(false);
  };

  return (
    <section id="pipeline" className="section">
      <div className="container">
        <div className="section-title-wrap">
          <div className="section-tag">
            <Activity size={14} />
            <span>Interactive Verification Stepper</span>
          </div>
          <h2 className="section-title">Cycle-by-Cycle Pipeline Stepper</h2>
          <p className="section-subtitle">
            Step through the 10-instruction demonstration program cycle-by-cycle. Observe how instructions
            traverse IF, ID, and EX/WB stages, how data hazards are detected, and how forwarding resolves dependencies with zero stalls.
          </p>
        </div>

        {/* Stepper Controls Card */}
        <div className="card-elevated" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Cycle & Clock Status */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-sky" style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
                  Cycle {currentData.cycle} of {CYCLE_EXECUTION_DATA.length}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Clock Time: <strong style={{ color: 'var(--text-main)' }}>{currentData.timeNs}</strong> (100 MHz)
                </span>
              </div>
            </div>

            {/* Stepping Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleReset}
                title="Reset to Cycle 1"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={handlePrev}
                disabled={currentCycleIndex === 0}
                title="Step Backward"
              >
                <SkipBack size={16} />
                <span>Prev</span>
              </button>

              <button
                className={`btn btn-sm ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => setIsPlaying(!isPlaying)}
                style={{ minWidth: '100px' }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={handleNext}
                disabled={currentCycleIndex === CYCLE_EXECUTION_DATA.length - 1}
                title="Step Forward"
              >
                <span>Next</span>
                <SkipForward size={16} />
              </button>

              {/* Speed selector */}
              <select
                value={playSpeed}
                onChange={(e) => setPlaySpeed(parseInt(e.target.value, 10))}
                style={{
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.6rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              >
                <option value={2000}>Speed: 2.0s</option>
                <option value={1500}>Speed: 1.5s</option>
                <option value={800}>Speed: 0.8s</option>
              </select>
            </div>
          </div>

          {/* Cycle Timeline Bar */}
          <div style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            {CYCLE_EXECUTION_DATA.map((c, idx) => (
              <button
                key={c.cycle}
                onClick={() => {
                  setCurrentCycleIndex(idx);
                  setIsPlaying(false);
                }}
                style={{
                  flex: 1,
                  minWidth: '40px',
                  padding: '0.5rem 0.25rem',
                  borderRadius: '6px',
                  border: currentCycleIndex === idx ? '2px solid var(--accent-sky)' : '1px solid var(--border-subtle)',
                  background: currentCycleIndex === idx ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-card)',
                  color: currentCycleIndex === idx ? 'var(--accent-sky)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                C{c.cycle}
              </button>
            ))}
          </div>

          {/* ACTIVE HAZARD FORWARDING ALERT BANNER */}
          {currentData.forwardingActive && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '2px solid var(--accent-rose)',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 0 15px rgba(244, 63, 94, 0.2)'
            }} className="pulse-active">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'var(--accent-rose)', color: '#fff', padding: '0.4rem', borderRadius: '6px' }}>
                  <Zap size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                    DATA HAZARD RESOLVED VIA FORWARDING ({currentData.forwardingActive.signal})
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#fda4af' }}>
                    Producer in EX/WB &rarr; Consumer in ID. Bypassing value <strong>{currentData.forwardingActive.value}</strong> directly into operand with ZERO bubbles!
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '0.35rem 0.75rem', borderRadius: '4px' }}>
                Zero Stall Latency
              </div>
            </div>
          )}

          {/* THREE CONCURRENT PIPELINE STAGES CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            {/* STAGE 1: IF */}
            <div className="card" style={{ borderTop: '3px solid var(--accent-sky)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-sky">STAGE 1: IF</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Fetch</span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PC Address:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                  {currentData.ifStage.pc}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Fetched Word:</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-sky)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                  {currentData.ifStage.instHex}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {currentData.ifStage.asm}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Status: {currentData.ifStage.status}
              </div>
            </div>

            {/* STAGE 2: ID */}
            <div className="card" style={{ borderTop: `3px solid ${currentData.idStage.fwdA || currentData.idStage.fwdB ? 'var(--accent-rose)' : 'var(--accent-purple)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-purple">STAGE 2: ID</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Decode &amp; Operands</span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Instruction in ID:</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {currentData.idStage.asm}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>fwd_a:</span>
                  <span style={{ color: currentData.idStage.fwdA ? 'var(--accent-rose)' : 'var(--text-secondary)', fontWeight: currentData.idStage.fwdA ? 700 : 400 }}>
                    {currentData.idStage.fwdA ? '1 (ACTIVE)' : '0'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>fwd_b:</span>
                  <span style={{ color: currentData.idStage.fwdB ? 'var(--accent-rose)' : 'var(--text-secondary)', fontWeight: currentData.idStage.fwdB ? 700 : 400 }}>
                    {currentData.idStage.fwdB ? '1 (ACTIVE)' : '0'}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {currentData.idStage.note}
              </div>
            </div>

            {/* STAGE 3: EX/WB */}
            <div className="card" style={{ borderTop: '3px solid var(--accent-emerald)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-emerald">STAGE 3: EX/WB</span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Execute &amp; Write-Back</span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Executing Instruction:</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {currentData.exStage.asm}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>ALU Result:</span>
                  <strong style={{ color: 'var(--accent-emerald)' }}>{currentData.exStage.result}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dest Register:</span>
                  <span style={{ color: 'var(--text-main)' }}>{currentData.exStage.rd}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {currentData.exStage.note}
              </div>
            </div>
          </div>

          {/* LIVE REGISTER FILE STATE AT CURRENT CYCLE */}
          <div style={{ background: 'var(--bg-surface)', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Register File Snapshot (End of Cycle {currentData.cycle})
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                R0 is permanently 0x00
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: '0.5rem',
              overflowX: 'auto'
            }}>
              {currentData.registers.map((rVal, rIdx) => {
                const isR0 = rIdx === 0;
                const wasJustUpdated = currentData.exStage.writeBack && currentData.exStage.rd === `R${rIdx}`;
                return (
                  <div
                    key={rIdx}
                    style={{
                      background: wasJustUpdated ? 'rgba(16, 185, 129, 0.25)' : 'var(--bg-card)',
                      border: wasJustUpdated ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0.5rem 0.25rem',
                      textAlign: 'center',
                      minWidth: '55px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: isR0 ? 'var(--accent-amber)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      R{rIdx}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: wasJustUpdated ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                      {rVal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Engineering Explanation */}
          <div style={{
            background: 'var(--bg-card)',
            padding: '1.25rem',
            borderRadius: '8px',
            borderLeft: '4px solid var(--accent-sky)'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Hardware Explanation &amp; Microarchitectural Behavior:
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {currentData.explanation}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

