import { jsPDF } from "jspdf";
import type { ComparisonOutput, OilMetrics, ReportData } from "@/lib/calculations";
import { formatNumber } from "@/lib/calculations";

const NAVY = "#06264A";
const INK = "#1D2A3B";
const MUTED = "#708097";
const FAINT = "#E8EEF5";
const PANEL = "#F6F8FB";
const GOLD = "#C69A55";
const GREEN = "#1D9A61";

const page = { w: 595.28, h: 841.89, m: 56 };

function safe(v: number) {
  return Number.isFinite(v) ? v : 0;
}

function money(v: number, compact = false): string {
  const value = safe(v);
  const abs = Math.abs(value);
  if (compact) {
    if (abs >= 1_00_00_000) return `INR ${(value / 1_00_00_000).toFixed(2)} Cr`;
    if (abs >= 1_00_000) return `INR ${(value / 1_00_000).toFixed(2)} Lakh`;
  }
  return `INR ${Math.round(value).toLocaleString("en-IN")}`;
}

function pct(v: number, digits = 2) {
  return `${safe(v).toFixed(digits)}%`;
}

function yrs(v: number) {
  if (!Number.isFinite(v)) return "N/A";
  return `${v.toFixed(1)} Years`;
}

function bestMetric(comp: ComparisonOutput): OilMetrics {
  if (comp.bestValue === "Natural Ester") return comp.natural;
  if (comp.bestValue === "Synthetic Ester") return comp.synthetic;
  return comp.mineral;
}

function addFooter(doc: jsPDF, pageNo: number, total = 6) {
  doc.setDrawColor(240, 244, 248);
  doc.line(page.m, page.h - 70, page.w - page.m, page.h - 70);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor("#8EA0B8");
  doc.text("SAVITA OIL TECHNOLOGIES LIMITED", page.m, page.h - 38);
  doc.setTextColor(NAVY);
  doc.text(`PAGE ${String(pageNo).padStart(2, "0")} OF ${String(total).padStart(2, "0")}`, page.w - page.m, page.h - 38, { align: "right" });
}

function sectionTitle(doc: jsPDF, no: string, title: string, y: number) {
  doc.setFont("times", "italic");
  doc.setFontSize(24);
  doc.setTextColor("#B8C7D9");
  doc.text(no, page.m, y);
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(NAVY);
  doc.text(title, page.m + 38, y);
  doc.setDrawColor(235, 240, 246);
  doc.line(page.m + 38, y + 14, page.w - page.m, y + 14);
}

function label(doc: jsPDF, text: string, x: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor("#9AAAC0");
  doc.text(text.toUpperCase(), x, y, { charSpace: 0.8 });
}

function body(doc: jsPDF, text: string, x: number, y: number, width = 470, size = 10.5, lineGap = 5) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(size);
  doc.setTextColor(MUTED);
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, x, y, { lineHeightFactor: 1.45 });
  return y + lines.length * (size + lineGap);
}

function metricCard(doc: jsPDF, labelText: string, value: string, x: number, y: number, w: number, h = 92) {
  doc.setFillColor(PANEL);
  doc.setDrawColor("#F0F3F7");
  doc.roundedRect(x, y, w, h, 2, 2, "FD");
  doc.setDrawColor(NAVY);
  doc.setLineWidth(1.4);
  doc.line(x, y, x + w, y);
  label(doc, labelText, x + 14, y + 28);
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(NAVY);
  doc.text(value, x + 14, y + 58);
}

function simpleTable(doc: jsPDF, rows: string[][], x: number, y: number, colW: number[], opts: { header?: boolean; darkLast?: boolean; rowHeight?: number } = {}) {
  const totalW = colW.reduce((a, b) => a + b, 0);
  if (totalW < 470 && colW.length > 1) {
    const extra = (470 - totalW) / (colW.length - 1);
    for(let i=1; i<colW.length; i++) colW[i] += extra;
  }
  const rowH = opts.rowHeight ?? 34;
  rows.forEach((row, i) => {
    const dark = opts.darkLast && i === rows.length - 1;
    const header = opts.header && i === 0;
    const fill = dark ? NAVY : header ? PANEL : "#FFFFFF";
    doc.setFillColor(fill);
    doc.rect(x, y + i * rowH, colW.reduce((a, b) => a + b, 0), rowH, "F");
    doc.setDrawColor("#EEF2F7");
    doc.line(x, y + (i + 1) * rowH, x + colW.reduce((a, b) => a + b, 0), y + (i + 1) * rowH);
    let cx = x;
    row.forEach((cell, c) => {
      doc.setFont("helvetica", header || dark || c === 0 ? "bold" : "normal");
      doc.setFontSize(header ? 7.2 : 9.2);
      doc.setTextColor(dark ? "#FFFFFF" : header ? "#6F7F95" : c === 0 ? INK : NAVY);
      const descriptiveLastColumn = row.length === 3 && c === 2;
      const align = c === 0 || descriptiveLastColumn ? "left" : "right";
      const tx = align === "right" ? cx + colW[c] - 12 : cx + 12;
      const maxTextWidth = colW[c] - 20;
      const lines = doc.splitTextToSize(cell, maxTextWidth).slice(0, 2);
      doc.text(lines, tx, y + i * rowH + (lines.length > 1 ? rowH * 0.42 : rowH * 0.62), { align, lineHeightFactor: 1.15 });
      cx += colW[c];
    });
  });
  return y + rows.length * rowH;
}

function addCover(doc: jsPDF, data: ReportData, comp: ComparisonOutput) {
  doc.setFillColor(NAVY);
  doc.roundedRect(page.m, 58, 48, 48, 4, 4, "F");
  doc.setDrawColor("#FFFFFF");
  doc.setLineWidth(2);
  doc.line(page.m + 18, 86, page.m + 28, 68);
  doc.line(page.m + 28, 68, page.m + 22, 82);
  doc.line(page.m + 22, 82, page.m + 36, 82);
  doc.line(page.m + 36, 82, page.m + 24, 98);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor("#9AAAC0");
  doc.text("CONFIDENTIAL AUDIT", page.w - page.m, 64, { align: "right", charSpace: 2 });
  doc.text(`REF: TA-${new Date().getFullYear()}-${String(Math.floor(Date.now() / 1000)).slice(-3)}`, page.w - page.m, 80, { align: "right" });

  doc.setFont("times", "bold");
  doc.setFontSize(35);
  doc.setTextColor(NAVY);
  doc.text("Economic Analysis Report", page.m, 240);
  doc.setDrawColor("#806027");
  doc.setLineWidth(5);
  doc.line(page.m, 273, page.m + 72, 273);

  doc.setFont("times", "normal");
  doc.setFontSize(18);
  doc.setTextColor("#5F6F86");
  const subtitle = `Financial Comparison: Savita's Transol vs. bioTRANSOL vs. Transol Synth 100 for ${data.projectType === "new_transformer" ? "Brand New" : "Retrofill"} ${data.transformerRating} MVA, ${data.voltageClass} kV Transformer`;
  doc.text(doc.splitTextToSize(subtitle, 470), page.m, 315);

  doc.setDrawColor("#EDF1F5");
  doc.line(page.m, 440, page.w - page.m, 440);
  label(doc, "Prepared For", page.m, 488);
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(INK);
  doc.text(data.customerName || "Customer / Utility", page.m, 512);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text("Asset Management Division", page.m, 534);

  label(doc, "Date of Issue", 315, 488);
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(INK);
  doc.text(new Date().toLocaleDateString("en-IN"), 315, 512);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text("Generated by Transformer TCO Analyzer", 315, 534);

  doc.setFillColor(NAVY);
  doc.roundedRect(page.m, 560, page.w - page.m * 2, 120, 3, 3, "F");
  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor("#F1C879");
  doc.text("Executive Verdict", page.m + 36, 610);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor("#D7E2F0");
  const brandedBestCover = comp.bestValue === "Natural Ester" ? "bioTRANSOL (Natural Ester)" : comp.bestValue === "Synthetic Ester" ? "Transol Synth 100 (Synthetic Ester)" : "Savita's Transol (Mineral Oil)";
  doc.text(doc.splitTextToSize(`Based on the ${data.analysisYears}-year lifecycle evaluation, the model identifies ${brandedBestCover} as the lowest total life-cycle cost option.`, 170), page.m + 36, 635);
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.setTextColor("#F1C879");
  doc.text("RECOMMENDED", page.w - page.m - 36, 634, { align: "right" });
  addFooter(doc, 1);
}

function drawDynamicTable(doc: jsPDF, data: ReportData, r: any[][], x: number, y: number, bw: number, w: [number, number, number], opts: any) {
  const sM = data.compareMineral !== false;
  const sN = data.compareNatural !== false;
  const sS = data.compareSynthetic !== false;
  const activeCount = (sM ? 1 : 0) + (sN ? 1 : 0) + (sS ? 1 : 0);

  const rows = r.map(row => {
      const res = [row[0]];
      if (sM) res.push(row[1]);
      if (sN) res.push(row[2]);
      if (sS) res.push(row[3]);
      return res;
    });

  let colW: number[];
  if (activeCount === 3) {
    colW = [bw, w[0], w[1], w[2]];
  } else if (activeCount === 2) {
    // Distribute remaining width (484 - bw) evenly
    const remaining = 484 - bw;
    const splitW = Math.floor(remaining / 2);
    colW = [bw, splitW, remaining - splitW];
  } else {
    colW = [bw, 484 - bw];
  }

  simpleTable(doc, rows, x, y, colW, opts);
}

function addExecutive(doc: jsPDF, data: ReportData, comp: ComparisonOutput) {
  doc.addPage();
  sectionTitle(doc, "01", "Executive Summary", 80);
  body(doc, `This report evaluates the financial and operational impact of selecting transformer insulating oil across Savita's Transol (Mineral Oil), bioTRANSOL (Natural Ester), and Transol Synth 100 (Synthetic Ester) alternatives. The analysis uses editable assumptions from the application, including oil volume, transformer cost, service life, annual O&M, insurance, fire protection cost, failure risk, inflation and discount rate. All three oil technologies are manufactured in India by Savita Oil Technologies Limited—the pioneer who started production and business of both Ester technologies in India first.`, page.m, 125, 480);
  const best = bestMetric(comp);
  const brandedBest = comp.bestValue === "Natural Ester" 
    ? "bioTRANSOL (Natural Ester)" 
    : comp.bestValue === "Synthetic Ester" 
    ? "Transol Synth 100 (Synthetic Ester)" 
    : "Savita's Transol (Mineral Oil)";

  const savings = comp.bestValue === "Natural Ester" ? comp.naturalSavings : comp.bestValue === "Synthetic Ester" ? comp.syntheticSavings : 0;
  const brandedBestExec = comp.bestValue === "Natural Ester" ? "bioTRANSOL" : comp.bestValue === "Synthetic Ester" ? "Transol Synth 100" : "Savita's Transol";
  metricCard(doc, "Lowest LCC", brandedBestExec, page.m, 220, 110);
  metricCard(doc, "LCC Savings", money(savings, true), page.m + 125, 220, 110);
  metricCard(doc, "AEC", money(best.annualEquivalentCost, true), page.m + 250, 220, 110);
  metricCard(doc, "Payback", comp.bestValue === "Natural Ester" ? yrs(comp.naturalPayback) : comp.bestValue === "Synthetic Ester" ? yrs(comp.syntheticPayback) : "Baseline", page.m + 375, 220, 110);

  sectionTitle(doc, "02", "Input Data Summary", 360);
  label(doc, "Asset Parameters", page.m, 420);
  label(doc, "Lifecycle Parameters", 310, 420);
  simpleTable(doc, [
    ["Transformer Rating", `${data.transformerRating} MVA`],
    ["Voltage Class", `${data.voltageClass} kV`],
    ["Oil Volume", `${data.oilVolume.toLocaleString("en-IN")} L`],
    ["Base Transformer Cost", money(data.baseTransformerCost, true)],
  ], page.m, 442, [155, 90]);
  simpleTable(doc, [
    ["Mineral Life", `${data.moLifeExpectancy} years`],
    ["Natural Ester Life", `${data.naturalLifeExpectancy} years`],
    ["Synthetic Ester Life", `${data.syntheticLifeExpectancy} years`],
    ["Analysis Period", `${data.analysisYears} years`],
    ["Discount Rate", pct(data.discountRate, 1)],
  ], 340, 442, [125, 75]);

  label(doc, "Oil Parameter Summary", page.m, 620);
  simpleTable(doc, [
    ["Parameter", "Savita's Transol (Mineral Oil)", "bioTRANSOL (Natural)", "Transol Synth 100 (Synthetic)"],
    ["Oil Cost", money(data.moOilCost), money(data.naturalOilCost), money(data.syntheticOilCost)],
    ["Annual O&M", money(data.moAnnualOM), money(data.naturalAnnualOM), money(data.syntheticAnnualOM)],
    ["Insurance / Year", money(data.moInsurancePremium), money(data.naturalInsurancePremium), money(data.syntheticInsurancePremium)],
    ["Failure Rate", pct(data.moFailureRate, 2), pct(data.naturalFailureRate, 2), pct(data.syntheticFailureRate, 2)],
  ], page.m, 630, [150, 110, 110, 114], { header: true, rowHeight: 27 });
  addFooter(doc, 2);
}

function addFinancial(doc: jsPDF, data: ReportData, comp: ComparisonOutput) {
  doc.addPage();
  sectionTitle(doc, "03", "Financial Analysis & Efficiency Metrics", 80);
  label(doc, "Investment Breakdown", page.m, 142);
  simpleTable(doc, [
    ["Category", "Savita's Transol (Mineral Oil)", "bioTRANSOL (Natural)", "Transol Synth 100 (Synthetic)"],
    ["Oil Fill Cost", money(comp.mineral.oilCost, true), money(comp.natural.oilCost, true), money(comp.synthetic.oilCost, true)],
    ["Fire Protection Capex", money(comp.mineral.fireProtectionCapex, true), money(comp.natural.fireProtectionCapex, true), money(comp.synthetic.fireProtectionCapex, true)],
    ["Initial Investment", money(comp.mineral.initialInvestment, true), money(comp.natural.initialInvestment, true), money(comp.synthetic.initialInvestment, true)],
  ], page.m, 170, [160, 108, 108, 108], { header: true, darkLast: true });

  label(doc, "Economic Efficiency Metrics", page.m, 350);
  const best = bestMetric(comp);
  simpleTable(doc, [
    ["Metric", "Value", "Interpretation"],
    ["Benefit-Cost Ratio (BCR)", `${best.benefitCostRatio.toFixed(2)}:1`, "Modeled benefit per rupee of lifecycle cost"],
    ["Annual Equivalent Cost", money(best.annualEquivalentCost, true), "Annualized lifecycle burden"],
    ["Cost per MVA-Year", money(best.costPerMVAYear, false), "Normalized rating-year metric"],
    ["Cost per MWh Throughput", money(best.costPerMWh, false), "Approximate throughput metric"],
    ["Simple ROI", pct(best.simpleROI, 2), "Modelled return using supplied calculation"],
    ["Investment Multiple", `${best.investmentMultiple.toFixed(2)}x`, "Total benefits as multiple of initial investment"],
  ], page.m, 380, [205, 115, 164], { header: true });

  label(doc, "Analytical Reading", page.m, 660);
  doc.setFillColor(PANEL);
  doc.roundedRect(page.m, 682, page.w - 2 * page.m, 72, 2, 2, "F");
  doc.setFillColor(NAVY);
  doc.rect(page.m, 682, 4, 72, "F");
  body(
    doc,
    `The recommended option is selected strictly by lowest total life-cycle cost in the supplied calculation. Capital cost, oil fill cost, fire protection cost, O&M present value, insurance present value, expected failure-cost present value, replacement present value and salvage credit are all reflected in the comparison.`,
    page.m + 24,
    708,
    430,
    9.2,
    3
  );
  addFooter(doc, 3);
}

function addCostEffectiveness(doc: jsPDF, data: ReportData, comp: ComparisonOutput) {
  doc.addPage();
  sectionTitle(doc, "04", "Cost-Effectiveness Analysis", 80);
  label(doc, "Unit Cost Metrics", page.m, 142);
  const best = bestMetric(comp);
  simpleTable(doc, [
    ["Parameter", "Value", "Unit"],
    ["Cost per MVA", money(best.costPerMVA), "Per MVA of rating"],
    ["Cost per Year", money(best.costPerYear), "Per analysis year"],
    ["Cost per MVA-Year", money(best.costPerMVAYear), "Normalized efficiency metric"],
    ["Cost per MWh Throughput", money(best.costPerMWh), "Per MWh of energy handled"],
  ], page.m, 170, [220, 120, 144], { header: true });

  label(doc, "Comparison Against Mineral Oil Baseline", page.m, 390);
  simpleTable(doc, [
    ["Alternative", "TLCC Delta / Savings", "Payback", "AEC"],
    ["bioTRANSOL (Natural)", money(comp.naturalSavings, true), yrs(comp.naturalPayback), money(comp.natural.annualEquivalentCost, true)],
    ["Transol Synth 100 (Synthetic)", money(comp.syntheticSavings, true), yrs(comp.syntheticPayback), money(comp.synthetic.annualEquivalentCost, true)],
    ["Synthetic vs Natural", money(comp.naturalVsSyntheticSavings, true), "N/A", "Relative TLCC difference"],
  ], page.m, 420, [150, 145, 95, 94], { header: true });

  label(doc, "Commercial Sensitivity Flags", page.m, 600);
  simpleTable(doc, [
    ["Input Lever", "Current Assumption", "Commercial Impact"],
    ["Inflation Rate", pct(data.inflationRate, 1), "Escalates future O&M, insurance and failure costs"],
    ["Discount Rate", pct(data.discountRate, 1), "Controls present value of long-term lifecycle benefits"],
    ["Failure Cost", money(data.failureCost, true), "Converts reliability risk into expected annual cost"],
    ["Oil Volume", `${data.oilVolume.toLocaleString("en-IN")} L`, "Directly drives fill-cost premium across oil types"],
  ], page.m, 622, [155, 125, 204], { header: true, rowHeight: 27 });
  addFooter(doc, 4);
}

function addLcc(doc: jsPDF, comp: ComparisonOutput) {
  doc.addPage();
  sectionTitle(doc, "05", "Life Cycle Cost Analysis", 80);
  label(doc, "LCC Summary Comparison", page.m, 140);
  simpleTable(doc, [
    ["Cost Component (PV)", "Savita's Transol (Mineral Oil)", "bioTRANSOL (Natural)", "Transol Synth 100 (Synthetic)"],
    ["Initial Investment / Capital Cost", money(comp.mineral.initialInvestment, true), money(comp.natural.initialInvestment, true), money(comp.synthetic.initialInvestment, true)],
    ["Annual O&M Costs (PV)", money(comp.mineral.omPV, true), money(comp.natural.omPV, true), money(comp.synthetic.omPV, true)],
    ["Insurance Costs (PV)", money(comp.mineral.insurancePV, true), money(comp.natural.insurancePV, true), money(comp.synthetic.insurancePV, true)],
    ["Failure Risk Cost (PV)", money(comp.mineral.failureCostPV, true), money(comp.natural.failureCostPV, true), money(comp.synthetic.failureCostPV, true)],
    ["Asset Replacement Cost (PV)", money(comp.mineral.replacementPV, true), money(comp.natural.replacementPV, true), money(comp.synthetic.replacementPV, true)],
    ["Salvage Value Credit (PV)", `- ${money(comp.mineral.salvagePV, true)}`, `- ${money(comp.natural.salvagePV, true)}`, `- ${money(comp.synthetic.salvagePV, true)}`],
    ["Total Life Cycle Cost (LCC)", money(comp.mineral.totalLifeCycleCost, true), money(comp.natural.totalLifeCycleCost, true), money(comp.synthetic.totalLifeCycleCost, true)],
  ], page.m, 168, [170, 105, 105, 104], { header: true, darkLast: true });

  const best = bestMetric(comp);
  const worst = Math.max(comp.mineral.totalLifeCycleCost, comp.natural.totalLifeCycleCost, comp.synthetic.totalLifeCycleCost);
  const reduction = worst > 0 ? ((worst - best.totalLifeCycleCost) / worst) * 100 : 0;
  doc.setFillColor(PANEL);
  doc.roundedRect(page.m, 472, page.w - 2 * page.m, 70, 2, 2, "F");
  label(doc, "TCO Reduction Percentage", page.m + 24, 500);
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(NAVY);
  doc.text(pct(reduction, 2), page.m + 24, 525);
  label(doc, "Annualized TCO of Recommended Option", page.w - page.m - 170, 500);
  doc.text(`${money(best.annualEquivalentCost, true)} / Year`, page.w - page.m - 24, 525, { align: "right" });

  label(doc, "Relative LCC Projection", page.m + 125, 620);
  const chartX = page.m + 40, chartY = 650, chartW = 410, chartH = 105;
  doc.setFillColor(PANEL);
  doc.rect(chartX, chartY, chartW, chartH, "F");
  const vals = [comp.mineral.totalLifeCycleCost, comp.natural.totalLifeCycleCost, comp.synthetic.totalLifeCycleCost];
  const max = Math.max(...vals) * 1.08;
  const barW = 70;
  ["Savita's Transol", "bioTRANSOL", "Transol Synth 100"].forEach((name, i) => {
    const h = (vals[i] / max) * (chartH - 28);
    const x = chartX + 50 + i * 125;
    doc.setFillColor(i === 0 ? "#A0642D" : i === 1 ? "#208A67" : "#1E7EA6");
    doc.rect(x, chartY + chartH - h - 18, barW, h, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(INK);
    doc.text(name, x + barW / 2, chartY + chartH - 6, { align: "center" });
    doc.setTextColor(NAVY);
    doc.text(money(vals[i], true), x + barW / 2, chartY + chartH - h - 24, { align: "center" });
  });
  addFooter(doc, 5);
}

function addConclusion(doc: jsPDF, comp: ComparisonOutput) {
  doc.addPage();
  sectionTitle(doc, "06", "Conclusion & Roadmap", 80);
  label(doc, "Safety & Risk Reduction", page.m, 145);
  label(doc, "Environmental & Operational", 310, 145);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(MUTED);
  ["Fire protection cost explicitly modelled", "Failure-risk cost included in PV terms", "Insurance and O&M differences normalized"].forEach((t, i) => doc.text(`•  ${t}`, page.m, 175 + i * 24));
  ["Longer service life options compared", "Lifecycle cost reported annually and per MVA", "CSV and PDF outputs available for review"].forEach((t, i) => doc.text(`•  ${t}`, 310, 175 + i * 24));

  doc.setFillColor(PANEL);
  doc.rect(page.m, 285, page.w - 2 * page.m, 135, "F");
  doc.setFillColor(NAVY);
  doc.rect(page.m, 285, 4, 135, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(17);
  doc.setTextColor(INK);
  doc.text("Final Recommendation", page.m + 35, 330);
  const brandedBestConclusion = comp.bestValue === "Natural Ester" ? "bioTRANSOL (Natural Ester)" : comp.bestValue === "Synthetic Ester" ? "Transol Synth 100 (Synthetic Ester)" : "Savita's Transol (Mineral Oil)";
  body(doc, `The model recommends ${brandedBestConclusion} based on the lowest total life-cycle cost under the supplied assumptions. Savita Oil Technologies Limited is the pioneer manufacturer of all kinds of Mineral Oil, Natural Ester Oil (bioTRANSOL), and Synthetic Ester Oil (Transol Synth 100) in India, having started production and business of both Ester technologies first in India. Before commercial approval, validate every input against project-specific procurement, engineering, insurance and utility reliability data.`, page.m + 35, 365, 400, 10.5);

  label(doc, "Implementation Roadmap", page.m, 480);
  const steps = [
    ["01", "Management Authorization & Budget Approval", "Confirm lifecycle-cost assumptions and approve the comparison basis."],
    ["02", "Technical Specification & Procurement", "Finalize oil specification, volume, fire protection scope and service contract."],
    ["03", "On-site Execution", "Plan filling or retrofilling activity, oil handling, filtration and commissioning checks."],
    ["04", "Monitoring & Verification", "Track DGA, moisture, dielectric properties and operating performance after implementation."],
  ];
  steps.forEach((s, i) => {
    const y = 510 + i * 62;
    doc.setDrawColor(234, 239, 246);
    doc.roundedRect(page.m, y, page.w - 2 * page.m, 48, 2, 2);
    doc.setFont("times", "italic");
    doc.setFontSize(16);
    doc.setTextColor(NAVY);
    doc.text(s[0], page.m + 20, y + 29);
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(INK);
    doc.text(s[1], page.m + 56, y + 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED);
    doc.text(s[2], page.m + 56, y + 38);
  });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor("#9AAAC0");
  doc.text("This report is electronically generated and valid without signature.", page.w - page.m, page.h - 38, { align: "right" });
  addFooter(doc, 6);
}

export function generateReportPdf(data: ReportData, comp: ComparisonOutput) {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  doc.setProperties({
    title: "Transformer Oil Economic Analysis Report",
    subject: "Transformer oil type financial comparison",
    author: "Perplexity Computer",
    creator: "Transformer TCO Analyzer",
  });

  addCover(doc, data, comp);
  addExecutive(doc, data, comp);
  addFinancial(doc, data, comp);
  addCostEffectiveness(doc, data, comp);
  addLcc(doc, comp);
  addConclusion(doc, comp);

  const cleanCustomer = (data.customerName || "customer").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  doc.save(`economic-analysis-report-${cleanCustomer}.pdf`);
}







