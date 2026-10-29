import React, { useState } from 'react';
import { Layers, ArrowRight, Zap, RefreshCw, Cpu, Database, GitCommit, HelpCircle } from 'lucide-react';

export default function ArchitectureDiagram() {
  const [selectedBlock, setSelectedBlock] = useState('fwd');
  const [highlightForwarding, setHighlightForwarding] = useState(true);

  const blockDetails = {
    if: {
      name: "Stage 1: Instruction Fetch (IF)",
      module: "instruction_memory.v + PC logic",
      description: "Maintains the 8-bit Program Counter (PC). On every rising clock edge, fetches the 16-bit instruction word from on-chip ROM at address PC and computes PC_next = PC + 1.",
      inputs: ["clk: System clock", "rst: Active-high synchronous reset"],
      outputs: ["pc [7:0]: Address driving instruction ROM", "instruction [15:0]: 16-bit fetched instruction word"],
      timing: "Combinational ROM read; PC increments at posedge clk."
    },
    if_id: {
      name: "Pipeline Register 1: if_id_register",
      module: "if_id_register.v",
      description: "Decouples the IF and ID stages. Latches the fetched 16-bit instruction, PC, and valid flag on the clock edge, presenting them to the decoder in Stage 2.",
      inputs: ["if_valid", "if_pc [7:0]", "if_instruction [15:0]"],
      outputs: ["id_valid", "id_pc [7:0]", "id_instruction [15:0]"],
      timing: "Latches on posedge clk when reset is deasserted. Cleared to 0 on synchronous reset."
    },
    id: {
      name: "Stage 2: Instruction Decode & Operand Fetch (ID)",
      module: "instruction_decoder.v + register_file.v + forwarding_unit.v",
      description: "Extracts opcode [15:12], destination register Rd [11:9], source registers Rs [8:6] and Rt [5:3], and immediate fields. Dual asynchronous read ports read registers R[Rs] and R[Rt]. Operand multiplexers choose between Register File reads and forwarded EX/WB results.",
      inputs: ["id_instruction [15:0]", "ex_alu_result [7:0] (from EX/WB stage for forwarding)"],
      outputs: ["id_opA [7:0]: Prepared Operand A", "id_opB [7:0]: Prepared Operand B", "id_opcode [3:0]", "id_rd [2:0]", "id_reg_write"],
      timing: "Combinational decode and read access. Forwarding muxes settle within the same cycle."
    },
    id_ex: {
      name: "Pipeline Register 2: id_ex_register",
      module: "id_ex_register.v",
      description: "Decouples the ID and EX/WB stages. Latches the decoded control signals, destination register address Rd, write-enable, and prepared operands A and B.",
      inputs: ["id_valid", "id_pc", "id_opcode", "id_rd", "id_reg_write", "id_opA", "id_opB"],
      outputs: ["ex_valid", "ex_pc", "ex_opcode", "ex_rd", "ex_reg_write", "ex_opA", "ex_opB"],
      timing: "Latches on posedge clk. Clears to 0 on synchronous reset."
    },
    ex_wb: {
      name: "Stage 3: Execute & Write-Back (EX/WB)",
      module: "alu.v + synchronous RF write",
      description: "The 8-bit Arithmetic Logic Unit (ALU) performs the operation specified by ex_opcode on operands ex_opA and ex_opB. The result is synchronously written into register R[ex_rd] on the next clock edge if ex_reg_write is asserted and ex_rd != 0.",
      inputs: ["ex_opcode [3:0]", "ex_opA [7:0]", "ex_opB [7:0]", "ex_rd [2:0]", "ex_reg_write"],
      outputs: ["ex_alu_result [7:0]: Computed arithmetic/logic result", "RF commit to R[ex_rd]"],
      timing: "Combinational ALU evaluation; synchronous register file write-back at posedge clk."
    },
    fwd: {
      name: "Forwarding Unit (EX/WB -> ID)",
      module: "forwarding_unit.v",
      description: "Compares producer destination register (ex_rd) in EX/WB with consumer source registers (id_rs, id_rt) in ID. If a RAW dependency exists, ex_alu_result is routed directly into the ID stage multiplexer, completely eliminating the need for pipeline stall cycles or bubbles!",
      inputs: ["id_valid", "id_uses_rs", "id_uses_rt", "id_rs [2:0]", "id_rt [2:0]", "ex_valid", "ex_reg_write", "ex_rd [2:0]"],
      outputs: ["forward_a: Routes ex_alu_result to Operand A", "forward_b: Routes ex_alu_result to Operand B"],
      timing: "100% combinational hazard detection. Resolves distance-1 RAW hazards in 0 clock stall cycles."
    },
    rf: {
      name: "Register File (8 x 8-Bit)",
      module: "register_file.v",
      description: "Eight general purpose 8-bit registers (R0-R7). R0 is hardwired to 8'h00 and ignores all write attempts. Dual asynchronous read ports with internal write-through bypass: if write and read occur to the same register in the same cycle, new write data is bypassed immediately.",
      inputs: ["raddr1 [2:0]", "raddr2 [2:0]", "waddr [2:0]", "wdata [7:0]", "wen", "clk", "rst"],
      outputs: ["rdata1 [7:0]", "rdata2 [7:0]", "r0..r7 observability taps"],
      timing: "Dual asynchronous reads; single synchronous write on posedge clk."
    }
  };

  const selected = blockDetails[selectedBlock] || blockDetails.if;

  return (
    <section id="architecture" className="section">
      <div className="container">
        <div className="section-title-wrap">
          <div className="section-tag">
            <Layers size={14} />
            <span>Datapath & Control Design</span>
          </div>
          <h2 className="section-title">Microarchitecture & Pipeline Topology</h2>
          <p className="section-subtitle">
            Interactive structural diagram of the 3-stage pipelined datapath. Click on any pipeline
            stage, pipeline register, or forwarding unit to inspect its internal logic, ports, and timing.
          </p>
        </div>

        {/* Visual Pipeline Interactive Diagram */}
        <div className="card-elevated" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Click any block below to inspect hardware details:
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setHighlightForwarding(!highlightForwarding)}
              style={{
                borderColor: highlightForwarding ? 'var(--accent-sky)' : 'var(--border-subtle)',
                background: highlightForwarding ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-card)'
              }}
            >
              <Zap size={14} color={highlightForwarding ? '#38bdf8' : '#94a3b8'} />
              <span>{highlightForwarding ? "Forwarding Path: Highlighted" : "Highlight Forwarding Path"}</span>
            </button>
          </div>

          {/* Pipeline Diagram Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 1fr) 48px minmax(260px, 1.2fr) 48px minmax(240px, 1.1fr)',
            gap: '0.5rem',
            alignItems: 'stretch',
            overflowX: 'auto',
            paddingBottom: '1rem'
          }}>
            {/* STAGE 1: IF */}
            <div
              onClick={() => setSelectedBlock('if')}
              style={{
                background: selectedBlock === 'if' ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
                border: `2px solid ${selectedBlock === 'if' ? 'var(--accent-sky)' : 'var(--border-subtle)'}`,
                borderRadius: '10px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-sky">STAGE 1</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>IF</span>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Instruction Fetch</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Program Counter & ROM Memory</p>
              </div>

              {/* Subcomponents inside IF */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ background: 'var(--bg-chip)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  PC Reg: 8-bit (PC &larr; PC + 1)
                </div>
                <div style={{ background: 'var(--bg-chip)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  ROM: 256 x 16-bit
                </div>
              </div>

              <div style={{ marginTop: 'auto', fontSize: '0.72rem', color: 'var(--accent-sky)', fontFamily: 'var(--font-mono)' }}>
                Outputs: instruction [15:0], pc [7:0]
              </div>
            </div>

            {/* PIPELINE REG 1 */}
            <div
              onClick={() => setSelectedBlock('if_id')}
              style={{
                background: selectedBlock === 'if_id' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: `1px dashed ${selectedBlock === 'if_id' ? 'var(--accent-purple)' : 'var(--border-muted)'}`,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '0.5rem',
                textAlign: 'center'
              }}
            >
              <GitCommit size={18} color="var(--accent-purple)" />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: '0.5rem 0', color: 'var(--accent-purple)' }}>
                IF / ID REG
              </span>
              <ArrowRight size={14} color="var(--text-muted)" />
            </div>

            {/* STAGE 2: ID */}
            <div
              onClick={() => setSelectedBlock('id')}
              style={{
                background: selectedBlock === 'id' ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
                border: `2px solid ${selectedBlock === 'id' ? 'var(--accent-sky)' : 'var(--border-subtle)'}`,
                borderRadius: '10px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-sky">STAGE 2</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID</span>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Decode & Operand Fetch</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Instruction Decoder & Register File</p>
              </div>

              {/* Subcomponents inside ID */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ background: 'var(--bg-chip)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  Decoder: Opcode [15:12], Rd, Rs, Rt
                </div>
                <div
                  onClick={(e) => { e.stopPropagation(); setSelectedBlock('rf'); }}
                  style={{
                    background: selectedBlock === 'rf' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-chip)',
                    border: selectedBlock === 'rf' ? '1px solid var(--accent-emerald)' : '1px solid transparent',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-emerald)'
                  }}
                >
                  Register File: R0-R7 (Dual Read)
                </div>
                <div style={{ background: 'var(--bg-chip)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  Operand Muxes: (RF Read vs Fwd)
                </div>
              </div>

              <div style={{ marginTop: 'auto', fontSize: '0.72rem', color: 'var(--accent-sky)', fontFamily: 'var(--font-mono)' }}>
                Outputs: id_opA [7:0], id_opB [7:0], id_rd, id_opcode
              </div>
            </div>

            {/* PIPELINE REG 2 */}
            <div
              onClick={() => setSelectedBlock('id_ex')}
              style={{
                background: selectedBlock === 'id_ex' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                border: `1px dashed ${selectedBlock === 'id_ex' ? 'var(--accent-purple)' : 'var(--border-muted)'}`,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '0.5rem',
                textAlign: 'center'
              }}
            >
              <GitCommit size={18} color="var(--accent-purple)" />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, fontFamily: 'var(--font-mono)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: '0.5rem 0', color: 'var(--accent-purple)' }}>
                ID / EX REG
              </span>
              <ArrowRight size={14} color="var(--text-muted)" />
            </div>

            {/* STAGE 3: EX/WB */}
            <div
              onClick={() => setSelectedBlock('ex_wb')}
              style={{
                background: selectedBlock === 'ex_wb' ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
                border: `2px solid ${selectedBlock === 'ex_wb' ? 'var(--accent-sky)' : 'var(--border-subtle)'}`,
                borderRadius: '10px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-sky">STAGE 3</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>EX/WB</span>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Execute & Write-Back</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>8-bit ALU & Register Commit</p>
              </div>

              {/* Subcomponents inside EX/WB */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ background: 'var(--bg-chip)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  8-Bit ALU (ADD, SUB, AND, OR, XOR)
                </div>
                <div style={{ background: 'var(--bg-chip)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  Write-Back Port: R[ex_rd] &larr; alu_res
                </div>
              </div>

              <div style={{ marginTop: 'auto', fontSize: '0.72rem', color: 'var(--accent-sky)', fontFamily: 'var(--font-mono)' }}>
                Outputs: ex_alu_result [7:0], R[ex_rd] commit
              </div>
            </div>
          </div>

          {/* FORWARDING UNIT BLOCK & ANIMATED BUS */}
          <div
            onClick={() => setSelectedBlock('fwd')}
            style={{
              marginTop: '1.25rem',
              background: selectedBlock === 'fwd' ? 'rgba(244, 63, 94, 0.12)' : 'rgba(15, 23, 42, 0.7)',
              border: `2px dashed ${highlightForwarding ? 'var(--accent-rose)' : 'var(--border-subtle)'}`,
              borderRadius: '10px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: highlightForwarding ? '0 0 15px rgba(244, 63, 94, 0.15)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                background: 'rgba(244, 63, 94, 0.2)',
                padding: '0.6rem',
                borderRadius: '8px',
                color: 'var(--accent-rose)'
              }}>
                <Zap size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Dedicated Data Forwarding Unit</h4>
                  <span className="badge badge-rose">RAW Hazard Buster</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Detects producer (EX/WB: ex_rd) &amp; consumer (ID: id_rs, id_rt) collisions. Bypasses result instantly with 0 stalls.
                </p>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>EX/WB (alu_res)</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>&rarr;</span>
              <span>ID Stage Multiplexers</span>
            </div>
          </div>
        </div>

        {/* Selected Component Inspector Panel */}
        <div className="card" style={{ borderLeft: '4px solid var(--accent-sky)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <span className="badge badge-sky" style={{ marginBottom: '0.4rem' }}>Selected Component Inspector</span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>{selected.name}</h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Verilog File: rtl/{selected.module}
              </span>
            </div>
            <div style={{ background: 'var(--bg-chip)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
              Timing: {selected.timing}
            </div>
          </div>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {selected.description}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-sky)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Input Signals / Ports
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {selected.inputs.map((inSig, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    &bull; {inSig}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Output Signals / Ports
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {selected.outputs.map((outSig, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    &bull; {outSig}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

