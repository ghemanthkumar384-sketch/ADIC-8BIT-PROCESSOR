# ADIC 8-Bit Pipelined Processor Interactive Dashboard

A modern, responsive hardware engineering web dashboard demonstrating the architecture, instruction set, data forwarding unit, register file, and verification results of our academic **3-Stage Pipelined 8-Bit RISC Processor** designed in Verilog-2001.

Built with **React 18**, **Vite 5**, and a custom dark-theme digital hardware engineering design system.

---

## 1. Quick Start (Run Locally)

### Prerequisites
- **Node.js**: v18.0.0 or higher (Host system has `v24.18.0` installed)
- **npm**: v9.0.0 or higher (Host system has `v11.16.0` installed)

### Start Development Server
```bash
# Navigate to the web application directory
cd web

# Install dependencies (already installed)
npm install

# Launch Vite local development server
npm run dev
```
The application starts at:  
👉 **`http://localhost:3000`** (Port 3000 configured in `web/vite.config.js`)

### Run Automated Unit Tests
To run unit tests for the verification report parser:
```bash
npm test
```
- **Test File**: `web/tests/verificationParser.test.js`
- **Runner**: Native `node:test` (4 tests, 0 failures, 131 ms execution time)

### Build for Production
To create an optimized production bundle:
```bash
npm run build
```
- **Build Command**: `vite build`
- **Output Directory**: `web/dist/`
- **Asset Size**: ~282 kB JS (76 kB gzip), ~7 kB CSS (2.2 kB gzip).

To preview the production build locally:
```bash
npm run preview
```
Serves the `dist/` directory at `http://localhost:3000` (responds with `HTTP/1.1 200 OK`).

---

## 2. Vercel Deployment

The application is pre-configured for instant deployment on **Vercel** via [`web/vercel.json`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/web/vercel.json):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Deployment Settings:
- **Framework Preset**: `Vite`
- **Root Directory**: `web`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: `18.x` or `20.x`
- **Environment Variables**: None required

*Note: In accordance with project safety guidelines, no remote code push or public deployment will be performed without explicit user approval.*

---

## 3. Interactive Dashboard Features

The dashboard provides 9 dedicated engineering sections:

1. **Project Overview**:
   - Academic context, architectural summary, datapath width, pipeline stages, and core specifications.
2. **Processor Architecture**:
   - Interactive structural block diagram illustrating IF, ID, and EX/WB stages, pipeline registers (`if_id_register`, `id_ex_register`), and the EX/WB $\rightarrow$ ID data forwarding bus.
   - Click-to-inspect feature for every pipeline module with detailed port listings and timing constraints.
3. **Instruction Set & Interactive Decoder**:
   - Visual 16-bit bitfield breakdowns for R-Type, ADDI, and LOADI formats.
   - Opcode reference table with RTL operations and control signal generation.
   - **Interactive Instruction Decoder Sandbox**: Type any 16-bit hexadecimal instruction (e.g., `0x7205`, `0x6443`, `0x1650`, `0x28C8`, `0x70FF`, `0xF000`) to see real-time bitfield slicing, register index extraction, immediate sign-extension, and generated control signals.
4. **Register File Viewer & Write Sandbox**:
   - Real-time display of all 8 general purpose registers (R0-R7) in Hex, Decimal, and 8-bit Binary.
   - Visual indicator for Register R0 (hardwired ground protection).
   - **Interactive Write Test Sandbox**: Test writing values to any register. Attempting to write to R0 demonstrates genuine hardware protection where writes to `waddr == 3'b000` are suppressed.
5. **ALU Explorer**:
   - Interactive 8-bit calculator supporting ADD, SUB, AND, OR, XOR, ADDI, and LOADI.
   - Sliders and numeric inputs for Operand A and Operand B.
   - Real-time computation of Zero flag (`Z`), Negative flag (`N`), and Modulo-256 overflow and borrow/underflow wrapping.
   - One-click presets for arithmetic overflow (`255 + 1 = 0`) and borrow underflow (`0 - 1 = 255`).
6. **Cycle-by-Cycle Pipeline Stepper**:
   - Interactive step-by-step execution through all 12 cycles of the deterministic demonstration program.
   - Controls: Step Forward, Step Backward, Auto-Play (with selectable playback speed: 0.8s, 1.5s, 2.0s), and Reset.
   - Clickable cycle timeline bar (Cycles 1 to 12).
   - Real-time concurrent inspection of Stage 1 (IF), Stage 2 (ID), and Stage 3 (EX/WB).
   - **Prominent Forwarding Hazard Alert**: Automatically pulses and highlights when distance-1 RAW hazards are detected on `fwd_a` or `fwd_b`, showing how `ex_alu_result` is bypassed to resolve hazards in zero stall cycles.
   - Live register file strip showing register state after every clock cycle.
   - Clear, beginner-friendly hardware commentary explaining microarchitectural behavior at each step.
7. **Verification Center**:
   - Connects to machine-readable [`web/src/data/verification_report.json`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/web/src/data/verification_report.json).
   - Strictly delineates the **Three Verification Tiers**:
     1. **Physical HDL Simulation**: UNAVAILABLE ON HOST (Xilinx Vivado is not installed on this machine).
     2. **Python Reference Model**: PASSED (32/32 assertions passed in `sim/reference_simulation.py`).
     3. **Educational Browser Model**: ACTIVE (12-cycle interactive JavaScript simulation).
   - 32/32 passing assertions across 14 comprehensive test cases (TC-01 through TC-14).
   - One-click copyable reproduction commands for the Python reference co-simulator and Vivado batch runner.
8. **Synthesizable Verilog Source Code Viewer**:
   - Tabbed viewer for all 8 RTL modules and the testbench:
     - `processor_top.v`
     - `alu.v`
     - `register_file.v`
     - `forwarding_unit.v`
     - `instruction_decoder.v`
     - `instruction_memory.v`
     - `if_id_register.v`
     - `id_ex_register.v`
     - `processor_tb.v`
   - Formatted syntax viewing with line numbers and one-click clipboard copying.
9. **Documentation Viewer**:
   - In-app tabbed reader for `architecture.md`, `instruction_set.md`, `verification_plan.md`, and `verification_results.md`.

---

## 4. Technology Stack

- **Framework**: React 18 (`react`, `react-dom`)
- **Build Tool**: Vite 5 (`vite`, `@vitejs/plugin-react`)
- **Icons**: Lucide React (`lucide-react`)
- **Typography**: `Inter` (sans-serif) and `JetBrains Mono` (monospace) via Google Fonts
- **Theme**: Dark engineering dashboard with CSS custom properties (variables)
- **Zero Heavy External UI Dependencies**: Fully customized and optimized for instant load times and zero build configuration fragility.
