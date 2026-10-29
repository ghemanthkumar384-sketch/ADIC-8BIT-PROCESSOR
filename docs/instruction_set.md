# Instruction Set Architecture (ISA) Specification

**Document:** `docs/instruction_set.md`  
**Project:** ADIC_8BIT_PROCESSOR  
**Instruction Word Length:** 16 bits  
**Datapath Width:** 8 bits  
**Register File:** 8 Registers (R0–R7), each 8 bits wide  

---

## 1. Instruction Formats and Bitfield Definitions

Every instruction in this architecture is exactly **16 bits wide** ($[15:0]$). There are three primary instruction formats:

### 1.1 R-Type Format (Register-to-Register Operations)
Used for operations where two source registers ($Rs$ and $Rt$) are combined by the ALU, and the result is stored in destination register $Rd$.

```text
 15        12 11      9 8       6 5       3 2        0
+------------+---------+---------+---------+----------+
|   Opcode   |   Rd    |   Rs    |   Rt    |  Unused  |
|   (4 bits) | (3 bits)| (3 bits)| (3 bits)|  (3'b000)|
+------------+---------+---------+---------+----------+
```
- **Opcode (`[15:12]`):** 4-bit operation code.
- **Rd (`[11:9]`):** 3-bit destination register index ($000_2$ to $111_2$ $\rightarrow$ R0 to R7).
- **Rs (`[8:6]`):** 3-bit first source register index (R0 to R7).
- **Rt (`[5:3]`):** 3-bit second source register index (R0 to R7).
- **Unused (`[2:0]`):** Reserved bits, set to `3'b000`.

---

### 1.2 I-Type Format A (ADDI: Register-Immediate Operation)
Used for adding a signed 6-bit immediate constant to a source register $Rs$ and storing the result in $Rd$.

```text
 15        12 11      9 8       6 5                  0
+------------+---------+---------+--------------------+
|   Opcode   |   Rd    |   Rs    |    Imm6 (signed)   |
|   (4 bits) | (3 bits)| (3 bits)|       (6 bits)     |
+------------+---------+---------+--------------------+
```
- **Opcode (`[15:12]`):** Set to `4'b0110` (`0x6`).
- **Rd (`[11:9]`):** 3-bit destination register index.
- **Rs (`[8:6]`):** 3-bit source register index.
- **Imm6 (`[5:0]`):** 6-bit 2's complement signed immediate (range: $-32$ to $+31$). Sign-extended to 8 bits in hardware:
  $$\text{imm6\_ext} = \{\{2\{\text{imm6}[5]\}\}, \text{imm6}[5:0]\}$$

---

### 1.3 I-Type Format B (LOADI: Immediate Load Operation)
Used for loading an 8-bit immediate byte directly into destination register $Rd$.

```text
 15        12 11      9 8        7                   0
+------------+---------+----------+-------------------+
|   Opcode   |   Rd    | Reserved |    Imm8 (8-bit)   |
|   (4 bits) | (3 bits)| (1'b0)   |      (8 bits)     |
+------------+---------+----------+-------------------+
```
- **Opcode (`[15:12]`):** Set to `4'b0111` (`0x7`).
- **Rd (`[11:9]`):** 3-bit destination register index.
- **Reserved (`[8]`):** Fixed to `1'b0`.
- **Imm8 (`[7:0]`):** 8-bit unsigned immediate byte (range: $0$ to $255$).

---

## 2. Complete Opcode Map & Instruction Reference

| Mnemonic | Opcode (Bin) | Opcode (Hex) | Format | Syntax | Micro-Operation |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **NOP** | `0000` | `0x0` | Special | `NOP` | Pipeline bubble. No state change (`reg_write = 0`). |
| **ADD** | `0001` | `0x1` | R-Type | `ADD Rd, Rs, Rt` | $R[Rd] \leftarrow R[Rs] + R[Rt]$ |
| **SUB** | `0010` | `0x2` | R-Type | `SUB Rd, Rs, Rt` | $R[Rd] \leftarrow R[Rs] - R[Rt]$ |
| **AND** | `0011` | `0x3` | R-Type | `AND Rd, Rs, Rt` | $R[Rd] \leftarrow R[Rs] \land R[Rt]$ |
| **OR** | `0100` | `0x4` | R-Type | `OR Rd, Rs, Rt` | $R[Rd] \leftarrow R[Rs] \lor R[Rt]$ |
| **XOR** | `0101` | `0x5` | R-Type | `XOR Rd, Rs, Rt` | $R[Rd] \leftarrow R[Rs] \oplus R[Rt]$ |
| **ADDI** | `0110` | `0x6` | I-Type A | `ADDI Rd, Rs, imm6`| $R[Rd] \leftarrow R[Rs] + \text{sign\_ext}(imm6)$ |
| **LOADI**| `0111` | `0x7` | I-Type B | `LOADI Rd, imm8` | $R[Rd] \leftarrow imm8$ |
| **RESERVED**| `1000..1111`| `0x8..0xF` | - | Any unmapped | Decoded safely as NOP (`reg_write = 0`). |

---

## 3. Encoding Fit Verification

We verify that all required instructions fit strictly within the 16-bit word budget with zero field overlap:

1. **Opcode Space:** 4 bits allows $2^4 = 16$ distinct opcodes. We assign 8 opcodes (`0x0` to `0x7`), leaving 8 reserved opcodes (`0x8` to `0xF`) for future extensions (e.g., branches or memory loads).
2. **Register Addressing:** 3 bits uniquely addresses $2^3 = 8$ registers (R0 through R7).
3. **R-Type:** $4\text{ (opcode)} + 3\text{ (Rd)} + 3\text{ (Rs)} + 3\text{ (Rt)} + 3\text{ (unused)} = 16\text{ bits}$.
4. **I-Type A (ADDI):** $4\text{ (opcode)} + 3\text{ (Rd)} + 3\text{ (Rs)} + 6\text{ (imm6)} = 16\text{ bits}$.
5. **I-Type B (LOADI):** $4\text{ (opcode)} + 3\text{ (Rd)} + 1\text{ (reserved)} + 8\text{ (imm8)} = 16\text{ bits}$.

*Result:* **All seven instructions + NOP fit the proposed 16-bit encoding with complete orthogonality.**

---

## 4. Demonstration Program & Register Calculations

The demonstration program validates all supported instructions, exercises the operand forwarding paths under back-to-back dependencies, tests the R0 hardwired zero protection, and verifies safe handling of illegal opcodes.

### 4.1 Step-by-Step Program Listing

| PC Address | Assembly Instruction | Hex Code | Binary Breakdown |
| :---: | :--- | :---: | :--- |
| `0x00` | `LOADI R1, 5` | `16'h7205` | `0111_0010_0000_0101` (Op=7, Rd=1, Imm8=0x05) |
| `0x01` | `ADDI R2, R1, 3` | `16'h6443` | `0110_0100_0100_0011` (Op=6, Rd=2, Rs=1, Imm6=0x03) |
| `0x02` | `ADD R3, R1, R2` | `16'h1650` | `0001_0110_0101_0000` (Op=1, Rd=3, Rs=1, Rt=2) |
| `0x03` | `SUB R4, R3, R1` | `16'h28C8` | `0010_1000_1100_1000` (Op=2, Rd=4, Rs=3, Rt=1) |
| `0x04` | `AND R5, R3, R2` | `16'h3AD0` | `0011_1010_1101_0000` (Op=3, Rd=5, Rs=3, Rt=2) |
| `0x05` | `OR R6, R1, R2` | `16'h4C50` | `0100_1100_0101_0000` (Op=4, Rd=6, Rs=1, Rt=2) |
| `0x06` | `XOR R7, R3, R2` | `16'h5ED0` | `0101_1110_1101_0000` (Op=5, Rd=7, Rs=3, Rt=2) |
| `0x07` | `LOADI R0, 255` | `16'h70FF` | `0111_0000_1111_1111` (Op=7, Rd=0, Imm8=0xFF) |
| `0x08` | `ILLEGAL_OP` | `16'hF000` | `1111_0000_0000_0000` (Op=F, Unmapped opcode) |
| `0x09..FF` | `NOP` | `16'h0000` | `0000_0000_0000_0000` (Op=0, Pipeline drain) |

---

### 4.2 Mathematical Calculation of Final Register Values

1. **Step 1 (`LOADI R1, 5`):**
   $$R[1] = 5 = 8\text{'h05}$$
2. **Step 2 (`ADDI R2, R1, 3`):**
   $$R[2] = R[1] + 3 = 5 + 3 = 8 = 8\text{'h08}$$
   *(Uses R1 forwarded directly from the EX/WB stage of Step 1).*
3. **Step 3 (`ADD R3, R1, R2`):**
   $$R[3] = R[1] + R[2] = 5 + 8 = 13 = 8\text{'h0D}$$
   *(Uses R2 forwarded directly from the EX/WB stage of Step 2).*
4. **Step 4 (`SUB R4, R3, R1`):**
   $$R[4] = R[3] - R[1] = 13 - 5 = 8 = 8\text{'h08}$$
   *(Uses R3 forwarded directly from the EX/WB stage of Step 3).*
5. **Step 5 (`AND R5, R3, R2`):**
   $$13_{10} = 0000\,1101_2$$
   $$8_{10} = 0000\,1000_2$$
   $$R[5] = 0000\,1101_2 \land 0000\,1000_2 = 0000\,1000_2 = 8 = 8\text{'h08}$$
6. **Step 6 (`OR R6, R1, R2`):**
   $$5_{10} = 0000\,0101_2$$
   $$8_{10} = 0000\,1000_2$$
   $$R[6] = 0000\,0101_2 \lor 0000\,1000_2 = 0000\,1101_2 = 13 = 8\text{'h0D}$$
7. **Step 7 (`XOR R7, R3, R2`):**
   $$13_{10} = 0000\,1101_2$$
   $$8_{10} = 0000\,1000_2$$
   $$R[7] = 0000\,1101_2 \oplus 0000\,1000_2 = 0000\,0101_2 = 5 = 8\text{'h05}$$
8. **Step 8 (`LOADI R0, 255`):**
   $$R[0] = 0 = 8\text{'h00}$$
   *(Write attempt of $255$ is ignored; R0 remains $0$).*

---

### 4.3 Summary of Expected Register State

| Register | Expected Decimal | Expected Hexadecimal | Verification Focus |
| :---: | :---: | :---: | :--- |
| **R0** | **0** | `8'h00` | Architectural zero-register protection |
| **R1** | **5** | `8'h05` | Immediate load (`LOADI`) |
| **R2** | **8** | `8'h08` | Immediate addition (`ADDI`) + RAW forwarding from R1 |
| **R3** | **13** | `8'h0D` | Register addition (`ADD`) + RAW forwarding from R2 |
| **R4** | **8** | `8'h08` | Register subtraction (`SUB`) + RAW forwarding from R3 |
| **R5** | **8** | `8'h08` | Bitwise logical AND (`AND`) |
| **R6** | **13** | `8'h0D` | Bitwise logical OR (`OR`) |
| **R7** | **5** | `8'h05` | Bitwise logical XOR (`XOR`) |

