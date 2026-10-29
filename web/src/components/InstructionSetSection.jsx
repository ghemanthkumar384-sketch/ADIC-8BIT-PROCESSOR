import React, { useState } from 'react';
import { BookOpen, Binary, Search, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { INSTRUCTION_FORMATS, INSTRUCTION_SET, DEMO_PROGRAM } from '../data/processorData';

export default function InstructionSetSection() {
  const [activeFormatTab, setActiveFormatTab] = useState(0);
  const [customHexInput, setCustomHexInput] = useState('0x6443');

  // Decode helper function
  const decodeInstruction = (rawHex) => {
    let cleanHex = rawHex.trim();
    if (cleanHex.startsWith('0x') || cleanHex.startsWith('0X')) {
      cleanHex = cleanHex.slice(2);
    }
    const val = parseInt(cleanHex, 16);
    if (isNaN(val) || val < 0 || val > 0xFFFF) {
      return { valid: false, error: "Please enter a valid 16-bit hex word (0x0000 to 0xFFFF)" };
    }

    const binStr = val.toString(2).padStart(16, '0');
    const opcode = (val >> 12) & 0xF;
    const rd = (val >> 9) & 0x7;
    const rs = (val >> 6) & 0x7;
    const rt = (val >> 3) & 0x7;
    const imm6 = val & 0x3F;
    const imm6Sign = (imm6 & 0x20) !== 0;
    const imm6Ext = imm6Sign ? (0xC0 | imm6) : imm6;
    const imm6SignedVal = imm6Sign ? (imm6 - 64) : imm6;
    const imm8 = val & 0xFF;

    let mnemonic = "UNKNOWN";
    let format = "Unknown";
    let regWrite = false;
    let usesRs = false;
    let usesRt = false;
    let asmString = "";
    let desc = "";

    switch (opcode) {
      case 0x0:
        mnemonic = "NOP";
        format = "Special";
        regWrite = false;
        usesRs = false;
        usesRt = false;
        asmString = "NOP";
        desc = "No operation. Does not modify registers.";
        break;
      case 0x1:
        mnemonic = "ADD";
        format = "R-Type";
        regWrite = true;
        usesRs = true;
        usesRt = true;
        asmString = `ADD R${rd}, R${rs}, R${rt}`;
        desc = `Adds R${rs} + R${rt} and stores into R${rd}`;
        break;
      case 0x2:
        mnemonic = "SUB";
        format = "R-Type";
        regWrite = true;
        usesRs = true;
        usesRt = true;
        asmString = `SUB R${rd}, R${rs}, R${rt}`;
        desc = `Subtracts R${rs} - R${rt} and stores into R${rd}`;
        break;
      case 0x3:
        mnemonic = "AND";
        format = "R-Type";
        regWrite = true;
        usesRs = true;
        usesRt = true;
        asmString = `AND R${rd}, R${rs}, R${rt}`;
        desc = `Bitwise AND of R${rs} & R${rt} into R${rd}`;
        break;
      case 0x4:
        mnemonic = "OR";
        format = "R-Type";
        regWrite = true;
        usesRs = true;
        usesRt = true;
        asmString = `OR R${rd}, R${rs}, R${rt}`;
        desc = `Bitwise OR of R${rs} | R${rt} into R${rd}`;
        break;
      case 0x5:
        mnemonic = "XOR";
        format = "R-Type";
        regWrite = true;
        usesRs = true;
        usesRt = true;
        asmString = `XOR R${rd}, R${rs}, R${rt}`;
        desc = `Bitwise XOR of R${rs} ^ R${rt} into R${rd}`;
        break;
      case 0x6:
        mnemonic = "ADDI";
        format = "I-Type (6-bit)";
        regWrite = true;
        usesRs = true;
        usesRt = false;
        asmString = `ADDI R${rd}, R${rs}, ${imm6SignedVal}`;
        desc = `Adds sign-extended ${imm6SignedVal} to R${rs} and stores into R${rd}`;
        break;
      case 0x7:
        mnemonic = "LOADI";
        format = "I-Type (8-bit)";
        regWrite = true;
        usesRs = false;
        usesRt = false;
        asmString = `LOADI R${rd}, ${imm8}`;
        desc = `Loads immediate value ${imm8} (0x${imm8.toString(16).toUpperCase()}) into R${rd}`;
        break;
      default:
        mnemonic = "RESERVED (NOP)";
        format = "Illegal Opcode";
        regWrite = false;
        usesRs = false;
        usesRt = false;
        asmString = `ILLEGAL_OP (0x${val.toString(16).toUpperCase()})`;
        desc = "Unmapped opcode; hardware default logic safely neutralizes to NOP.";
        break;
    }

    return {
      valid: true,
      val,
      binStr,
      opcode,
      opcodeBin: binStr.slice(0, 4),
      rd,
      rdBin: binStr.slice(4, 7),
      rs,
      rsBin: binStr.slice(7, 10),
      rt,
      rtBin: binStr.slice(10, 13),
      imm6,
      imm6Ext,
      imm6SignedVal,
      imm6Bin: binStr.slice(10, 16),
      imm8,
      imm8Bin: binStr.slice(8, 16),
      mnemonic,
      format,
      regWrite,
      usesRs,
      usesRt,
      asmString,
      desc
    };
  };

  const decoded = decodeInstruction(customHexInput);

  return (
    <section id="isa" className="section">
      <div className="container">
        <div className="section-title-wrap">
          <div className="section-tag">
            <BookOpen size={14} />
            <span>Instruction Set Architecture</span>
          </div>
          <h2 className="section-title">16-Bit Instruction Set &amp; Encodings</h2>
          <p className="section-subtitle">
            The processor utilizes a streamlined 16-bit instruction format designed for zero-hazard decoding,
            supporting 7 primary operations across Register-Register and Immediate instruction types.
          </p>
        </div>

        {/* 16-Bit Encoding Format Cards */}
        <div className="card-elevated" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {INSTRUCTION_FORMATS.map((fmt, idx) => (
              <button
                key={idx}
                className={`btn btn-sm ${activeFormatTab === idx ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveFormatTab(idx)}
              >
                {fmt.type.split(' ')[0]} Format
              </button>
            ))}
          </div>

          {/* Active Format Breakdown */}
          {(() => {
            const fmt = INSTRUCTION_FORMATS[activeFormatTab];
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{fmt.type}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Applicable Instructions: {fmt.instructions.join(', ')}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-sky)' }}>
                    Syntax: <strong>{fmt.syntax}</strong>
                  </div>
                </div>

                {/* Bit Field Graphic */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: fmt.fields.map(f => `${f.width}fr`).join(' '),
                  gap: '4px',
                  marginBottom: '1rem',
                  overflowX: 'auto'
                }}>
                  {fmt.fields.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '0.75rem 0.5rem',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-sky)', fontWeight: 600 }}>
                        {f.bits}
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.2rem 0' }}>
                        {f.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {f.width} {f.width === 1 ? 'bit' : 'bits'}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}>
                  <strong>RTL Action:</strong> <span style={{ color: 'var(--accent-emerald)' }}>{fmt.rtlAction}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* INTERACTIVE INSTRUCTION DECODER SANDBOX */}
        <div className="card-elevated" style={{ marginBottom: '2.5rem', border: '1px solid var(--accent-sky)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.5rem', borderRadius: '8px', color: 'var(--accent-sky)' }}>
                <Binary size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Interactive Instruction Bit-Slicer &amp; Decoder</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Type any 16-bit hexadecimal instruction to see real-time hardware decoding.
                </p>
              </div>
            </div>

            {/* Quick Demo Program Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Presets:</span>
              {DEMO_PROGRAM.slice(0, 6).map((prog, idx) => (
                <button
                  key={idx}
                  className="btn btn-secondary btn-sm"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => setCustomHexInput(prog.hex)}
                >
                  {prog.hex} ({prog.asm.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Hex Input Field */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-app)', border: '1px solid var(--border-muted)', borderRadius: '6px', padding: '0.4rem 0.8rem', width: '220px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginRight: '0.4rem' }}>Hex:</span>
              <input
                type="text"
                value={customHexInput}
                onChange={(e) => setCustomHexInput(e.target.value)}
                maxLength={6}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--accent-sky)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  width: '100%'
                }}
                placeholder="0x7205"
              />
            </div>

            {decoded.valid && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                  Decoded: {decoded.asmString}
                </span>
                <span className="badge badge-sky">{decoded.format}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{decoded.desc}</span>
              </div>
            )}
          </div>

          {/* Bit-Slicer Visual Representation */}
          {decoded.valid ? (
            <div>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                16-Bit Binary Slicing [15:0]:
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '4fr 3fr 3fr 3fr 3fr',
                gap: '6px',
                marginBottom: '1.5rem',
                overflowX: 'auto'
              }}>
                {/* Opcode [15:12] */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-cyan)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>[15:12] OPCODE</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {decoded.opcodeBin}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    0x{decoded.opcode.toString(16).toUpperCase()} ({decoded.mnemonic})
                  </div>
                </div>

                {/* Rd [11:9] */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-emerald)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>[11:9] RD (DEST)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                    {decoded.rdBin}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    R{decoded.rd} {decoded.rd === 0 ? '(Hardwired 0)' : ''}
                  </div>
                </div>

                {/* Rs [8:6] */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-sky)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-sky)', fontFamily: 'var(--font-mono)' }}>[8:6] RS (SRC 1)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-sky)' }}>
                    {decoded.rsBin}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {decoded.usesRs ? `R${decoded.rs}` : `R${decoded.rs} (Unused)`}
                  </div>
                </div>

                {/* Rt [5:3] */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-amber)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>[5:3] RT (SRC 2)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                    {decoded.rtBin}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {decoded.usesRt ? `R${decoded.rt}` : `R${decoded.rt} (Unused)`}
                  </div>
                </div>

                {/* Immediates / Unused [5:0] */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-purple)', borderRadius: '6px', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>[5:0] / [7:0] IMM</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>
                    {decoded.opcode === 0x7 ? `0x${decoded.imm8.toString(16).toUpperCase()}` : `Imm6: ${decoded.imm6SignedVal}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {decoded.opcode === 0x7 ? `Imm8 = ${decoded.imm8}` : (decoded.opcode === 0x6 ? `Sext = 0x${decoded.imm6Ext.toString(16).toUpperCase()}` : 'Reserved')}
                  </div>
                </div>
              </div>

              {/* Control Signals Generated */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                background: 'var(--bg-app)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>reg_write</span>
                  <span className={`badge ${decoded.regWrite ? 'badge-emerald' : 'badge-slate'}`}>
                    {decoded.regWrite ? '1 (Asserted)' : '0 (Disabled)'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>uses_rs</span>
                  <span className={`badge ${decoded.usesRs ? 'badge-sky' : 'badge-slate'}`}>
                    {decoded.usesRs ? '1 (Active)' : '0 (Inactive)'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>uses_rt</span>
                  <span className={`badge ${decoded.usesRt ? 'badge-amber' : 'badge-slate'}`}>
                    {decoded.usesRt ? '1 (Active)' : '0 (Inactive)'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{decoded.error}</span>
            </div>
          )}
        </div>

        {/* Complete Opcode Reference Table */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Complete Opcode Reference Table</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Opcode Hex</th>
                  <th>Binary</th>
                  <th>Mnemonic</th>
                  <th>Format</th>
                  <th>Syntax</th>
                  <th>RTL Operation</th>
                  <th>Reg Write</th>
                </tr>
              </thead>
              <tbody>
                {INSTRUCTION_SET.map((inst, i) => (
                  <tr key={i}>
                    <td><span className="mono-chip">{inst.opcodeHex}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{inst.opcodeBin}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-sky)' }}>{inst.mnemonic}</td>
                    <td><span className="badge badge-slate">{inst.format}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{inst.syntax}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{inst.aluAction}</td>
                    <td>
                      <span className={`badge ${inst.regWrite ? 'badge-emerald' : 'badge-slate'}`}>
                        {inst.regWrite ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

