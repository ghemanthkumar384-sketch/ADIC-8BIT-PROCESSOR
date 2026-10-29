`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Project Name:   ADIC_8BIT_PROCESSOR
// Module Name:    alu
// Language:       Verilog-2001
// Description:    8-Bit Arithmetic and Logic Unit (ALU)
//                 Performs 8-bit operations selected by a 4-bit opcode:
//                   - ADD   (0x1): a + b
//                   - SUB   (0x2): a - b
//                   - AND   (0x3): a & b
//                   - OR    (0x4): a | b
//                   - XOR   (0x5): a ^ b
//                   - ADDI  (0x6): a + b (b is sign-extended immediate)
//                   - LOADI (0x7): b     (b is 8-bit immediate)
//                   - NOP / Reserved: 8'h00
//                 Fully combinational; latch-free with complete default coverage.
//////////////////////////////////////////////////////////////////////////////////

module alu (
    input  wire [3:0] alu_op,   // 4-bit operation code
    input  wire [7:0] a,        // 8-bit Operand A
    input  wire [7:0] b,        // 8-bit Operand B
    output reg  [7:0] result    // 8-bit ALU output result
);

    // Localparams for operation codes matching ISA specification
    localparam OP_NOP   = 4'h0;
    localparam OP_ADD   = 4'h1;
    localparam OP_SUB   = 4'h2;
    localparam OP_AND   = 4'h3;
    localparam OP_OR    = 4'h4;
    localparam OP_XOR   = 4'h5;
    localparam OP_ADDI  = 4'h6;
    localparam OP_LOADI = 4'h7;

    always @(*) begin
        case (alu_op)
            OP_ADD:   result = a + b;
            OP_SUB:   result = a - b;
            OP_AND:   result = a & b;
            OP_OR:    result = a | b;
            OP_XOR:   result = a ^ b;
            OP_ADDI:  result = a + b;
            OP_LOADI: result = b;
            OP_NOP:   result = 8'h00;
            default:  result = 8'h00; // Safe default for unmapped opcodes (0x8 - 0xF)
        endcase
    end

endmodule

