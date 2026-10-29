`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Project Name:   ADIC_8BIT_PROCESSOR
// Module Name:    processor_top
// Language:       Verilog-2001
// Description:    Top-Level Module for 3-Stage Pipelined 8-Bit RISC Processor.
//
// Pipeline Architecture:
//   - Stage 1: Instruction Fetch (IF)
//       Instantiates instruction_memory and Program Counter (PC)
//   - Pipeline Register 1: if_id_register
//   - Stage 2: Instruction Decode & Register Read (ID)
//       Instantiates instruction_decoder, register_file, and forwarding_unit
//   - Pipeline Register 2: id_ex_register
//   - Stage 3: Execute and Write-Back (EX/WB)
//       Instantiates 8-bit alu and synchronous register file write-back
//
// Features:
//   - 8-bit Datapath, 16-bit Instruction Width, 8-bit PC (256 ROM words)
//   - Eight 8-bit General Purpose Registers (R0-R7) with R0 hardwired to zero
//   - Supported Instructions: NOP, ADD, SUB, AND, OR, XOR, ADDI, LOADI
//   - Data forwarding resolving RAW hazards with zero stall cycles
//   - Synchronous active-high reset (rst)
//   - 100% Verilog-2001 synthesizable; zero unintended latches
//////////////////////////////////////////////////////////////////////////////////

module processor_top (
    input  wire        clk,                 // System clock (100 MHz target)
    input  wire        rst,                 // Synchronous active-high reset

    // Observability & Verification Ports
    output wire [7:0]  pc_out,              // Current Program Counter in IF stage
    output wire [15:0] instruction_out,     // Current instruction fetched in IF stage
    output wire [7:0]  r0,                  // Register R0 (hardwired 8'h00)
    output wire [7:0]  r1,                  // Register R1
    output wire [7:0]  r2,                  // Register R2
    output wire [7:0]  r3,                  // Register R3
    output wire [7:0]  r4,                  // Register R4
    output wire [7:0]  r5,                  // Register R5
    output wire [7:0]  r6,                  // Register R6
    output wire [7:0]  r7,                  // Register R7

    // Pipeline Monitoring Signals
    output wire        if_id_valid_out,     // ID stage valid flag
    output wire        id_ex_valid_out,     // EX/WB stage valid flag
    output wire [7:0]  ex_alu_result_out,   // ALU computation result
    output wire        fwd_a_out,           // Forwarding active on operand A
    output wire        fwd_b_out            // Forwarding active on operand B
);

    //==========================================================================
    // STAGE 1: INSTRUCTION FETCH (IF)
    //==========================================================================
    reg  [7:0]  pc;
    wire [7:0]  pc_next;
    wire [15:0] rom_instruction;

    // Normal execution advances PC by 1 word per cycle
    assign pc_next = pc + 8'd1;

    always @(posedge clk) begin
        if (rst) begin
            pc <= 8'h00;
        end else begin
            pc <= pc_next;
        end
    end

    // Instruction Memory (256 x 16-bit ROM containing demonstration program)
    instruction_memory u_imem (
        .addr        (pc),
        .instruction (rom_instruction)
    );

    //==========================================================================
    // PIPELINE REGISTER 1: IF / ID REGISTER
    //==========================================================================
    wire        id_valid;
    wire [7:0]  id_pc;
    wire [15:0] id_instruction;

    if_id_register u_if_id (
        .clk            (clk),
        .rst            (rst),
        .if_valid       (!rst),
        .if_pc          (pc),
        .if_instruction (rom_instruction),
        .id_valid       (id_valid),
        .id_pc          (id_pc),
        .id_instruction (id_instruction)
    );

    //==========================================================================
    // STAGE 2: INSTRUCTION DECODE (ID) & OPERAND FETCH
    //==========================================================================
    wire [3:0] id_opcode;
    wire [2:0] id_rd;
    wire [2:0] id_rs;
    wire [2:0] id_rt;
    wire [7:0] id_imm6_ext;
    wire [7:0] id_imm8;
    wire       id_reg_write;
    wire       id_uses_rs;
    wire       id_uses_rt;

    // Instruction Decoder
    instruction_decoder u_decoder (
        .instruction (id_instruction),
        .valid_in    (id_valid),
        .opcode      (id_opcode),
        .rd          (id_rd),
        .rs          (id_rs),
        .rt          (id_rt),
        .imm6_ext    (id_imm6_ext),
        .imm8        (id_imm8),
        .reg_write   (id_reg_write),
        .uses_rs     (id_uses_rs),
        .uses_rt     (id_uses_rt)
    );

    // Forward declarations from Stage 3 (EX/WB) for write-back and forwarding
    wire       ex_valid;
    wire [2:0] ex_rd;
    wire       ex_reg_write;
    wire [7:0] ex_alu_result;

    // Register File (8 x 8-bit with hardwired zero R0)
    wire [7:0] rf_rdata1;
    wire [7:0] rf_rdata2;

    register_file u_rf (
        .clk    (clk),
        .rst    (rst),
        .raddr1 (id_rs),
        .rdata1 (rf_rdata1),
        .raddr2 (id_rt),
        .rdata2 (rf_rdata2),
        .wen    (ex_valid && ex_reg_write),
        .waddr  (ex_rd),
        .wdata  (ex_alu_result),
        .r0     (r0),
        .r1     (r1),
        .r2     (r2),
        .r3     (r3),
        .r4     (r4),
        .r5     (r5),
        .r6     (r6),
        .r7     (r7)
    );

    // Forwarding Unit (detects RAW hazard between EX/WB producer and ID consumer)
    wire forward_a;
    wire forward_b;

    forwarding_unit u_fwd (
        .id_valid     (id_valid),
        .id_uses_rs   (id_uses_rs),
        .id_uses_rt   (id_uses_rt),
        .id_rs        (id_rs),
        .id_rt        (id_rt),
        .ex_valid     (ex_valid),
        .ex_reg_write (ex_reg_write),
        .ex_rd        (ex_rd),
        .forward_a    (forward_a),
        .forward_b    (forward_b)
    );

    // Forwarding Multiplexers: select fresh EX/WB result or Register File read data
    wire [7:0] opA_fwd = forward_a ? ex_alu_result : rf_rdata1;
    wire [7:0] opB_fwd = forward_b ? ex_alu_result : rf_rdata2;

    // Final operand preparation for ID/EX pipeline register
    reg [7:0] id_opA;
    reg [7:0] id_opB;

    localparam OP_ADDI  = 4'h6;
    localparam OP_LOADI = 4'h7;

    always @(*) begin
        case (id_opcode)
            OP_LOADI: begin
                id_opA = 8'h00;
                id_opB = id_imm8;       // Imm8 directly to ALU operand B
            end
            OP_ADDI: begin
                id_opA = opA_fwd;       // Rs (or forwarded from EX/WB)
                id_opB = id_imm6_ext;   // Sign-extended 6-bit immediate
            end
            default: begin
                id_opA = opA_fwd;       // Rs (or forwarded from EX/WB)
                id_opB = opB_fwd;       // Rt (or forwarded from EX/WB)
            end
        endcase
    end

    //==========================================================================
    // PIPELINE REGISTER 2: ID / EX REGISTER
    //==========================================================================
    wire [7:0] ex_pc;
    wire [3:0] ex_opcode;
    wire [7:0] ex_opA;
    wire [7:0] ex_opB;

    id_ex_register u_id_ex (
        .clk          (clk),
        .rst          (rst),
        .id_valid     (id_valid),
        .id_pc        (id_pc),
        .id_opcode    (id_opcode),
        .id_rd        (id_rd),
        .id_reg_write (id_reg_write),
        .id_opA       (id_opA),
        .id_opB       (id_opB),
        .ex_valid     (ex_valid),
        .ex_pc        (ex_pc),
        .ex_opcode    (ex_opcode),
        .ex_rd        (ex_rd),
        .ex_reg_write (ex_reg_write),
        .ex_opA       (ex_opA),
        .ex_opB       (ex_opB)
    );

    //==========================================================================
    // STAGE 3: EXECUTE AND WRITE-BACK (EX/WB)
    //==========================================================================
    // 8-bit Arithmetic Logic Unit
    alu u_alu (
        .alu_op (ex_opcode),
        .a      (ex_opA),
        .b      (ex_opB),
        .result (ex_alu_result)
    );

    // Synchronous write-back is completed in register_file on the rising edge

    //==========================================================================
    // Top-Level Observability Output Assignments
    //==========================================================================
    assign pc_out            = pc;
    assign instruction_out   = rom_instruction;
    assign if_id_valid_out   = id_valid;
    assign id_ex_valid_out   = ex_valid;
    assign ex_alu_result_out = ex_alu_result;
    assign fwd_a_out         = forward_a;
    assign fwd_b_out         = forward_b;

endmodule

