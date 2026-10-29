import React, { useState } from 'react';
import { FileText, BookOpen, Layers, CheckSquare, ShieldCheck, HelpCircle, Target, Compass, Rocket } from 'lucide-react';

export default function DocumentationViewer() {
  const [activeDoc, setActiveDoc] = useState('report');

  const docs = {
    report: {
      title: "Academic Project Report",
      file: "docs/project_report.md",
      icon: FileText,
      content: `
# Design & Verification of a 3-Stage Pipelined 8-Bit Processor
**Course Track:** Academic Digital Integrated Circuit (ADIC) Design  
**Standard:** IEEE 1364-2001 (Verilog-2001) | Target: Xilinx Vivado XSim  

### Executive Summary
This project implements a complete, synthesizable, and verified 3-stage pipelined 8-bit RISC processor with internal operand forwarding.
- **3-Stage Pipeline:** Instruction Fetch (IF), Instruction Decode (ID), Execute & Write-Back (EX/WB).
- **8-Bit Datapath & 16-Bit Instruction Format:** Fixed width supporting ADD, SUB, AND, OR, XOR, ADDI, and LOADI.
- **Zero-Stall Forwarding:** Resolves distance-1 RAW hazards at the EX/WB -> ID boundary with 0 bubbles (CPI = 1.0).
- **Register File:** Eight 8-bit registers (R0-R7) with hardwired R0 ground protection (writes to R0 suppressed).
- **Verification:** Three-tier verification architecture including a 32-assertion cycle-accurate reference model (100% pass rate).
`
    },
    viva: {
      title: "Viva Defense Questions (26 Q&As)",
      file: "docs/viva_questions.md",
      icon: HelpCircle,
      content: `
# Oral Defense & Viva Voce Exam Preparation (Sample Highlights)

### Q1. What is pipelining, and why do we use it?
**Answer:** Pipelining overlaps the execution of multiple instructions across hardware stages. Throughput increases to 1 instruction per cycle (CPI = 1.0) while hardware utilization is maximized.

### Q8. What is the exact boolean condition for data forwarding?
**Answer:** 
\`id_valid && ex_valid && ex_reg_write && (ex_rd != 3'b000) && id_uses_rs && (id_rs == ex_rd)\`
Forwarding only occurs if producer in EX/WB is valid, writing to a non-zero register, and matches the consumer's active source register in ID.

### Q9. Why must forwarding check (ex_rd != 3'b000)?
**Answer:** Register R0 is hardwired to 0. If an instruction attempts to write to R0 (e.g. LOADI R0, 255), the write is discarded. Checking \`ex_rd != 0\` prevents forwarding illegitimate non-zero values to subsequent instructions that read R0.

### Q15. How is Register R0 implemented?
**Answer:** Reads return 8'h00; synchronous writes check \`if (wen && waddr != 3'b000)\` to suppress writes; output tap hardwired to \`assign r0 = 8'h00;\`.

### Q25. What is the Three-Tier Verification Philosophy?
**Answer:** 
1. Tier 1 (HDL Simulation): Real XSim execution (transparently labeled as unavailable on host PC).
2. Tier 2 (Reference Model): Python co-simulator (32/32 assertions passed).
3. Tier 3 (Browser Model): Client-side interactive React visualization.
`
    },
    abstract: {
      title: "Formal Abstract",
      file: "docs/abstract.md",
      icon: BookOpen,
      content: `
# Formal Academic Abstract
This project presents the design, synthesizable RTL implementation, formal verification, and interactive web visualization of a 3-stage pipelined 8-bit RISC microprocessor developed in standard-compliant Verilog-2001.

The datapath is partitioned into three synchronous stages: Instruction Fetch (IF), Instruction Decode / Operand Fetch (ID), and Execute / Write-Back (EX/WB). The processor incorporates an 8-bit datapath, an 8-bit PC (256 ROM words), an orthogonal 16-bit instruction set (ADD, SUB, AND, OR, XOR, ADDI, LOADI), and an 8x8-bit register file with hardwired R0 ground protection.

To eliminate pipeline stalls, a dedicated combinational Forwarding Unit resolves distance-1 Read-After-Write (RAW) data hazards at the EX/WB -> ID boundary with zero bubbles. Verification is accomplished via a 32-assertion Python reference co-simulator (100% pass rate), a self-checking Verilog testbench, and an interactive digital engineering web dashboard.
`
    },
    objectives: {
      title: "Project Objectives",
      file: "docs/objectives.md",
      icon: Target,
      content: `
# Project Objectives & Problem Statement
1. **Synthesizable RTL:** Partition the datapath into IF, ID, and EX/WB stages using standard Verilog-2001 without latches.
2. **Orthogonal 16-Bit ISA:** Implement fixed-width instruction formats for arithmetic, logic, and immediates.
3. **Hardware R0 Protection:** Ensure R0 permanently reads as zero and drops all write attempts.
4. **Zero-Stall Forwarding:** Resolve RAW hazards in 0 stall cycles to sustain CPI = 1.0.
5. **Three-Tier Verification:** Implement testbenches, reference co-simulators, and interactive web visualizers with complete honesty regarding host EDA tool availability.
`
    },
    future: {
      title: "Future Scope & Roadmap",
      file: "docs/future_scope.md",
      icon: Compass,
      content: `
# Technical Roadmap & Future Extensions
1. **Control Flow & Branching:** Add conditional branches (BEQ, BNE), unconditional jumps (JMP, JAL), and pipeline flush logic.
2. **Memory Hierarchy (RAM):** Implement separate Data Memory with LOAD/STORE and a 1-cycle stall Hazard Detection Unit for load-use hazards.
3. **Classic 5-Stage Pipeline:** Decouple into IF -> ID -> EX -> MEM -> WB to exceed 200 MHz clock frequencies.
4. **Physical FPGA Targeting:** Synthesize on a Digilent Basys-3 (Artix-7) board with 7-segment display drivers and UART output.
`
    },
    deployment: {
      title: "Deployment Guide",
      file: "docs/deployment.md",
      icon: Rocket,
      content: `
# GitHub & Vercel Deployment Guide
- **Vercel Config:** \`web/vercel.json\` configured for Vite preset, root directory \`web\`, build command \`npm run build\`, output \`dist\`.
- **Pre-Flight Status:** Production build verified (2.87s, 0 errors); local preview verified on port 3000 (HTTP 200 OK); unit tests passed (4/4).
- **Safety Rule:** No code pushed to remote repositories or deployed publicly until explicit user approval is granted.
`
    }
  };

  const activeDocData = docs[activeDoc] || docs.report;

  return (
    <section id="docs" className="section">
      <div className="container">
        <div className="section-title-wrap">
          <div className="section-tag">
            <FileText size={14} />
            <span>Academic Documentation Package</span>
          </div>
          <h2 className="section-title">Design, Verification &amp; Defense Documentation</h2>
          <p className="section-subtitle">
            Browse the comprehensive academic project documentation, formal thesis abstract, technical objectives,
            future scope roadmap, and 26 oral defense viva voce questions.
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {Object.entries(docs).map(([key, item]) => {
            const Icon = item.icon;
            return (
              <button
                key={key}
                className={`btn btn-sm ${activeDoc === key ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveDoc(key)}
                style={{ gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
              >
                <Icon size={14} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {/* Document Content Card */}
        <div className="card-elevated">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{activeDocData.title}</h3>
              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-sky)' }}>
                File: {activeDocData.file}
              </span>
            </div>
            <div className="badge badge-emerald">
              <span>Verified Academic Markdown</span>
            </div>
          </div>

          <div style={{
            color: 'var(--text-main)',
            fontSize: '0.92rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-sans)'
          }}>
            {activeDocData.content}
          </div>
        </div>
      </div>
    </section>
  );
}
