`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Project Name:   ADIC_8BIT_PROCESSOR
// Module Name:    processor_tb
// Language:       Verilog-2001
// Target Tool:    Xilinx Vivado (XSim Simulator)
// Description:    Comprehensive, Self-Checking Testbench for processor_top.
//
// Verification Scope:
//   1. Synchronous active-high reset assertion and clean deassertion.
//   2. PC progression and instruction fetch sequencing (IF stage).
//   3. Pipeline valid flag propagation across IF/ID and ID/EX registers.
//   4. Cycle-calibrated Data Forwarding verification across dependent instructions:
//      - Cycle 2: Distance-1 hazard on R1 between LOADI and ADDI (fwd_a active, ALU=5)
//      - Cycle 3: Distance-1 hazard on R2 between ADDI and ADD (fwd_b active, ALU=8)
//      - Cycle 4: Distance-1 hazard on R3 between ADD and SUB (fwd_a active, ALU=13)
//   5. Register File write-back timing (R1 committed at posedge 3, R2 at posedge 4).
//   6. Architectural Register Zero (R0) protection check (LOADI R0, 255 rejected).
//   7. Automated assertion checking against expected final register states:
//      R0=0, R1=5, R2=8, R3=13, R4=8, R5=8, R6=13, R7=5.
//   8. Re-application of synchronous reset to verify dynamic reset recovery.
//   9. Race-free sampling using negative clock edges and post-edge delays (#1).
//  10. Strict PASS / FAIL accounting with non-zero exit code ($fatal) on failure.
//////////////////////////////////////////////////////////////////////////////////

module processor_tb;

    //==========================================================================
    // Clock and Reset Signals
    //==========================================================================
    reg         clk;
    reg         rst;

    //==========================================================================
    // Interconnect Wires to Device Under Test (DUT)
    //==========================================================================
    wire [7:0]  pc;
    wire [15:0] instruction;
    wire [7:0]  r0, r1, r2, r3, r4, r5, r6, r7;
    wire        if_id_valid;
    wire        id_ex_valid;
    wire [7:0]  ex_alu_result;
    wire        fwd_a;
    wire        fwd_b;

    //==========================================================================
    // Verification Tracking Variables
    //==========================================================================
    integer cycle_count;
    integer pass_count;
    integer fail_count;
    reg [7:0] expected_regs [0:7];

    //==========================================================================
    // Instantiate Device Under Test (DUT): processor_top
    //==========================================================================
    processor_top dut (
        .clk               (clk),
        .rst               (rst),
        .pc_out            (pc),
        .instruction_out   (instruction),
        .r0                (r0),
        .r1                (r1),
        .r2                (r2),
        .r3                (r3),
        .r4                (r4),
        .r5                (r5),
        .r6                (r6),
        .r7                (r7),
        .if_id_valid_out   (if_id_valid),
        .id_ex_valid_out   (id_ex_valid),
        .ex_alu_result_out (ex_alu_result),
        .fwd_a_out         (fwd_a),
        .fwd_b_out         (fwd_b)
    );

    //==========================================================================
    // Clock Generator: 100 MHz (10 ns period, 50% duty cycle)
    //==========================================================================
    initial begin
        clk = 1'b0;
        forever #5 clk = ~clk;
    end

    //==========================================================================
    // VCD Waveform Dump (Compatible with Vivado, ModelSim, and GTKWave)
    //==========================================================================
    initial begin
        $dumpfile("processor_tb.vcd");
        $dumpvars(0, processor_tb);
    end

    //==========================================================================
    // Cycle Logger: Real-Time Pipeline Activity Display
    //==========================================================================
    always @(posedge clk) begin
        if (!rst) begin
            cycle_count = cycle_count + 1;
            $display("[Time %04t ns] Cycle %02d | PC=0x%02X | Inst=0x%04X | IF_Vld=%b | ID_Vld=%b | FwdA=%b FwdB=%b | ALU_Out=0x%02X",
                     $time, cycle_count, pc, instruction, if_id_valid, id_ex_valid, fwd_a, fwd_b, ex_alu_result);
            $display("                Registers: R0=%0d R1=%0d R2=%0d R3=%0d R4=%0d R5=%0d R6=%0d R7=%0d",
                     r0, r1, r2, r3, r4, r5, r6, r7);
        end
    end

    //==========================================================================
    // Main Verification Process
    //==========================================================================
    initial begin
        // Initialize verification counters
        cycle_count = 0;
        pass_count  = 0;
        fail_count  = 0;

        // Initialize expected values from architectural specification
        expected_regs[0] = 8'd0;
        expected_regs[1] = 8'd5;
        expected_regs[2] = 8'd8;
        expected_regs[3] = 8'd13;
        expected_regs[4] = 8'd8;
        expected_regs[5] = 8'd8;
        expected_regs[6] = 8'd13;
        expected_regs[7] = 8'd5;

        $display("\n================================================================================");
        $display("   STARTING COMPREHENSIVE VERIFICATION: 3-STAGE PIPELINED 8-BIT PROCESSOR");
        $display("================================================================================\n");

        //----------------------------------------------------------------------
        // TEST 1: SYNCHRONOUS ACTIVE-HIGH RESET & INITIAL STATE CHECK
        //----------------------------------------------------------------------
        $display("[TEST 1] Asserting Synchronous Reset (rst = 1)...");
        rst = 1'b1;
        #30; // Hold reset for 3 complete clock cycles

        // Sample state safely on the falling edge of the clock (race-free)
        @(negedge clk);
        assert_equal_8bit("Reset: PC should be 0", pc, 8'h00);
        assert_equal_1bit("Reset: IF/ID valid bit should be 0", if_id_valid, 1'b0);
        assert_equal_1bit("Reset: ID/EX valid bit should be 0", id_ex_valid, 1'b0);
        assert_equal_8bit("Reset: R0 should be 0", r0, 8'h00);
        assert_equal_8bit("Reset: R1 should be 0", r1, 8'h00);
        assert_equal_8bit("Reset: R2 should be 0", r2, 8'h00);
        assert_equal_8bit("Reset: R3 should be 0", r3, 8'h00);
        assert_equal_8bit("Reset: R4 should be 0", r4, 8'h00);
        assert_equal_8bit("Reset: R5 should be 0", r5, 8'h00);
        assert_equal_8bit("Reset: R6 should be 0", r6, 8'h00);
        assert_equal_8bit("Reset: R7 should be 0", r7, 8'h00);

        //----------------------------------------------------------------------
        // TEST 2: RELEASE RESET & COMMENCE PIPELINE EXECUTION
        //----------------------------------------------------------------------
        $display("\n[TEST 2] Releasing Reset synchronously on negedge clk...");
        @(negedge clk);
        rst = 1'b0;

        //----------------------------------------------------------------------
        // CYCLE 1: First instruction (LOADI R1, 5) enters Stage 2 (ID)
        //----------------------------------------------------------------------
        @(posedge clk);
        #1; // Allow non-blocking assignments to settle
        $display("\n[TEST 3A] Cycle 1 Verification (Inst 0 in ID stage)...");
        assert_equal_8bit("Cycle 1: PC should be 0x01", pc, 8'h01);
        assert_equal_1bit("Cycle 1: IF/ID valid should be 1", if_id_valid, 1'b1);
        assert_equal_1bit("Cycle 1: ID/EX valid should be 0 (bubble)", id_ex_valid, 1'b0);

        //----------------------------------------------------------------------
        // CYCLE 2: Inst 0 in Stage 3 (EX/WB), Inst 1 (ADDI R2, R1, 3) in Stage 2 (ID)
        // RAW Hazard on R1: Forwarding A must be asserted!
        //----------------------------------------------------------------------
        @(posedge clk);
        #1;
        $display("\n[TEST 3B] Cycle 2 Verification: Forwarding on R1 (LOADI R1, 5 -> ADDI R2, R1, 3)...");
        assert_equal_8bit("Cycle 2: PC should be 0x02", pc, 8'h02);
        assert_equal_1bit("Cycle 2: Forwarding A (R1) should be active", fwd_a, 1'b1);
        assert_equal_1bit("Cycle 2: Forwarding B should be inactive", fwd_b, 1'b0);
        assert_equal_8bit("Cycle 2: ALU result in EX/WB should be 5", ex_alu_result, 8'd5);

        //----------------------------------------------------------------------
        // CYCLE 3: Inst 1 in Stage 3 (EX/WB), Inst 2 (ADD R3, R1, R2) in Stage 2 (ID)
        // RAW Hazard on R2: Forwarding B must be asserted! R1 write-back committed!
        //----------------------------------------------------------------------
        @(posedge clk);
        #1;
        $display("\n[TEST 3C] Cycle 3 Verification: Forwarding on R2 (ADDI R2, R1, 3 -> ADD R3, R1, R2)...");
        assert_equal_8bit("Cycle 3: PC should be 0x03", pc, 8'h03);
        assert_equal_1bit("Cycle 3: Forwarding A should be inactive", fwd_a, 1'b0);
        assert_equal_1bit("Cycle 3: Forwarding B (R2) should be active", fwd_b, 1'b1);
        assert_equal_8bit("Cycle 3: ALU result in EX/WB should be 8", ex_alu_result, 8'd8);
        assert_equal_8bit("Cycle 3: R1 should now be committed as 5", r1, 8'd5);

        //----------------------------------------------------------------------
        // CYCLE 4: Inst 2 in Stage 3 (EX/WB), Inst 3 (SUB R4, R3, R1) in Stage 2 (ID)
        // RAW Hazard on R3: Forwarding A must be asserted! R2 write-back committed!
        //----------------------------------------------------------------------
        @(posedge clk);
        #1;
        $display("\n[TEST 3D] Cycle 4 Verification: Forwarding on R3 (ADD R3, R1, R2 -> SUB R4, R3, R1)...");
        assert_equal_8bit("Cycle 4: PC should be 0x04", pc, 8'h04);
        assert_equal_1bit("Cycle 4: Forwarding A (R3) should be active", fwd_a, 1'b1);
        assert_equal_1bit("Cycle 4: Forwarding B should be inactive", fwd_b, 1'b0);
        assert_equal_8bit("Cycle 4: ALU result in EX/WB should be 13", ex_alu_result, 8'd13);
        assert_equal_8bit("Cycle 4: R2 should now be committed as 8", r2, 8'd8);

        // Run remaining program cycles (Inst 4 through Inst 8) and pipeline drain NOPs
        repeat (15) @(posedge clk);
        #1;

        //----------------------------------------------------------------------
        // TEST 4: AUTOMATED REGISTER FILE FINAL STATE VERIFICATION
        //----------------------------------------------------------------------
        $display("\n================================================================================");
        $display("[TEST 4] Program execution finished. Checking Final Register State:");
        $display("--------------------------------------------------------------------------------");
        $display(" Reg  | Expected Dec (Hex) | Actual Dec (Hex) | Status");
        $display("--------------------------------------------------------------------------------");

        check_register(0, r0, expected_regs[0], "R0 Hardwire Zero & LOADI R0, 255 Rejected");
        check_register(1, r1, expected_regs[1], "LOADI R1, 5 Result");
        check_register(2, r2, expected_regs[2], "ADDI R2, R1, 3 Result (Forwarded R1)");
        check_register(3, r3, expected_regs[3], "ADD R3, R1, R2 Result (Forwarded R2)");
        check_register(4, r4, expected_regs[4], "SUB R4, R3, R1 Result (Forwarded R3)");
        check_register(5, r5, expected_regs[5], "AND R5, R3, R2 Result");
        check_register(6, r6, expected_regs[6], "OR R6, R1, R2 Result");
        check_register(7, r7, expected_regs[7], "XOR R7, R3, R2 Result");

        $display("--------------------------------------------------------------------------------\n");

        //----------------------------------------------------------------------
        // TEST 5: DYNAMIC RESET RE-APPLICATION TEST
        //----------------------------------------------------------------------
        $display("[TEST 5] Testing Re-application of Synchronous Reset...");
        @(negedge clk);
        rst = 1'b1;
        repeat (2) @(posedge clk);
        #1;

        assert_equal_8bit("Re-Reset: PC should return to 0", pc, 8'h00);
        assert_equal_1bit("Re-Reset: IF/ID valid should clear", if_id_valid, 1'b0);
        assert_equal_1bit("Re-Reset: ID/EX valid should clear", id_ex_valid, 1'b0);
        assert_equal_8bit("Re-Reset: R1 should clear to 0", r1, 8'h00);
        assert_equal_8bit("Re-Reset: R2 should clear to 0", r2, 8'h00);
        assert_equal_8bit("Re-Reset: R3 should clear to 0", r3, 8'h00);
        assert_equal_8bit("Re-Reset: R7 should clear to 0", r7, 8'h00);

        @(negedge clk);
        rst = 1'b0;
        #10;

        //----------------------------------------------------------------------
        // FINAL SUMMARY & TERMINATION
        //----------------------------------------------------------------------
        $display("================================================================================");
        $display("   VERIFICATION SUMMARY");
        $display("--------------------------------------------------------------------------------");
        $display("   Total Assertions Checked : %0d", pass_count + fail_count);
        $display("   Assertions Passed        : %0d", pass_count);
        $display("   Assertions Failed        : %0d", fail_count);
        $display("================================================================================");

        if (fail_count == 0) begin
            $display("   *** STATUS: ALL CHECKS PASSED (PASS) ***");
            $display("   All pipeline stages, forwarding paths, and ISA operations verified!");
            $display("================================================================================\n");
            $finish(0); // Exit code 0
        end else begin
            $display("   *** STATUS: TEST SUITE FAILED (FAIL) ***");
            $display("   Found %0d mismatch(es) during execution.", fail_count);
            $display("================================================================================\n");
            $fatal(1, "Testbench assertions failed.");
        end
    end

    //==========================================================================
    // Assertion Helper Tasks
    //==========================================================================
    task assert_equal_8bit;
        input [127:0] description;
        input [7:0]   actual;
        input [7:0]   expected;
        begin
            if (actual === expected) begin
                pass_count = pass_count + 1;
            end else begin
                $display("FAIL [ASSERTION]: %0s | Expected: 0x%02X (%0d), Actual: 0x%02X (%0d)",
                         description, expected, expected, actual, actual);
                fail_count = fail_count + 1;
            end
        end
    endtask

    task assert_equal_1bit;
        input [127:0] description;
        input         actual;
        input         expected;
        begin
            if (actual === expected) begin
                pass_count = pass_count + 1;
            end else begin
                $display("FAIL [ASSERTION]: %0s | Expected: %b, Actual: %b",
                         description, expected, actual);
                fail_count = fail_count + 1;
            end
        end
    endtask

    task check_register;
        input integer   reg_num;
        input [7:0]     actual;
        input [7:0]     expected;
        input [255:0]   desc;
        begin
            if (actual === expected) begin
                $display("  R%0d   |    %3d (0x%02X)       |    %3d (0x%02X)     | PASS  (%0s)",
                         reg_num, expected, expected, actual, actual, desc);
                pass_count = pass_count + 1;
            end else begin
                $display("  R%0d   |    %3d (0x%02X)       |    %3d (0x%02X)     | FAIL  <--- MISMATCH! (%0s)",
                         reg_num, expected, expected, actual, actual, desc);
                fail_count = fail_count + 1;
            end
        end
    endtask

endmodule
