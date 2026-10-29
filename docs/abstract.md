# Project Abstract

**Project Title:** Design and Verification of a 3-Stage Pipelined 8-Bit RISC Processor Using Verilog HDL  
**Discipline:** Digital Hardware Engineering / Academic Digital Integrated Circuit (ADIC) Design  
**Hardware Description Language:** Verilog-2001 (IEEE 1364-2001)  
**Target Simulator:** Xilinx Vivado XSim  
**Interactive Platform:** React 18 / Vite 5 Web Dashboard  
**Date:** October 2026  

---

## Abstract

Modern digital computing systems rely on pipelined microarchitectures to maximize instruction throughput and frequency. This project presents the complete RTL design, cycle-accurate verification, and interactive web visualization of a 3-stage pipelined 8-bit Reduced Instruction Set Computer (RISC) processor implemented in synthesizable Verilog HDL (IEEE 1364-2001 standard).

The microarchitecture is partitioned into three decoupled synchronous stages: **Instruction Fetch (IF)**, **Instruction Decode / Operand Fetch (ID)**, and **Execute / Write-Back (EX/WB)**, separated by dedicated pipeline registers (`if_id_register` and `id_ex_register`). The processor features an 8-bit datapath, an 8-bit Program Counter addressing a 256-word on-chip ROM, and an orthogonal 16-bit instruction format supporting eight operations (`NOP`, `ADD`, `SUB`, `AND`, `OR`, `XOR`, `ADDI`, and `LOADI`). The register file provides eight 8-bit general-purpose registers (R0–R7) with dual asynchronous read ports, single synchronous write-back, internal write-through bypass, and an architectural hardwired zero rule strictly locking Register R0 to `8'h00`.

To resolve Read-After-Write (RAW) data hazards arising between consecutive dependent instructions, a dedicated combinational **Forwarding Unit** is designed at the EX/WB-to-ID boundary. The forwarding logic dynamically detects register collisions and routes fresh ALU results directly into ID operand multiplexers, sustaining a steady-state throughput of **1 instruction per clock cycle** ($\text{CPI} = 1.0$) with zero pipeline stall cycles or inserted bubbles.

Verification is implemented via a rigorous **three-tier methodology**: (1) an automated self-checking Verilog testbench in `tb/processor_tb.v` with race-free negative-edge sampling and Vivado batch simulation scripts; (2) an independent cycle-accurate reference co-simulator in Python (`sim/reference_simulation.py`) executing 32 assertion checks with a 100% pass rate; and (3) an interactive digital hardware engineering web dashboard built with React 18 and Vite 5 featuring an interactive cycle-by-cycle pipeline stepper, ALU calculator, bitfield instruction slicer, and live verification report parser. Full architectural specifications, test plans, and pre-deployment configurations for GitHub and Vercel are provided.

