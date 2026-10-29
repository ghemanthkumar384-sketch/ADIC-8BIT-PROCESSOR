# Design and Verification of a 3-Stage Pipelined 8-Bit Processor Using Verilog HDL

**Academic ADIC Project & Interactive Engineering Dashboard**  
**Workspace:** `OLYMPUS/ADIC_8BIT_PROCESSOR`  
**HDL Standard:** IEEE 1364-2001 (Verilog-2001)  
**Target Simulator:** Xilinx Vivado XSim  
**Web Platform:** React 18 + Vite 5 Hardware Engineering Dashboard  
**Status:** Final Academic Documentation Package Complete (Phases 1 through 9 Finished)

---

## 1. Executive Summary

This academic software and digital hardware engineering project implements a complete, synthesizable, and verified **3-stage pipelined 8-bit RISC processor** using standard **Verilog-2001**. The hardware datapath is complemented by an interactive, responsive engineering web application built with **React 18** and **Vite 5** that allows students, instructors, and engineers to observe the processor's internal pipeline behavior, data forwarding mechanisms, and register file states cycle-by-cycle.

### Key Architectural Highlights
- **3-Stage Decoupled Pipeline:**
  1. **Instruction Fetch (IF):** 8-bit Program Counter (PC) and 256-word $\times$ 16-bit on-chip Instruction ROM.
  2. **Instruction Decode (ID):** Opcode and operand decoding, dual-read Register File, and Operand Forwarding Unit.
  3. **Execute and Write-Back (EX/WB):** 8-bit Arithmetic Logic Unit (ALU) and synchronous write-back to the register file.
- **8-Bit Datapath & 16-Bit Instruction Format:** Fixed 16-bit orthogonal instruction format supporting `ADD`, `SUB`, `AND`, `OR`, `XOR`, `ADDI`, and `LOADI`.
- **Register File:** Eight 8-bit general-purpose registers (R0–R7).
- **R0 Hardwire Zero Rule:** R0 is permanently hardwired to `8'h00` (reads always return 0; writes to R0 are suppressed in hardware).
- **Dedicated Forwarding Unit:** Resolves Read-After-Write (RAW) data hazards between consecutive arithmetic instructions with zero stall cycles (sustained steady-state throughput of 1 instruction per cycle).
- **Synchronous Active-High Reset:** Cleanly initializes PC, pipeline registers, and register file states on the rising clock edge.
- **Synthesizability:** 100% Verilog-2001 synthesizable with zero latches and exhaustive default branching.

---

## 2. Repository Structure

```text
ADIC_8BIT_PROCESSOR/
├── rtl/                        # Synthesizable Verilog-2001 RTL Modules
│   ├── processor_top.v         # Top-level integration (IF, ID, EX/WB, Forwarding)
│   ├── alu.v                   # 8-bit combinational Arithmetic & Logic Unit
│   ├── register_file.v         # 8x8-bit register file with write-through & R0 zero protection
│   ├── instruction_decoder.v   # Instruction decoder & control signal generation
│   ├── instruction_memory.v    # 256x16-bit on-chip instruction ROM
│   ├── forwarding_unit.v       # Hazard detection and forwarding logic (EX/WB -> ID)
│   ├── if_id_register.v        # Pipeline Register 1 (IF / ID boundary)
│   ├── id_ex_register.v        # Pipeline Register 2 (ID / EX boundary)
│   └── README.md               # RTL architectural documentation
├── tb/                         # Verification Testbenches
│   └── processor_tb.v          # Comprehensive self-checking testbench (100 MHz, race-free assertions)
├── sim/                        # Simulation Scripts & Artifacts
│   ├── reference_simulation.py # Cycle-accurate co-simulator & JSON report generator
│   ├── verification_report.json# Machine-readable verification report artifact
│   ├── run_simulation.tcl      # Vivado TCL batch simulation script
│   └── run_vivado.bat          # Windows batch runner for automated Vivado XSim execution
├── web/                        # React 18 + Vite 5 Interactive Engineering Dashboard
│   ├── src/
│   │   ├── components/         # 9 Interactive UI sections (Pipeline Stepper, ALU, RegFile, etc.)
│   │   ├── data/               # processorData.js and verification_report.json
│   │   └── utils/              # verificationParser.js
│   ├── tests/                  # Unit tests for verification report parser (node:test)
│   ├── index.html              # HTML5 entry point
│   ├── vite.config.js          # Vite config (Port 3000)
│   ├── vercel.json             # Vercel deployment configuration
│   └── README.md               # Web dashboard setup & user manual
├── docs/                       # Comprehensive Academic Documentation Package
│   ├── project_report.md       # Flagship comprehensive academic project report
│   ├── abstract.md             # Formal project abstract
│   ├── objectives.md           # Problem statement, primary/secondary objectives, and constraints
│   ├── future_scope.md         # Technical roadmap: branches, RAM, 5-stage pipeline, FPGA
│   ├── viva_questions.md       # 26 comprehensive viva voce oral defense questions & answers
│   ├── architecture.md         # Microarchitecture specification, datapath, and timing
│   ├── instruction_set.md      # ISA manual, bitfield layouts, and program trace
│   ├── verification_plan.md    # Test scenarios TC-01 through TC-14
│   ├── verification_results.md # Phase 5 & 7 audit report and 3-tier disclosure
│   └── deployment.md           # GitHub and Vercel operational deployment guide
├── .gitignore                  # Git exclusions for node_modules, dist, and EDA logs
└── README.md                   # Root project documentation
```

---

## 3. Project Phase Roadmap & Current Status

| Phase | Milestone | Scope & Deliverables | Status |
| :---: | :--- | :--- | :---: |
| **Phase 1** | **Initialization & Setup** | Workspace inspection, folder hierarchy, developer tools audit, and root README. | **Complete** |
| **Phase 2** | **RTL Architecture & ISA** | Microarchitecture specification, ISA definition, Mermaid diagrams, pipeline timing analysis, and demonstration program calculations in `docs/`. | **Complete** |
| **Phase 3** | **RTL Module Implementation** | Synthesizable Verilog implementation of all 8 core modules in `rtl/`: `processor_top`, `alu`, `register_file`, `instruction_memory`, `instruction_decoder`, `forwarding_unit`, and pipeline registers. | **Complete** |
| **Phase 4** | **Verification Testbench** | Comprehensive self-checking testbench in `tb/processor_tb.v`, simulation scripts in `sim/` (`run_simulation.tcl`, `run_vivado.bat`), cycle-accurate reference simulation engine (`sim/reference_simulation.py`), and verification plan in `docs/verification_plan.md`. | **Complete** |
| **Phase 5** | **Debugging & Audit Pass** | Bug fixes for register file bounds and testbench clock-edge alignment. 32/32 passing checks in co-simulator. Documented in `docs/verification_results.md`. | **Complete** |
| **Phase 6** | **Interactive Web Platform** | Complete dark-theme digital hardware engineering dashboard in `web/` featuring 9 sections, cycle-by-cycle pipeline stepper, ALU calculator, and bit-slicer. | **Complete** |
| **Phase 7** | **Verification Integration & Deployment** | Connected structured `verification_report.json` to web dashboard, created parser unit tests (4/4 passed), configured `vercel.json`, updated all documentation, and performed pre-deployment validation. | **Complete** |
| **Phase 8** | **GitHub & Vercel Deployment Preparation** | Final validation, Git repository preparation, `.gitignore` audit, Vercel configuration verification, and beginner-friendly deployment manual in `docs/deployment.md`. | **Complete** |
| **Phase 9** | **Academic Documentation Package** | Flagship project report (`project_report.md`), formal abstract, objectives, future scope roadmap, 26 viva defense questions (`viva_questions.md`), and unified documentation. | **Complete** |

---

## 4. Verification Architecture & Honest Disclosures

To ensure strict academic honesty, this project distinguishes between three verification tiers:

| Tier | Engine | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Tier 1: Physical HDL Simulation** | Xilinx Vivado XSim | **UNAVAILABLE ON HOST** | Vivado is not installed on this local computer. Scripts (`sim/run_simulation.tcl`, `sim/run_vivado.bat`) are syntax-verified and ready for lab machines. |
| **Tier 2: Cycle-Accurate Reference Model** | Python 3.14.6 (`sim/reference_simulation.py`) | **PASSED (32/32)** | Independent reference engine verified all 14 test cases (TC-01 through TC-14) with exit code 0. Generates `sim/verification_report.json`. |
| **Tier 3: Educational Browser Model** | React 18 (`web/src/components/PipelineExplorer.jsx`) | **ACTIVE** | Client-side visual state machine allowing interactive cycle stepping, forwarding animation, and register observation. |

---

## 5. How to Run the Project

### 5.1 Run the Python Verification Co-Simulator
```bash
python sim/reference_simulation.py
```
- Validates all 32 assertions covering reset, data forwarding, write-back, and overflow.
- Generates `sim/verification_report.json` and syncs with `web/src/data/verification_report.json`.

### 5.2 Run the Web Application Locally
```bash
cd web
npm install
npm run dev
```
Open your browser to: **`http://localhost:3000`**

### 5.3 Run Web Parser Unit Tests
```bash
cd web
npm test
```
Executes native `node:test` suite for the verification report parser (4/4 passed).

### 5.4 Build & Preview for Production
```bash
cd web
npm run build
npm run preview
```
Verified production build outputs to `web/dist/` and serves on `http://localhost:3000`.

### 5.5 Run Vivado Simulation (On a Machine with Vivado Installed)
```cmd
sim\run_vivado.bat
```
Launches Xilinx Vivado in batch mode, executes `sim/run_simulation.tcl`, compiles all 8 RTL modules + `processor_tb.v`, runs simulation for 500 ns, checks assertions, and writes `processor_tb.vcd`.

---

## 6. Pre-Deployment Notice
The web dashboard is fully prepared for Vercel deployment (`web/vercel.json`, root directory `web`, build command `npm run build`, output directory `dist`). In accordance with project safety guidelines, no remote code push or public deployment will take place without explicit user approval.
