`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Project Name:   ADIC_8BIT_PROCESSOR
// Module Name:    instruction_decoder
// Language:       Verilog-2001
// Description:    Instruction Decoder and Control Unit (Stage 2: ID).
//                 Extracts instruction fields and generates control signals:
//                   - Opcode:   instruction[15:12]
//                   - Rd:       instruction[11:9]
//                   - Rs:       instruction[8:6]
//                   - Rt:       instruction[5:3]
//                   - Imm6_ext: Signed 6-bit immediate sign-extended to 8 bits
//                   - Imm8:     Unsigned 8-bit immediate byte
//                   - reg_write: Asserted for instructions updating a register
//                   - uses_rs:   Asserted when source register Rs is needed
//                   - uses_rt:   Asserted when source register Rt is needed
//                 Combinational logic; latch-free with complete default coverage.
//////////////////////////////////////////////////////////////////////////////////

module instruction_decoder (
    input  wire [15:0] instruction,  // 16-bit instruction word from IF/ID
    input  wire        valid_in,     // Validity flag from IF/ID register

    output wire [3:0]  opcode,       // 4-bit operation code
    output wire [2:0]  rd,           // 3-bit destination register index
    output wire [2:0]  rs,           // 3-bit source register 1 index
    output wire [2:0]  rt,           // 3-bit source register 2 index
    output wire [7:0]  imm6_ext,     // Sign-extended 6-bit immediate
    output wire [7:0]  imm8,         // 8-bit immediate byte

    output reg         reg_write,    // Register file write enable signal
    output reg         uses_rs,      // Instruction reads Rs
    output reg         uses_rt       // Instruction reads Rt
);

    // Continuous field extractions
    assign opcode   = instruction[15:12];
    assign rd       = instruction[11:9];
    assign rs       = instruction[8:6];
    assign rt       = instruction[5:3];
    assign imm6_ext = {{2{instruction[5]}}, instruction[5:0]}; // Sign extension: replicate bit 5
    assign imm8     = instruction[7:0];

    // ISA Opcode definitions
    localparam OP_NOP   = 4'h0;
    localparam OP_ADD   = 4'h1;
    localparam OP_SUB   = 4'h2;
    localparam OP_AND   = 4'h3;
    localparam OP_OR    = 4'h4;
    localparam OP_XOR   = 4'h5;
    localparam OP_ADDI  = 4'h6;
    localparam OP_LOADI = 4'h7;

    always @(*) begin
        if (!valid_in) begin
            // Bubble or inactive stage
            reg_write = 1'b0;
            uses_rs   = 1'b0;
            uses_rt   = 1'b0;
        end else begin
            case (opcode)
                OP_ADD,
                OP_SUB,
                OP_AND,
                OP_OR,
                OP_XOR: begin
                    reg_write = 1'b1;
                    uses_rs   = 1'b1;
                    uses_rt   = 1'b1;
                end
                OP_ADDI: begin
                    reg_write = 1'b1;
                    uses_rs   = 1'b1;
                    uses_rt   = 1'b0;
                end
                OP_LOADI: begin
                    reg_write = 1'b1;
                    uses_rs   = 1'b0;
                    uses_rt   = 1'b0;
                end
                OP_NOP: begin
                    reg_write = 1'b0;
                    uses_rs   = 1'b0;
                    uses_rt   = 1'b0;
                end
                default: begin
                    // Safe default for unmapped/illegal opcodes (0x8 - 0xF)
                    reg_write = 1'b0;
                    uses_rs   = 1'b0;
                    uses_rt   = 1'b0;
                end
            endcase
        end
    end

endmodule

