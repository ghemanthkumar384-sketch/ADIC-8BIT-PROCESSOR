`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Project Name:   ADIC_8BIT_PROCESSOR
// Module Name:    forwarding_unit
// Language:       Verilog-2001
// Description:    Data Forwarding Unit (EX/WB -> ID Stage).
//                 Detects Read-After-Write (RAW) data hazards between:
//                   - Producer: Instruction currently in Stage 3 (EX/WB)
//                   - Consumer: Instruction currently in Stage 2 (ID)
//                 Forwarding Condition:
//                   1. Consumer in ID is valid (id_valid == 1).
//                   2. Producer in EX/WB is valid (ex_valid == 1).
//                   3. Producer writes to a register (ex_reg_write == 1).
//                   4. Producer target is NOT R0 (ex_rd != 3'b000).
//                   5. Consumer actually uses Rs/Rt (id_uses_rs / id_uses_rt == 1).
//                   6. Register address matches (id_rs == ex_rd / id_rt == ex_rd).
//                 When asserted, the ALU result in EX/WB is forwarded directly
//                 to the ID stage operand multiplexer in the same cycle.
//////////////////////////////////////////////////////////////////////////////////

module forwarding_unit (
    // Consumer inputs (Stage 2: ID)
    input  wire       id_valid,     // Consumer instruction valid flag
    input  wire       id_uses_rs,   // Consumer uses source register Rs
    input  wire       id_uses_rt,   // Consumer uses source register Rt
    input  wire [2:0] id_rs,        // Consumer Rs address
    input  wire [2:0] id_rt,        // Consumer Rt address

    // Producer inputs (Stage 3: EX/WB)
    input  wire       ex_valid,     // Producer instruction valid flag
    input  wire       ex_reg_write, // Producer asserts register write enable
    input  wire [2:0] ex_rd,        // Producer destination register Rd address

    // Forwarding decision outputs
    output wire       forward_a,    // Forward EX/WB result to Operand A
    output wire       forward_b     // Forward EX/WB result to Operand B
);

    // Hazard detection equations
    assign forward_a = id_valid && ex_valid && ex_reg_write &&
                       (ex_rd != 3'b000) && id_uses_rs && (id_rs == ex_rd);

    assign forward_b = id_valid && ex_valid && ex_reg_write &&
                       (ex_rd != 3'b000) && id_uses_rt && (id_rt == ex_rd);

endmodule

