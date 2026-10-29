import test from 'node:test';
import assert from 'node:assert';
import { parseVerificationReport, getTierBadge } from '../src/utils/verificationParser.js';

test('parseVerificationReport handles null or undefined input gracefully', () => {
  const result = parseVerificationReport(null);
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.summary.overallStatus, 'REPORT_MISSING');
  assert.match(result.error, /missing or corrupted/);
});

test('parseVerificationReport handles empty object input gracefully', () => {
  const result = parseVerificationReport({});
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.summary.totalAssertions, 0);
  assert.strictEqual(result.hdlSimulation.executed, false);
});

test('parseVerificationReport correctly parses real generated report', () => {
  const sampleReport = {
    report_version: "1.0.0",
    project: "ADIC_8BIT_PROCESSOR",
    timestamp_utc: "2026-10-30T00:00:00Z",
    summary: {
      total_assertions: 32,
      passed_assertions: 32,
      failed_assertions: 0,
      pass_rate: "100.0%",
      overall_status: "PASS"
    },
    hdl_simulation: {
      status: "UNAVAILABLE",
      executed: false,
      simulator: "Xilinx Vivado (XSim)",
      log_available: false,
      message: "Vivado not installed.",
      known_limitations: ["No host Vivado install"]
    },
    reference_model: {
      status: "PASSED",
      executed: true,
      engine: "Python 3.14.6",
      source_script: "sim/reference_simulation.py",
      exit_code: 0,
      disclaimer: "Reference model disclaimer",
      assertions: [
        { name: "Reset PC", group: "Reset", expected: 0, actual: 0, status: "PASS" }
      ]
    },
    educational_browser_model: {
      status: "ACTIVE",
      environment: "React 18",
      demonstration_cycles: 12,
      golden_registers: [0, 5, 8, 13, 8, 8, 13, 5],
      r0_zero_protection_enforced: true
    }
  };

  const parsed = parseVerificationReport(sampleReport);
  assert.strictEqual(parsed.isValid, true);
  assert.strictEqual(parsed.summary.totalAssertions, 32);
  assert.strictEqual(parsed.summary.passedAssertions, 32);
  assert.strictEqual(parsed.summary.passRate, "100.0%");
  assert.strictEqual(parsed.summary.overallStatus, "PASS");

  // Strictly distinguish HDL simulation from reference model
  assert.strictEqual(parsed.hdlSimulation.executed, false);
  assert.strictEqual(parsed.hdlSimulation.status, "UNAVAILABLE");
  assert.strictEqual(parsed.referenceModel.executed, true);
  assert.strictEqual(parsed.referenceModel.status, "PASSED");
  assert.strictEqual(parsed.educationalBrowserModel.status, "ACTIVE");
  assert.strictEqual(parsed.educationalBrowserModel.r0ZeroProtectionEnforced, true);
});

test('getTierBadge provides distinct and accurate styling for each tier', () => {
  const hdlBadge = getTierBadge('hdl');
  assert.match(hdlBadge.label, /PHYSICAL HDL/);
  assert.strictEqual(hdlBadge.badgeClass, 'badge-amber');

  const refBadge = getTierBadge('reference');
  assert.match(refBadge.label, /PYTHON CO-SIMULATOR/);
  assert.strictEqual(refBadge.badgeClass, 'badge-emerald');

  const browserBadge = getTierBadge('browser');
  assert.match(browserBadge.label, /EDUCATIONAL BROWSER/);
  assert.strictEqual(browserBadge.badgeClass, 'badge-sky');
});

