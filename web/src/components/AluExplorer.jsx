import React, { useState } from 'react';
import { Activity, Plus, Minus, Cpu, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AluExplorer() {
  const [opCode, setOpCode] = useState(1); // Default ADD
  const [opA, setOpA] = useState(5);
  const [opB, setOpB] = useState(3);

  const operations = [
    { code: 1, name: "ADD", hex: "0x1", desc: "A + B (Modulo 256 addition)" },
    { code: 2, name: "SUB", hex: "0x2", desc: "A - B (Modulo 256 subtraction with borrow)" },
    { code: 3, name: "AND", hex: "0x3", desc: "A & B (Bitwise logical AND)" },
    { code: 4, name: "OR",  hex: "0x4", desc: "A | B (Bitwise logical OR)" },
    { code: 5, name: "XOR", hex: "0x5", desc: "A ^ B (Bitwise logical XOR)" },
    { code: 6, name: "ADDI", hex: "0x6", desc: "A + B (Immediate addition with sign-extended imm)" },
    { code: 7, name: "LOADI", hex: "0x7", desc: "Passes B (Immediate byte) directly through" }
  ];

  // Compute ALU output
  const a = Math.max(0, Math.min(255, parseInt(opA, 10) || 0));
  const b = Math.max(0, Math.min(255, parseInt(opB, 10) || 0));

  let rawResult = 0;
  let wrappedResult = 0;
  let hasOverflow = false;
  let hasUnderflow = false;

  switch (opCode) {
    case 1: // ADD
    case 6: // ADDI
      rawResult = a + b;
      wrappedResult = rawResult & 0xFF;
      hasOverflow = rawResult > 255;
      break;
    case 2: // SUB
      rawResult = a - b;
      wrappedResult = (rawResult + 256) & 0xFF;
      hasUnderflow = a < b;
      break;
    case 3: // AND
      rawResult = a & b;
      wrappedResult = rawResult & 0xFF;
      break;
    case 4: // OR
      rawResult = a | b;
      wrappedResult = rawResult & 0xFF;
      break;
    case 5: // XOR
      rawResult = a ^ b;
      wrappedResult = rawResult & 0xFF;
      break;
    case 7: // LOADI
      rawResult = b;
      wrappedResult = b & 0xFF;
      break;
    default:
      wrappedResult = 0;
      break;
  }

  const isZero = wrappedResult === 0;
  const isNegative = (wrappedResult & 0x80) !== 0; // Bit 7 set
  const binResult = wrappedResult.toString(2).padStart(8, '0');
  const hexResult = `0x${wrappedResult.toString(16).toUpperCase().padStart(2, '0')}`;

  const setPreset = (code, valA, valB) => {
    setOpCode(code);
    setOpA(valA);
    setOpB(valB);
  };

  return (
    <section id="alu" className="section">
      <div className="container">
        <div className="section-title-wrap">
          <div className="section-tag">
            <Activity size={14} />
            <span>Execution Stage Core</span>
          </div>
          <h2 className="section-title">8-Bit ALU Interactive Calculator</h2>
          <p className="section-subtitle">
            Experiment with the combinational Arithmetic and Logic Unit module (<code className="mono-chip">rtl/alu.v</code>).
            Test arithmetic wrapping, borrow semantics, and bitwise logic operations in real time.
          </p>
        </div>

        <div className="card-elevated" style={{ marginBottom: '2rem' }}>
          {/* Operation Selector Tabs */}
          <div style={{ marginBottom: '1.75rem' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              Select ALU Opcode (ex_opcode):
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {operations.map((op) => (
                <button
                  key={op.code}
                  className={`btn btn-sm ${opCode === op.code ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setOpCode(op.code)}
                  style={{ gap: '0.4rem', fontFamily: 'var(--font-mono)' }}
                >
                  <span style={{ opacity: 0.7 }}>{op.hex}</span>
                  <strong>{op.name}</strong>
                </button>
              ))}
            </div>
            <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {operations.find(o => o.code === opCode)?.desc}
            </div>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Quick Scenarios:</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreset(1, 5, 3)}>5 + 3 = 8</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreset(1, 255, 1)}>Overflow (255 + 1 = 0)</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreset(2, 0, 1)}>Underflow (0 - 1 = 255)</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreset(3, 13, 8)}>AND (13 &amp; 8 = 8)</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreset(4, 5, 8)}>OR (5 | 8 = 13)</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreset(5, 13, 8)}>XOR (13 ^ 8 = 5)</button>
          </div>

          {/* Input Controls Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Operand A */}
            <div className="card" style={{ background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-sky)' }}>Operand A (ex_opA)</span>
                <span className="mono-chip">0x{a.toString(16).toUpperCase().padStart(2, '0')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={a}
                  onChange={(e) => setOpA(e.target.value)}
                  style={{ flex: 1, accentColor: 'var(--accent-sky)' }}
                  disabled={opCode === 7} // LOADI doesn't use opA
                />
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={a}
                  onChange={(e) => setOpA(e.target.value)}
                  style={{
                    width: '80px',
                    padding: '0.4rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem'
                  }}
                  disabled={opCode === 7}
                />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Binary: {a.toString(2).padStart(8, '0').slice(0, 4)} {a.toString(2).padStart(8, '0').slice(4)}
                {opCode === 7 && " (Ignored by LOADI)"}
              </div>
            </div>

            {/* Operand B */}
            <div className="card" style={{ background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>Operand B (ex_opB)</span>
                <span className="mono-chip">0x{b.toString(16).toUpperCase().padStart(2, '0')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={b}
                  onChange={(e) => setOpB(e.target.value)}
                  style={{ flex: 1, accentColor: 'var(--accent-emerald)' }}
                />
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={b}
                  onChange={(e) => setOpB(e.target.value)}
                  style={{
                    width: '80px',
                    padding: '0.4rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Binary: {b.toString(2).padStart(8, '0').slice(0, 4)} {b.toString(2).padStart(8, '0').slice(4)}
              </div>
            </div>
          </div>

          {/* ALU Output Result Display */}
          <div style={{
            background: 'var(--bg-app)',
            border: '2px solid var(--accent-sky)',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-sky)', textTransform: 'uppercase' }}>
                  ALU Output Result (ex_alu_result [7:0])
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                    {hexResult}
                  </span>
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                    = {wrappedResult} (Decimal)
                  </span>
                </div>
              </div>

              {/* Status Flags */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  background: isZero ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-chip)',
                  border: `1px solid ${isZero ? 'var(--accent-emerald)' : 'var(--border-subtle)'}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ZERO FLAG</div>
                  <div style={{ fontWeight: 700, color: isZero ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    Z = {isZero ? '1' : '0'}
                  </div>
                </div>

                <div style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  background: isNegative ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-chip)',
                  border: `1px solid ${isNegative ? 'var(--accent-rose)' : 'var(--border-subtle)'}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SIGN FLAG</div>
                  <div style={{ fontWeight: 700, color: isNegative ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                    N = {isNegative ? '1' : '0'}
                  </div>
                </div>

                <div style={{
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  background: (hasOverflow || hasUnderflow) ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-chip)',
                  border: `1px solid ${(hasOverflow || hasUnderflow) ? 'var(--accent-amber)' : 'var(--border-subtle)'}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>WRAP FLAG</div>
                  <div style={{ fontWeight: 700, color: (hasOverflow || hasUnderflow) ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                    {hasOverflow ? 'OVERFLOW' : (hasUnderflow ? 'BORROW' : 'NONE')}
                  </div>
                </div>
              </div>
            </div>

            {/* Binary bit breakdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.6rem 1rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>8-Bit Binary:</span>
              <span style={{ color: 'var(--accent-sky)', fontWeight: 700 }}>{binResult.slice(0, 4)}</span>
              <span style={{ color: 'var(--accent-sky)', fontWeight: 700 }}>{binResult.slice(4)}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                MSB: {binResult[0]} | LSB: {binResult[7]}
              </span>
            </div>

            {/* Overflow & Underflow alerts */}
            {hasOverflow && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>Arithmetic Overflow detected: Mathematical sum is {rawResult}, which wraps modulo 256 to {wrappedResult}.</span>
              </div>
            )}
            {hasUnderflow && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>Arithmetic Borrow detected: Mathematical difference is {rawResult}, which wraps modulo 256 to {wrappedResult}.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

