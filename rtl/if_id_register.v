`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Project Name:   ADIC_8BIT_PROCESSOR
// Module Name:    if_id_register
// Language:       Verilog-2001
// Description:    Pipeline Register 1: IF / ID Stage Boundary.
//                 Latches the fetched 16-bit instruction, PC, and valid flag
//                 from Stage 1 (IF) into Stage 2 (ID) on each rising clock edge.
//                 Synchronous active-high reset (rst) clears all fields to 0.
//////////////////////////////////////////////////////////////////////////////////

module if_id_register (
    input  wire        clk,             // System clock
    input  wire        rst,             // Synchronous active-high reset

    // Inputs from Stage 1 (IF)
    input  wire        if_valid,        // IF stage valid flag
    input  wire [7:0]  if_pc,           // IF stage Program Counter
    input  wire [15:0] if_instruction,  // Fetched instruction word

    // Outputs to Stage 2 (ID)
    output reg         id_valid,        // ID stage valid flag
    output reg  [7:0]  id_pc,           // ID stage Program Counter
    output reg  [15:0] id_instruction   // Instruction word presented to decoder
);

    always @(posedge clk) begin
        if (rst) begin
            id_valid       <= 1'b0;
            id_pc          <= 8'h00;
            id_instruction <= 16'h0000; // Reset to NOP
        end else begin
            id_valid       <= if_valid;
            id_pc          <= if_pc;
            id_instruction <= if_instruction;
        end
    end

endmodule

