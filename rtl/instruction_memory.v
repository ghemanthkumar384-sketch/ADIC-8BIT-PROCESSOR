`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Project Name:   ADIC_8BIT_PROCESSOR
// Module Name:    instruction_memory
// Language:       Verilog-2001
// Description:    256-word x 16-bit On-Chip Instruction ROM.
//                 Contains the predefined demonstration program verifying:
//                   1. Immediate loading (LOADI)
//                   2. Immediate addition (ADDI) with back-to-back hazard
//                   3. Register addition (ADD) with back-to-back hazard
//                   4. Register subtraction (SUB) with back-to-back hazard
//                   5. Bitwise AND (AND)
//                   6. Bitwise OR (OR)
//                   7. Bitwise XOR (XOR)
//                   8. Register R0 protection against write attempts
//                   9. Safe NOP handling for unmapped opcodes (0xF000)
//                  10. Pipeline draining via consecutive NOPs (0x0000)
//                 Asynchronous / combinational read addressing.
//////////////////////////////////////////////////////////////////////////////////

module instruction_memory (
    input  wire [7:0]  addr,         // 8-bit instruction address from PC
    output reg  [15:0] instruction   // 16-bit instruction word
);

    always @(*) begin
        case (addr)
            8'h00: instruction = 16'h7205; // LOADI R1, 5
            8'h01: instruction = 16'h6443; // ADDI  R2, R1, 3
            8'h02: instruction = 16'h1650; // ADD   R3, R1, R2
            8'h03: instruction = 16'h28C8; // SUB   R4, R3, R1
            8'h04: instruction = 16'h3AD0; // AND   R5, R3, R2
            8'h05: instruction = 16'h4C50; // OR    R6, R1, R2
            8'h06: instruction = 16'h5ED0; // XOR   R7, R3, R2
            8'h07: instruction = 16'h70FF; // LOADI R0, 255 (R0 protection check)
            8'h08: instruction = 16'hF000; // ILLEGAL_OP    (Safe NOP check)
            default: instruction = 16'h0000; // NOP (Pipeline drain)
        endcase
    end

endmodule

