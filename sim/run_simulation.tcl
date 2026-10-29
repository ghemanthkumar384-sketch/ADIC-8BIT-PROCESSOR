# Vivado XSim Batch Simulation Script for ADIC_8BIT_PROCESSOR
# Run from Vivado Tcl Shell: source run_simulation.tcl

set script_dir [file dirname [file normalize [info script]]]
set root_dir   [file normalize "$script_dir/.."]
set rtl_dir    "$root_dir/rtl"
set tb_dir     "$root_dir/tb"

puts "=============================================================================="
puts "  STARTING VIVADO XSIM COMPILATION FOR 3-STAGE PIPELINED 8-BIT PROCESSOR"
puts "=============================================================================="

# Step 1: Compile synthesizable RTL modules
puts "\n[STEP 1] Compiling synthesizable RTL modules with xvlog..."
exec xvlog -work work "$rtl_dir/alu.v"
exec xvlog -work work "$rtl_dir/register_file.v"
exec xvlog -work work "$rtl_dir/instruction_memory.v"
exec xvlog -work work "$rtl_dir/instruction_decoder.v"
exec xvlog -work work "$rtl_dir/forwarding_unit.v"
exec xvlog -work work "$rtl_dir/if_id_register.v"
exec xvlog -work work "$rtl_dir/id_ex_register.v"
exec xvlog -work work "$rtl_dir/processor_top.v"
puts "[STEP 1] All 8 RTL source files compiled successfully."

# Step 2: Compile verification testbench
puts "\n[STEP 2] Compiling processor_tb.v with xvlog..."
exec xvlog -work work "$tb_dir/processor_tb.v"
puts "[STEP 2] Testbench compiled successfully."

# Step 3: Elaborate snapshot with xelab
puts "\n[STEP 3] Elaborating simulation snapshot with xelab..."
exec xelab -top processor_tb -snapshot processor_tb_snapshot -timescale 1ns/1ps -debug typical
puts "[STEP 3] Elaboration complete. Snapshot generated: processor_tb_snapshot"

# Step 4: Run simulation in batch mode
puts "\n[STEP 4] Executing behavioral simulation with xsim..."
exec xsim processor_tb_snapshot -runall

puts "=============================================================================="
puts "  SIMULATION EXECUTION COMPLETED"
puts "=============================================================================="

