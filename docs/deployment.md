# Complete Deployment Guide: GitHub & Vercel Setup

**Document:** `docs/deployment.md`  
**Project:** ADIC_8BIT_PROCESSOR  
**Target Environments:** GitHub (Source Control) & Vercel (Production Web Hosting)  
**Status:** Pre-Deployment Validation Complete (Ready for User-Approved Execution)

---

## 1. Overview

This document provides a step-by-step, beginner-friendly operational guide for preparing, pushing, and deploying the **ADIC 3-Stage Pipelined 8-Bit RISC Processor** project.

The project consists of two core tiers:
1. **Hardware Engineering Core:** Verilog HDL modules in `rtl/`, testbench in `tb/`, simulation scripts in `sim/`, and specifications in `docs/`.
2. **Interactive Web Platform:** Single-page application in `web/` built with React 18 and Vite 5, pre-configured with [`web/vercel.json`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/web/vercel.json).

---

## 2. Vercel Configuration Parameters

The web dashboard is configured to deploy directly from the `web/` subdirectory using [`web/vercel.json`](file:///C:/Users/Lenovo/OLYMPUS/ADIC_8BIT_PROCESSOR/web/vercel.json):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Verified Project Parameters

| Parameter | Configured Value | Verification Status |
| :--- | :--- | :---: |
| **Framework Preset** | `Vite` | Verified (`vite v5.4.11`) |
| **Root Directory** | `web` | Verified (Subdirectory in workspace) |
| **Build Command** | `npm run build` | Verified (Builds in 2.88s with exit code 0) |
| **Output Directory** | `dist` | Verified (Outputs to `web/dist/`) |
| **Node.js Engine** | `18.x` or `20.x` or `24.x` | Verified (Local: `v24.18.0`) |
| **Local Development Port** | `3000` | Verified in `web/vite.config.js` |
| **Local Preview Status** | `HTTP/1.1 200 OK` | Verified via local curl probe |
| **External Dependencies** | *None* | Zero third-party backend or API key dependencies |

---

## 3. Step-by-Step User Instructions: GitHub & Vercel

> [!IMPORTANT]
> **Safety Rule:** No code will be committed or pushed, and no public deployment will be triggered automatically. Follow these instructions when you are ready to publish your work.

### Step 1: Create a Repository on GitHub
1. Open your web browser and navigate to [GitHub](https://github.com).
2. Sign in to your account.
3. In the top-right corner, click the **`+`** icon and select **New repository**.
4. Configure your repository:
   - **Repository name:** e.g., `ADIC_8BIT_PROCESSOR` or `adic-8bit-pipelined-processor`
   - **Description:** *"Design and Verification of a 3-Stage Pipelined 8-Bit RISC Processor in Verilog HDL with an Interactive Engineering Dashboard."*
   - **Visibility:** Choose **Public** (recommended for portfolio/academic review) or **Private**.
   - **Initialize this repository with:** **Leave all checkboxes unchecked** (Do NOT add a README, `.gitignore`, or license, as these are already configured in your workspace).
5. Click **Create repository**.
6. Copy the repository URL (e.g., `https://github.com/<your-username>/<your-repo-name>.git`).

---

### Step 2: Initialize Git and Push Locally
Open PowerShell on your computer and navigate to the project directory:

```powershell
# 1. Navigate to the project root
cd "C:\Users\Lenovo\OLYMPUS\ADIC_8BIT_PROCESSOR"

# 2. Initialize Git (only if not already initialized)
git init

# 3. Verify that .gitignore is respected (should NOT stage node_modules or dist)
git status

# 4. Stage all project source files, docs, and configurations
git add .

# 5. Create your initial commit
git commit -m "feat: complete 3-stage pipelined 8-bit processor with verification suite and web dashboard"

# 6. Set the main branch
git branch -M main

# 7. Add your GitHub remote URL (paste your copied URL from Step 1)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 8. Push your code to GitHub
git push -u origin main
```

---

### Step 3: Import into Vercel
1. Open [Vercel](https://vercel.com) and log in (signing in with GitHub is recommended).
2. On your Vercel Dashboard, click **Add New...** &rarr; **Project**.
3. Under **"Import Git Repository"**, find your newly created GitHub repository and click **Import**.

---

### Step 4: Configure Project Settings in Vercel
Before clicking Deploy, verify the following settings in the Vercel deployment window:

1. **Project Name:** Keep the default or customize as desired.
2. **Framework Preset:** Select **Vite** (Vercel typically detects this automatically).
3. **Root Directory:**
   - Click **Edit** next to Root Directory.
   - Select or type: **`web`**
   - Click **Continue**.
4. **Build and Output Settings:**
   - Build Command: `npm run build` (or leave default toggle on).
   - Output Directory: `dist` (or leave default toggle on).
   - Install Command: `npm install`.
5. **Environment Variables:** Leave empty (none required).

---

### Step 5: Deploy and Obtain Public URL
1. Click the **Deploy** button.
2. Vercel will clone the `web/` folder, install dependencies, run `npm run build`, and deploy the static artifacts to their global CDN.
3. The build typically completes in under 45 seconds.
4. Once deployment succeeds, Vercel presents a congratulations screen with:
   - A live screenshot of your engineering dashboard.
   - Your permanent production URL (e.g., `https://adic-8bit-processor-xxxx.vercel.app`).
   - Domain management options (to attach a custom university or personal domain).

---

### Step 6: Test the Deployed Website
Once live, open your public URL and verify all features:

- [ ] **Navbar:** Links scroll smoothly to all 9 sections (`Overview`, `Architecture`, `ISA`, `Registers`, `ALU`, `Pipeline`, `Verification`, `Verilog RTL`, `Docs`).
- [ ] **Interactive Bit-Slicer (ISA):** Type `0x7205` or `0x6443`; confirm opcode, registers, and immediates are correctly extracted.
- [ ] **Register File:** Click "Test Write" with R0; confirm the hardware zero-lock alert appears. Click "Test Write" with R1; confirm R1 updates.
- [ ] **ALU Explorer:** Select `ADD` with `255` and `1`; confirm overflow wraps modulo 256 to `0` and asserts the Zero Flag.
- [ ] **Pipeline Stepper:** Click "Auto-Play" or "Next"; verify that on Cycle 3, 4, and 5 the pulsing RAW hazard forwarding alert appears.
- [ ] **Verification Center:** Confirm that the Three-Tier Architecture is displayed with the transparent note: Tier 1 (HDL simulation) is flagged as unavailable on host, Tier 2 (Python reference model) shows 32/32 passed, and Tier 3 (Browser demo) is active.
- [ ] **Source Code Viewer:** Click through all 9 tabs (`processor_top.v` through `processor_tb.v`); test the "Copy RTL" button.

---

## 4. Pre-Flight Verification Audit Checklist

- [x] Production build passes with 0 errors (`npm.cmd run build`).
- [x] Verification report parser unit tests pass (`npm.cmd test`).
- [x] Port 3000 preview server tested and verified (`HTTP/1.1 200 OK`).
- [x] Zero hardcoded absolute Windows paths in `web/src/`.
- [x] Zero secret keys or environment variables required.
- [x] `.gitignore` verified to exclude `node_modules/`, `dist/`, `.vite/`, and EDA logs.
- [x] Three-tier verification honesty notice prominent in dashboard and documentation.
- [ ] Remote push and public deployment paused awaiting user approval.
