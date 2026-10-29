`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Project Name:   ADIC_8BIT_PROCESSOR
// Module Name:    id_ex_register
// Language:       Verilog-2001
// Description:    Pipeline Register 2: ID / EX Stage Boundary.
//                 Latches the decoded opcode, destination register address,
//                 write-enable flag, and prepared ALU operands A and B from
//                 Stage 2 (ID) into Stage 3 (EX/WB) on each rising clock edge.
//                 Synchronous active-high reset (rst) clears all fields to 0.
//////////////////////////////////////////////////////////////////////////////////

module id_ex_register (
    input  wire       clk,             // System clock
    input  wire       rst,             // Synchronous active-high reset

    // Inputs from Stage 2 (ID)
    input  wire       id_valid,        // ID stage valid flag
    input  wire [7:0] id_pc,           // ID stage Program Counter
    input  wire [3:0] id_opcode,       // Decoded 4-bit opcode
    input  wire [2:0] id_rd,           // 3-bit destination register index
    input  wire       id_reg_write,    // Register file write enable
    input  wire [7:0] id_opA,          // Prepared Operand A (RF or forwarded)
    input  wire [7:0] id_opB,          // Prepared Operand B (RF, imm, or forwarded)

    // Outputs to Stage 3 (EX/WB)
    output reg        ex_valid,        // EX/WB stage valid flag
    output reg  [7:0] ex_pc,           // EX/WB stage Program Counter
    output reg  [3:0] ex_opcode,       // Opcode driving ALU
    output reg  [2:0] ex_rd,           // Destination register for write-back
    output reg        ex_reg_write,    // Write enable for write-back
    output reg  [7:0] ex_opA,          // Operand A input to ALU
    output reg  [7:0] ex_opB           // Operand B input to ALU
);

    always @(posedge clk) begin
        if (rst) begin
            ex_valid     <= 1'b0;
            ex_pc        <= 8'h00;
            ex_opcode    <= 4'h0;
            ex_rd        <= 3'b000;
            ex_reg_write <= 1'b0;
            ex_opA       <= 8'h00;
            ex_opB       <= 8'h00;
        end else begin
            ex_valid     <= id_valid;
            ex_pc        <= id_pc;
            ex_opcode    <= id_opcode;
            ex_rd        <= id_rd;
            ex_reg_write <= id_reg_write;
            ex_opA       <= id_opA;
            ex_opB       <= id_opB;
        end
    end

endmodule

