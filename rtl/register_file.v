`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Project Name:   ADIC_8BIT_PROCESSOR
// Module Name:    register_file
// Language:       Verilog-2001
// Description:    Eight 8-bit General Purpose Registers (R0 through R7).
//                 Architectural Rules:
//                   1. R0 is hardwired to 8'h00. Reads always return 0;
//                      any write attempt to R0 (waddr == 3'b000) is discarded.
//                   2. Dual asynchronous read ports (raddr1, raddr2).
//                   3. Single synchronous write port (wen, waddr, wdata).
//                   4. Internal write-through bypass: if simultaneous write
//                      and read occur to the same non-zero address in the same
//                      cycle, wdata is forwarded immediately to rdata.
//                   5. Synchronous active-high reset (rst) clears R0-R7 to 0.
//////////////////////////////////////////////////////////////////////////////////

module register_file (
    input  wire       clk,      // System clock
    input  wire       rst,      // Synchronous active-high reset

    // Read Port 1
    input  wire [2:0] raddr1,   // 3-bit address for Port 1 (Rs)
    output wire [7:0] rdata1,   // 8-bit data output for Port 1

    // Read Port 2
    input  wire [2:0] raddr2,   // 3-bit address for Port 2 (Rt)
    output wire [7:0] rdata2,   // 8-bit data output for Port 2

    // Write Port (EX/WB stage write-back)
    input  wire       wen,      // Write enable
    input  wire [2:0] waddr,    // 3-bit destination register address (Rd)
    input  wire [7:0] wdata,    // 8-bit data to write

    // Direct Observability Outputs (For testbench and simulation probing)
    output wire [7:0] r0,
    output wire [7:0] r1,
    output wire [7:0] r2,
    output wire [7:0] r3,
    output wire [7:0] r4,
    output wire [7:0] r5,
    output wire [7:0] r6,
    output wire [7:0] r7
);

    // Physical storage registers R0 through R7 (R0 is initialized to 0 and never written)
    reg [7:0] regs [0:7];
    integer i;

    // Synchronous write & synchronous reset
    always @(posedge clk) begin
        if (rst) begin
            for (i = 0; i <= 7; i = i + 1) begin
                regs[i] <= 8'h00;
            end
        end else begin
            // Architectural rule: writes to R0 are suppressed
            if (wen && (waddr != 3'b000)) begin
                regs[waddr] <= wdata;
            end
        end
    end

    // Asynchronous read with internal write-through bypass & hardwired R0
    assign rdata1 = (raddr1 == 3'b000) ? 8'h00 :
                    (wen && (waddr == raddr1)) ? wdata :
                    regs[raddr1];

    assign rdata2 = (raddr2 == 3'b000) ? 8'h00 :
                    (wen && (waddr == raddr2)) ? wdata :
                    regs[raddr2];

    // Assign direct observability outputs
    assign r0 = 8'h00; // Hardwired zero
    assign r1 = regs[1];
    assign r2 = regs[2];
    assign r3 = regs[3];
    assign r4 = regs[4];
    assign r5 = regs[5];
    assign r6 = regs[6];
    assign r7 = regs[7];

endmodule
