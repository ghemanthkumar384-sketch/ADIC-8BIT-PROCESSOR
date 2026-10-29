import React, { useState } from 'react';
import { Database, ShieldAlert, RotateCcw, Edit3, CheckCircle2, Lock } from 'lucide-react';

export default function RegisterFileViewer() {
  // Initial state matches the demonstration program final values
  const defaultRegisters = [0, 5, 8, 13, 8, 8, 13, 5];
  const [registers, setRegisters] = useState(defaultRegisters);
  const [targetReg, setTargetReg] = useState(1);
  const [writeDataInput, setWriteDataInput] = useState(42);
  const [writeFeedback, setWriteFeedback] = useState(null);
  const [recentlyModified, setRecentlyModified] = useState(null);

  const handleReset = (mode) => {
    if (mode === 'zeros') {
      setRegisters([0, 0, 0, 0, 0, 0, 0, 0]);
      setWriteFeedback({ type: 'info', msg: 'All registers reset to initial 0x00 state.' });
    } else {
      setRegisters(defaultRegisters);
      setWriteFeedback({ type: 'info', msg: 'Loaded final post-demonstration program state.' });
    }
    setRecentlyModified(null);
  };

  const handleExecuteWrite = () => {
    const val = parseInt(writeDataInput, 10);
    if (isNaN(val) || val < 0 || val > 255) {
      setWriteFeedback({ type: 'error', msg: 'Value must be an 8-bit unsigned integer (0 to 255).' });
      return;
    }

    if (targetReg === 0) {
      // Architectural rule check!
      setWriteFeedback({
        type: 'warning',
        msg: "Hardware Protection Enforced! In rtl/register_file.v, writes to waddr == 3'b000 are suppressed. R0 stays 0x00."
      });
      setRecentlyModified(0);
      return;
    }

    const updated = [...registers];
    updated[targetReg] = val;
    setRegisters(updated);
    setRecentlyModified(targetReg);
    setWriteFeedback({
      type: 'success',
      msg: `Successfully wrote 0x${val.toString(16).toUpperCase()} (${val}) into Register R${targetReg}!`
    });
  };

  return (
    <section id="registers" className="section">
      <div className="container">
        <div className="section-title-wrap">
          <div className="section-tag">
            <Database size={14} />
            <span>Datapath Storage</span>
          </div>
          <h2 className="section-title">8-Bit General Purpose Register File</h2>
          <p className="section-subtitle">
            Eight 8-bit registers (R0-R7) with dual asynchronous read ports, single synchronous write-back,
            internal write-through bypass, and hardwired ground protection on Register R0.
          </p>
        </div>

        {/* Top Control Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => handleReset('program')}>
              <RotateCcw size={14} />
              <span>Load Final Program State</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => handleReset('zeros')}>
              <RotateCcw size={14} />
              <span>Reset All to Zero</span>
            </button>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Dual Read Ports (Rs, Rt) • Synchronous Write Port (Rd)
          </span>
        </div>

        {/* 8 Register Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          {registers.map((val, idx) => {
            const isR0 = idx === 0;
            const isModified = recentlyModified === idx;
            const binStr = val.toString(2).padStart(8, '0');
            const hexStr = `0x${val.toString(16).toUpperCase().padStart(2, '0')}`;

            return (
              <div
                key={idx}
                className="card"
                style={{
                  border: isModified ? '2px solid var(--accent-emerald)' : (isR0 ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)'),
                  background: isModified ? 'rgba(16, 185, 129, 0.08)' : (isR0 ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-card)'),
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.15rem', color: isR0 ? 'var(--accent-amber)' : 'var(--text-main)' }}>
                      R{idx}
                    </span>
                    {isR0 && (
                      <span className="badge badge-amber" style={{ fontSize: '0.68rem', gap: '0.25rem' }}>
                        <Lock size={10} />
                        <span>ZERO PROTECTED</span>
                      </span>
                    )}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Addr: 3'b{idx.toString(2).padStart(3, '0')}
                  </span>
                </div>

                {/* Values */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Hex</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-sky)' }}>{hexStr}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Decimal</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{val}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Binary</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
                      {binStr.slice(0, 4)} {binStr.slice(4)}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {isR0 ? "Permanent zero; writes are ignored" : `General purpose 8-bit register R${idx}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* INTERACTIVE WRITE TEST SANDBOX */}
        <div className="card-elevated" style={{ border: '1px solid var(--border-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.5rem', borderRadius: '8px', color: 'var(--accent-sky)' }}>
              <Edit3 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Interactive Register File Write Sandbox</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Test synchronous write behavior and experience the architectural R0 zero-protection logic live.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            {/* Target Register Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Destination (waddr):
              </label>
              <select
                value={targetReg}
                onChange={(e) => setTargetReg(parseInt(e.target.value, 10))}
                style={{
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={0}>R0 (Hardwired Zero Protection)</option>
                <option value={1}>R1</option>
                <option value={2}>R2</option>
                <option value={3}>R3</option>
                <option value={4}>R4</option>
                <option value={5}>R5</option>
                <option value={6}>R6</option>
                <option value={7}>R7</option>
              </select>
            </div>

            {/* Value Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Write Data (0-255):
              </label>
              <input
                type="number"
                min={0}
                max={255}
                value={writeDataInput}
                onChange={(e) => setWriteDataInput(e.target.value)}
                style={{
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  width: '140px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Quick Test Values */}
            <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setWriteDataInput(255)}>0xFF (255)</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setWriteDataInput(128)}>0x80 (128)</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setWriteDataInput(0)}>0x00 (0)</button>
            </div>

            {/* Submit Button */}
            <div style={{ alignSelf: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleExecuteWrite} style={{ gap: '0.5rem' }}>
                <span>Execute Write (wen = 1)</span>
              </button>
            </div>
          </div>

          {/* Feedback Banner */}
          {writeFeedback && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: writeFeedback.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' :
                          (writeFeedback.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
              border: `1px solid ${writeFeedback.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' :
                      (writeFeedback.type === 'error' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)')}`,
              color: writeFeedback.type === 'warning' ? '#fbbf24' :
                     (writeFeedback.type === 'error' ? '#fb7185' : '#34d399')
            }}>
              {writeFeedback.type === 'warning' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
              <span>{writeFeedback.msg}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

