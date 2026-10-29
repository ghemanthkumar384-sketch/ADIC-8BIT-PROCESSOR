# Project Objectives & Problem Statement

**Project:** ADIC_8BIT_PROCESSOR  
**Document:** `docs/objectives.md`  
**Discipline:** Digital Hardware Architecture & Academic RTL Design  

---

## 1. Problem Statement

In single-cycle processor architectures, every instruction must complete instruction fetch, instruction decode, operand reading, ALU execution, and register write-back within a single clock period. Consequently:
1. **Long Critical Path:** The maximum operating clock frequency is constrained by the slowest instruction, creating high cycle times.
2. **Suboptimal Hardware Utilization:** During any specific moment of instruction execution, large segments of the datapath (such as the ALU or Instruction Memory) sit completely idle.
3. **Multi-Cycle Limitations:** Traditional multi-cycle architectures shorten the clock period by distributing execution across multiple clock cycles, but suffer from a high Cycles Per Instruction ($\text{CPI} > 1$), reducing effective instruction throughput.

**The Solution:** Pipelining overlaps the execution of multiple instructions across dedicated hardware stages. However, introducing pipeline registers exposes the datapath to **pipeline hazards**—most notably **Read-After-Write (RAW) data hazards**, where a consumer instruction requires a register value that is currently being computed by an earlier instruction in the pipeline. Without dedicated hardware resolution, the pipeline must stall and insert dead cycles ("bubbles"), degrading throughput.

---

## 2. Primary Project Objectives

1. **Synthesizable RTL Design:**
   - Design and implement a complete 3-stage pipelined 8-bit RISC microprocessor using strictly standard-compliant **Verilog-2001 (IEEE 1364-2001)**.
   - Partition the microarchitecture into three clean synchronous stages: **Instruction Fetch (IF)**, **Instruction Decode (ID)**, and **Execute & Write-Back (EX/WB)**, separated by dedicated pipeline registers (`if_id_register` and `id_ex_register`).

2. **Orthogonal Instruction Set Architecture (ISA):**
   - Define a fixed 16-bit instruction format supporting eight operations:
     - Register-to-Register Arithmetic: `ADD`, `SUB`.
     - Register-to-Register Bitwise Logic: `AND`, `OR`, `XOR`.
     - Immediate Arithmetic: `ADDI` (6-bit sign-extended immediate).
     - Immediate Load: `LOADI` (8-bit immediate byte).
     - Control: `NOP` (and safe default handling for unmapped opcodes `0x8` to `0xF`).

3. **Robust Register File Design:**
   - Implement an eight-register storage array (R0 through R7), each 8 bits wide.
   - Enforce an architectural **hardwired zero rule**: Register R0 must always read as `8'h00` and all write attempts to R0 must be suppressed in hardware.
   - Provide dual asynchronous read ports and single synchronous write-back with internal write-through bypass.

4. **Zero-Stall Data Forwarding Unit:**
   - Design a dedicated combinational **Forwarding Unit** operating across the EX/WB $\rightarrow$ ID stage boundary.
   - Detect distance-1 RAW hazards dynamically and bypass fresh ALU results directly into ID operand multiplexers within the same clock cycle, achieving a sustained throughput of **1 instruction per cycle** ($\text{CPI} = 1.0$) with zero bubbles.

5. **Self-Checking Verification Testbench:**
   - Develop a comprehensive, automated self-checking Verilog testbench ([`tb/processor_tb.v`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/tb/processor_tb.v)) driven by a 100 MHz clock (10 ns period).
   - Employ race-free negative clock edge sampling (`negedge clk`) with automated assertions against expected golden register values.
   - Generate batch simulation automation scripts ([`sim/run_simulation.tcl`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/sim/run_simulation.tcl) and [`sim/run_vivado.bat`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/sim/run_vivado.bat)) for Xilinx Vivado XSim.

6. **Independent Cycle-Accurate Co-Simulator:**
   - Implement an independent cycle-accurate reference model in Python ([`sim/reference_simulation.py`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/sim/reference_simulation.py)) to validate microarchitectural timing and generate machine-readable JSON reports ([`sim/verification_report.json`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/sim/verification_report.json)).

7. **Interactive Web Demonstration Platform:**
   - Construct a modern, dark-themed digital hardware engineering dashboard in `web/` using **React 18** and **Vite 5**.
   - Provide interactive features: cycle-by-cycle pipeline stepper with hazard animation, interactive ALU calculator, 16-bit instruction bit-slicer, live register file viewer, and Verilog source code explorer.

---

## 3. Secondary & Academic Objectives

- **100% Latch-Free Synthesis Readiness:** Guarantee complete sensitivity lists and exhaustive `default` case coverage to eliminate unintended hardware latches.
- **Academic Verification Integrity:** Strictly adhere to a **three-tier verification philosophy**, clearly distinguishing physical HDL simulation (Tier 1), Python reference modeling (Tier 2), and browser educational visualization (Tier 3).
- **Deployment & Cloud Readiness:** Provide zero-configuration pre-deployment specifications for **Vercel** (`web/vercel.json`) and **GitHub**, complete with comprehensive operational manuals in `docs/deployment.md`.

---

## 4. Hardware Constraints & Success Criteria

| Design Metric | Architectural Specification | Success Verification Method |
| :--- | :--- | :--- |
| **HDL Standard** | Verilog-2001 (IEEE 1364-2001) | Static linting; zero vendor-specific IP or SystemVerilog constructs. |
| **Datapath Width** | 8 bits | Modulo-256 arithmetic wrap-around confirmed ($255 + 1 \equiv 0$, $0 - 1 \equiv 255$). |
| **Instruction Width** | 16 bits fixed | Zero bitfield overlap across R-Type, ADDI, and LOADI formats. |
| **Clock Target** | 100 MHz (10 ns period) | Testbench clock generation `#5 clk = ~clk;`. |
| **Reset Paradigm** | Synchronous active-high (`rst`) | Confirmed all registers clear on `posedge clk` when `rst == 1`. |
| **R0 Protection** | Hardwired ground (`8'h00`) | Write attempts to `waddr == 3'b000` ignored; verified via testbench & co-sim. |
| **RAW Hazard Latency** | 0 stall cycles (Forwarding) | Distance-1 dependencies execute in consecutive cycles without bubbles. |
| **Web Build** | Production ready | Vite production build compiles with 0 errors and 0 warnings. |

