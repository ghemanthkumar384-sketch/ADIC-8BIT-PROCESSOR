@echo off
REM ==============================================================================
REM Batch launcher for Xilinx Vivado XSim simulation
REM ADIC_8BIT_PROCESSOR
REM ==============================================================================

echo ==============================================================================
echo   ADIC_8BIT_PROCESSOR: Xilinx Vivado XSim Automated Simulation Runner
echo ==============================================================================

where vivado >nul 2>nul
if %ERRORLEVEL% neq 0 (
    where xvlog >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo.
        echo [ERROR] Xilinx Vivado (vivado/xvlog) was not found in your system PATH.
        echo.
        echo If Vivado is installed on your PC, please source its environment first:
        echo   Example: call "C:\Xilinx\Vivado\2023.2\settings64.bat"
        echo.
        echo Alternatively, open Vivado GUI, open Tcl Console, and type:
        echo   cd "%~dp0"
        echo   source run_simulation.tcl
        echo.
        pause
        exit /b 1
    )
)

echo [INFO] Vivado detected. Executing batch simulation...
vivado -mode batch -source "%~dp0run_simulation.tcl"
pause

