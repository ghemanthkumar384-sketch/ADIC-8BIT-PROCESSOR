# Comprehensive Viva Voce & Oral Defense Examination Guide

**Project:** ADIC_8BIT_PROCESSOR (3-Stage Pipelined 8-Bit RISC Processor)  
**Document:** `docs/viva_questions.md`  
**Purpose:** Oral examination preparation for academic defense, viva voce, and technical hardware engineering interviews.  

---

## Category 1: Processor & Pipelining Fundamentals

### Q1. What is pipelining, and why do we use it in computer processors?
**Answer:**  
Pipelining is a technique where the hardware overlaps the execution of multiple instructions simultaneously, just like an industrial assembly line or doing laundry in overlapping stages.  
Instead of waiting for one instruction to complete all of its steps (fetch, decode, execute, and write-back) before starting the next one, a pipelined processor works on different parts of multiple instructions on every clock cycle.  
**Advantage:** While the total time (latency) for any single instruction remains the same, the overall throughput increases dramatically, completing **one instruction every clock cycle** ($\text{CPI} = 1.0$) in steady state.

---

### Q2. What are the three stages of our processor, and what does each stage do?
**Answer:**  
Our processor divides instruction execution into three synchronous stages:
1. **Instruction Fetch (IF):** Reads the 16-bit instruction word from on-chip ROM using the 8-bit Program Counter (PC), and calculates $\text{PC} + 1$.
2. **Instruction Decode (ID):** Breaks down the 16-bit instruction into opcode, destination register $Rd$, source registers $Rs$ and $Rt$, and immediate values. Reads operands from the Register File and evaluates forwarding conditions.
3. **Execute & Write-Back (EX/WB):** Performs the arithmetic or logical calculation in the 8-bit ALU and synchronously writes the calculated result back into destination register $Rd$ on the rising clock edge.

---

### Q3. What is the difference between latency and throughput in a pipelined processor?
**Answer:**  
- **Latency:** The total time taken for an individual instruction to travel from start to finish. In our 3-stage processor, each instruction takes 3 clock cycles (30 ns at 100 MHz) from fetch to write-back.
- **Throughput:** The rate at which the processor completes instructions. Once the pipeline is filled (Cycle 3 onwards), **one instruction completes every clock cycle** (10 ns per instruction), giving a throughput of 100 million instructions per second (100 MIPS).

---

### Q4. What is a pipeline register, and why is it necessary?
**Answer:**  
A pipeline register is an array of flip-flops placed between two adjacent pipeline stages (e.g., `if_id_register` between IF and ID; `id_ex_register` between ID and EX/WB).  
**Why it is necessary:** Without pipeline registers, signals would propagate straight through combinational logic from ROM to ALU, creating one huge critical path. Pipeline registers store the intermediate state at the end of each clock cycle, allowing Stage 1 to work on instruction $N+1$ while Stage 2 works on instruction $N$ without overwriting each other's data!

---

### Q5. What is a pipeline "bubble" or "stall"?
**Answer:**  
A bubble (or stall) is an empty slot or NOP (No-Operation) injected into a pipeline stage when an instruction cannot proceed due to a dependency or hazard. A bubble wastes a clock cycle because no useful work is committed in that stage. In this project, our **Forwarding Unit completely eliminates data hazard bubbles** for consecutive dependent arithmetic instructions!

---

## Category 2: Pipeline Hazards & Forwarding Mechanics

### Q6. What is a Data Hazard, and specifically what is a Read-After-Write (RAW) hazard?
**Answer:**  
A data hazard occurs when an instruction depends on the result of an earlier instruction that has not yet committed its result to the register file.  
A **Read-After-Write (RAW)** hazard happens when:
- Instruction 1 produces a value: `LOADI R1, 5` (writes to R1).
- Instruction 2 immediately consumes that value: `ADDI R2, R1, 3` (reads from R1).  
Because Instruction 1 does not write to the register file until the end of its EX/WB stage, Instruction 2 (entering ID in the very next cycle) would read old, stale data if it only read from the physical register file!

---

### Q7. How does our processor resolve RAW data hazards without stalling?
**Answer:**  
Our processor uses **Internal Data Forwarding (Bypassing)**.  
Instead of waiting for the producer instruction to write its result back to the physical register file at the next clock edge, the Forwarding Unit detects that the producer's destination register matches the consumer's source register. It immediately routes the fresh ALU result directly from the output of Stage 3 (EX/WB) back into the input multiplexers of Stage 2 (ID) in the same clock cycle!

---

### Q8. What are the exact boolean conditions for asserting forwarding signals `forward_a` and `forward_b`?
**Answer:**  
In [`rtl/forwarding_unit.v`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/rtl/forwarding_unit.v), forwarding is asserted when ALL of the following six conditions are met:
1. Consumer instruction in ID is valid: `id_valid == 1'b1`.
2. Producer instruction in EX/WB is valid: `ex_valid == 1'b1`.
3. Producer actually updates a register: `ex_reg_write == 1'b1`.
4. Producer target is NOT Register R0: `ex_rd != 3'b000`.
5. Consumer actually reads source register $Rs$ (or $Rt$): `id_uses_rs == 1'b1`.
6. Consumer register address matches producer register address: `id_rs == ex_rd` (or `id_rt == ex_rd`).

```verilog
assign forward_a = id_valid && ex_valid && ex_reg_write &&
                   (ex_rd != 3'b000) && id_uses_rs && (id_rs == ex_rd);

assign forward_b = id_valid && ex_valid && ex_reg_write &&
                   (ex_rd != 3'b000) && id_uses_rt && (id_rt == ex_rd);
```

---

### Q9. Why must the forwarding condition check `ex_rd != 3'b000`?
**Answer:**  
Register R0 is an architectural constant hardwired to zero (`8'h00`).  
If an instruction specifies R0 as its destination (e.g., `LOADI R0, 255`), the write is suppressed by the register file. If the forwarding unit did not check `ex_rd != 3'b000`, a subsequent instruction that reads R0 (which should always receive 0) would incorrectly receive the forwarded non-zero value `255`! Checking `ex_rd != 3'b000` ensures R0 never forwards illegitimate values.

---

### Q10. What is the difference between Forwarding and Internal Write-Through Bypass?
**Answer:**  
- **Forwarding (Stage 3 $\rightarrow$ Stage 2):** Solves **distance-1 hazards** where Instruction $N$ is in EX/WB while Instruction $N+1$ is in ID.
- **Internal Write-Through Bypass (inside Register File):** Solves the case where a write and a read happen to the exact same register in the **same cycle**. If write-enable (`wen`) is active and `waddr == raddr1`, the register file immediately routes `wdata` directly to `rdata1` rather than returning the stale memory array contents.

---

## Category 3: Instruction Set & Datapath Architecture

### Q11. Describe our instruction format. What is the width of an instruction, and how is it divided?
**Answer:**  
Every instruction is **16 bits wide** (`[15:0]`). There are three formats:
1. **R-Type (ADD, SUB, AND, OR, XOR):**
   - Opcode: `[15:12]` (4 bits)
   - Destination Rd: `[11:9]` (3 bits)
   - Source 1 Rs: `[8:6]` (3 bits)
   - Source 2 Rt: `[5:3]` (3 bits)
   - Unused: `[2:0]` (3 bits reserved as `3'b000`)
2. **I-Type A (ADDI):**
   - Opcode: `[15:12]` (`4'h6`)
   - Destination Rd: `[11:9]` (3 bits)
   - Source 1 Rs: `[8:6]` (3 bits)
   - Signed Immediate Imm6: `[5:0]` (6 bits, sign-extended to 8 bits)
3. **I-Type B (LOADI):**
   - Opcode: `[15:12]` (`4'h7`)
   - Destination Rd: `[11:9]` (3 bits)
   - Unsigned Immediate Imm8: `[7:0]` (8 bits, occupying bits `[7:0]`)

---

### Q12. How does sign extension work for `ADDI`, and why is it necessary?
**Answer:**  
In `ADDI`, the immediate constant `imm6` is only 6 bits wide (representing signed values from $-32$ to $+31$), but the ALU operates on 8-bit operands.  
To preserve the mathematical value and sign, bit 5 (the sign bit) is replicated across the top two bits:
```verilog
assign imm6_ext = {{2{instruction[5]}}, instruction[5:0]};
```
For example:
- Positive `+3` ($000011_2$) becomes $00000011_2$ (`8'h03`).
- Negative `-1` ($111111_2$) becomes $11111111_2$ (`8'hFF`).

---

### Q13. How does `LOADI` pass its immediate value through the ALU?
**Answer:**  
In `processor_top.v`, when `id_opcode == 4'h7` (`LOADI`):
- `id_opA` is forced to `8'h00`.
- `id_opB` receives `id_imm8` (`instruction[7:0]`).  
In `alu.v`, when `alu_op == OP_LOADI`, the ALU simply assigns `result = b`. This cleanly passes the 8-bit immediate byte directly to the write-back bus with zero extra hardware!

---

### Q14. What happens when an unmapped or illegal opcode (e.g., `0xF000`) is fetched?
**Answer:**  
The processor implements a **safe default architectural policy**. In [`rtl/instruction_decoder.v`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/rtl/instruction_decoder.v), the `default` case sets:
- `reg_write = 1'b0;`
- `uses_rs = 1'b0;`
- `uses_rt = 1'b0;`  
Because `reg_write` is cleared to `0`, the instruction is safely neutralized into a NOP. No registers are modified, and the pipeline continues sequentially without crashing or locking up.

---

### Q15. How does Register R0 behave, and how is it implemented in Verilog?
**Answer:**  
Architecturally, Register R0 is hardwired to `8'h00`.  
In [`rtl/register_file.v`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/rtl/register_file.v):
1. **Reads:** Any read request to address `3'b000` evaluates as `8'h00` via ternary logic:
   ```verilog
   assign rdata1 = (raddr1 == 3'b000) ? 8'h00 : ... ;
   ```
2. **Writes:** Any write attempt where `waddr == 3'b000` is blocked by an explicit condition:
   ```verilog
   if (wen && (waddr != 3'b000)) begin
       regs[waddr] <= wdata;
   end
   ```
3. Direct output tap: `assign r0 = 8'h00;`.

---

## Category 4: ALU Design & Arithmetic Behavior

### Q16. How does 8-bit modulo arithmetic handle overflow and underflow in our ALU?
**Answer:**  
Because the datapath is strictly 8 bits wide, operations wrap around modulo $2^8 = 256$:
- **Addition Overflow:** $255 + 1 = 256 \equiv 0 \pmod{256}$ (`8'hFF + 8'h01 = 8'h00`).
- **Subtraction Underflow/Borrow:** $0 - 1 = -1 \equiv 255 \pmod{256}$ (`8'h00 - 8'h01 = 8'hFF`).  
The ALU assigns the 8-bit lower result `result = a + b` or `result = a - b`, automatically truncating any carry-out into bit 8.

---

### Q17. Is the ALU combinational or sequential? Why?
**Answer:**  
The ALU is **100% combinational**.  
It is sensitive to any changes in its inputs (`always @(*)`) and computes `result` within the same clock period. Pipelining decouples the timing so that the entire clock period of Stage 3 is available for the ALU propagation delay, before `result` is latched into the Register File at the next rising clock edge.

---

### Q18. How do we ensure that the ALU does not infer unintended latches during synthesis?
**Answer:**  
Unintended latches are avoided by two critical RTL design rules:
1. Complete sensitivity list: Using `always @(*)` in Verilog-2001 ensures all read signals trigger re-evaluation.
2. Complete assignment coverage: Assigning `result` in every single branch of the `case` statement, and including an explicit `default: result = 8'h00;` branch.

---

## Category 5: Verilog HDL & RTL Design Rules

### Q19. What is the difference between blocking (`=`) and non-blocking (`<=`) assignments, and where should each be used?
**Answer:**  
- **Non-blocking (`<=`):** Evaluates all right-hand sides concurrently and updates left-hand sides at the end of the simulation time step. **Must be used for sequential logic** clocked by `always @(posedge clk)` to model flip-flops and prevent simulation race conditions.
- **Blocking (`=`):** Executes sequentially in order, like standard software code. **Must be used for combinational logic** in `always @(*)` blocks (such as the ALU or decoder).

---

### Q20. Is the reset in our processor synchronous or asynchronous? What are the tradeoffs?
**Answer:**  
Our processor uses a **synchronous active-high reset** (`always @(posedge clk)` with `if (rst)`).  
- **Synchronous Reset Tradeoff:** Only takes effect on the rising clock edge. It is completely immune to runt glitches or noise on the reset wire and produces cleaner static timing analysis in modern FPGA synthesis tools.
- **Asynchronous Reset Tradeoff:** Resets immediately without needing a clock, but can suffer from metastability if reset deassertion violates flip-flop recovery and removal times.

---

### Q21. Why did we declare `reg [7:0] regs [0:7];` instead of `regs [1:7];` in `register_file.v`?
**Answer:**  
In earlier revisions, registers were declared as `regs [1:7]` because R0 was hardwired. However, strict simulators (like Verilator or Vivado strict linting) evaluate ternary read array indices eagerly and generate an out-of-bounds warning when `raddr == 3'b000`. Declaring `regs [0:7]` allocates physical array bounds for index 0, eliminating warnings while strictly enforcing the architectural zero-lock through write suppression.

---

## Category 6: Verification & Testbench Architecture

### Q22. How does `tb/processor_tb.v` achieve race-free sampling?
**Answer:**  
In hardware, flip-flops change outputs immediately after the rising clock edge (`posedge clk`). If a testbench attempts to check values at the exact same `posedge clk`, a simulation delta-race condition occurs (sampling old vs new value).  
Our testbench avoids this by:
1. Checking assertions on the **negative clock edge** (`@(negedge clk)`), exactly half a period (5 ns) away from any posedge transitions.
2. Adding a small `#1` delta delay after edges to ensure combinational outputs (like forwarding multiplexers) have completely stabilized.

---

### Q23. What program is preloaded into the on-chip Instruction Memory, and what does it test?
**Answer:**  
The ROM contains a 10-instruction deterministic test program:
- `0x00: LOADI R1, 5` &rarr; Loads immediate 5 into R1.
- `0x01: ADDI R2, R1, 3` &rarr; Distance-1 hazard on R1! Forwarded from EX/WB ($5 + 3 = 8$).
- `0x02: ADD R3, R1, R2` &rarr; Distance-1 hazard on R2! Forwarded from EX/WB ($5 + 8 = 13$).
- `0x03: SUB R4, R3, R1` &rarr; Distance-1 hazard on R3! Forwarded from EX/WB ($13 - 5 = 8$).
- `0x04: AND R5, R3, R2` &rarr; Bitwise AND ($13 \land 8 = 8$).
- `0x05: OR R6, R1, R2` &rarr; Bitwise OR ($5 \lor 8 = 13$).
- `0x06: XOR R7, R3, R2` &rarr; Bitwise XOR ($13 \oplus 8 = 5$).
- `0x07: LOADI R0, 255` &rarr; R0 write-protection test (write discarded; R0 stays 0).
- `0x08: 0xF000` &rarr; Unmapped opcode test (safe NOP).
- `0x09+: NOP` &rarr; Pipeline drain.

---

### Q24. What are the final golden register values after the demonstration program finishes?
**Answer:**  
- **R0:** `0` (`8'h00`) &bull; *Preserved zero*
- **R1:** `5` (`8'h05`)
- **R2:** `8` (`8'h08`)
- **R3:** `13` (`8'h0D`)
- **R4:** `8` (`8'h08`)
- **R5:** `8` (`8'h08`)
- **R6:** `13` (`8'h0D`)
- **R7:** `5` (`8'h05`)

---

### Q25. What is our "Three-Tier Verification Philosophy"?
**Answer:**  
It is an academic honesty framework that prevents misrepresenting simulation results:
1. **Tier 1 (Physical HDL Simulation):** Real gate/RTL execution in Xilinx Vivado XSim. Transparently labeled as *UNAVAILABLE ON HOST* because Vivado is not installed on this specific machine.
2. **Tier 2 (Cycle-Accurate Reference Model):** Independent Python 3 engine (`sim/reference_simulation.py`) executing 32 assertion checks with a 100% pass rate. Confirms microarchitectural logic, but is explicitly distinguished from real HDL simulation.
3. **Tier 3 (Educational Browser Model):** Client-side React 18 interactive state machine in `web/` allowing students to visualize the pipeline cycles interactively.

---

### Q26. If a faculty examiner asks: "Can this processor execute a program from RAM or jump to a loop?", how should you answer?
**Answer:**  
"In this academic baseline implementation, the processor is a 3-stage feed-forward arithmetic core: instructions are fetched from on-chip ROM, and all instructions execute sequentially with zero-stall forwarding.  
Adding conditional branches (`BEQ`/`BNE`) and data memory (`LOAD`/`STORE`) is formally documented as our next technical roadmap milestone in `docs/future_scope.md`. Specifically, adding branches requires adding pipeline flush logic in Stage 1/2, and adding data memory introduces load-use hazards requiring a 1-cycle stall bubble."

