// Transformer Oil Financial Comparison — calculations
// Formulas preserved from the supplied TransformerComparisonAnalysis React component.

export interface ReportData {
  customerName: string;
  projectType: "retrofill" | "new_transformer";
  transformerRating: number; // MVA
  voltageClass: string;
  oilVolume: number; // litres

  baseTransformerCost: number; // INR (transformer without oil)

  // Mineral Oil
  moOilCost: number; // INR per litre
  moLifeExpectancy: number; // years
  moAnnualOM: number; // INR / year
  moSalvagePercent: number; // percent of initial investment at end of life
  moInsurancePremium: number; // INR / year
  moFireProtectionCapex: number; // INR upfront
  moFireProtectionOM: number; // INR / year
  moFailureRate: number; // percent per year

  // Natural Ester
  naturalOilCost: number;
  naturalLifeExpectancy: number;
  naturalAnnualOM: number;
  naturalSalvagePercent: number;
  naturalInsurancePremium: number;
  naturalFireProtectionCapex: number;
  naturalFireProtectionOM: number;
  naturalFailureRate: number;

  // Synthetic Ester
  syntheticOilCost: number;
  syntheticLifeExpectancy: number;
  syntheticAnnualOM: number;
  syntheticSalvagePercent: number;
  syntheticInsurancePremium: number;
  syntheticFireProtectionCapex: number;
  syntheticFireProtectionOM: number;
  syntheticFailureRate: number;

  // Common
  inflationRate: number; // percent
  discountRate: number; // percent
  analysisYears: number; // typically 30
  failureCost: number; // INR per failure event
  compareMineral?: boolean;
  compareNatural?: boolean;
  compareSynthetic?: boolean;
}

export const defaultReportData: ReportData = {
  customerName: "ABC Power Corporation Ltd.",
  projectType: "retrofill",
  transformerRating: 50,
  voltageClass: "132/33",
  oilVolume: 27000,

  baseTransformerCost: 40000000,

  // Mineral Oil
  moOilCost: 80,
  moLifeExpectancy: 25,
  moAnnualOM: 300000,
  moSalvagePercent: 20,
  moInsurancePremium: 100000,
  moFireProtectionCapex: 2000000,
  moFireProtectionOM: 50000,
  moFailureRate: 2.5,

  // Natural Ester
  naturalOilCost: 180,
  naturalLifeExpectancy: 40,
  naturalAnnualOM: 100000,
  naturalSalvagePercent: 25,
  naturalInsurancePremium: 60000,
  naturalFireProtectionCapex: 0,
  naturalFireProtectionOM: 0,
  naturalFailureRate: 1.0,

  // Synthetic Ester
  syntheticOilCost: 250,
  syntheticLifeExpectancy: 45,
  syntheticAnnualOM: 80000,
  syntheticSalvagePercent: 30,
  syntheticInsurancePremium: 50000,
  syntheticFireProtectionCapex: 0,
  syntheticFireProtectionOM: 0,
  syntheticFailureRate: 0.5,

  inflationRate: 6,
  discountRate: 10,
  analysisYears: 30,
  failureCost: 5000000,
  compareMineral: true,
  compareNatural: true,
  compareSynthetic: true,
};

// Present value of an escalating annuity:
// Cash flow grows at `inflation`, discounted at `discount`, over `years`.
export function calculateEscalatingAnnuityPV(
  annualAmount: number,
  inflation: number,
  discount: number,
  years: number
): number {
  const g = inflation / 100;
  const r = discount / 100;
  const n = years;

  if (annualAmount === 0 || n <= 0) return 0;

  if (Math.abs(g - r) < 0.0001) {
    return (annualAmount * n) / (1 + r);
  }

  const growthFactor = Math.pow(1 + g, n);
  const discountFactor = Math.pow(1 + r, n);
  const ratio = growthFactor / discountFactor;
  const numerator = 1 - ratio;
  const denominator = r - g;
  const annuityFactor = numerator / denominator;

  return annualAmount * annuityFactor;
}

export interface OilMetrics {
  // Inputs echoed
  oilType: string;
  oilCost: number; // total INR for oil at t=0
  lifeExpectancy: number;
  failureRate: number;
  fireProtectionCapex: number;
  fireProtectionOM: number;
  // Computed
  initialInvestment: number; // base transformer + oil + fire protection capex
  omPV: number;
  insurancePV: number;
  failureCostPV: number;
  salvagePV: number;
  replacementPV: number; // additional oil purchases beyond life expectancy
  fireProtectionOMPV: number;
  totalLifeCycleCost: number;
  annualEquivalentCost: number;
  costPerYear: number;
  costPerMVAYear: number;
  costPerMWh: number;
  costPerMVA: number;
  benefitCostRatio: number;
  investmentMultiple: number;
  simpleROI: number;
}

export interface OilInputs {
  oilType: "Mineral Oil" | "Natural Ester" | "Synthetic Ester";
  oilCostPerLitre: number;
  lifeExpectancy: number;
  annualOM: number;
  salvagePercent: number;
  insurancePremium: number;
  fireProtectionCapex: number;
  fireProtectionOM: number;
  failureRate: number;
}

export function calculateOilTypeMetrics(
  data: ReportData,
  oil: OilInputs
): OilMetrics {
  const { baseTransformerCost, oilVolume, transformerRating, inflationRate, discountRate, analysisYears, failureCost } = data;

  const oilCostInitial = oil.oilCostPerLitre * oilVolume;
  
  let initialInvestment = 0;
  if (data.projectType === "new_transformer") {
    initialInvestment = baseTransformerCost + oilCostInitial + oil.fireProtectionCapex;
  } else {
    // Retrofill: Transformer already exists. You only pay for the oil exchange.
    // Fire protection CapEx is already sunk cost (or not needed for ester).
    initialInvestment = oilCostInitial;
  }
  const yearsToAnalyze = Math.min(analysisYears, oil.lifeExpectancy);

  const totalAnnualOM = oil.annualOM + oil.fireProtectionOM;
  let omPV = calculateEscalatingAnnuityPV(totalAnnualOM, inflationRate, discountRate, yearsToAnalyze);
  let insurancePV = calculateEscalatingAnnuityPV(oil.insurancePremium, inflationRate, discountRate, yearsToAnalyze);

  let failureCostPV = 0;
  for (let year = 1; year <= yearsToAnalyze; year++) {
    const expectedFailureCost = failureCost * (oil.failureRate / 100);
    const escalatedCost = expectedFailureCost * Math.pow(1 + inflationRate / 100, year);
    failureCostPV += escalatedCost / Math.pow(1 + discountRate / 100, year);
  }

  const baseAssetValue = data.projectType === "new_transformer" ? initialInvestment : baseTransformerCost + oilCostInitial;
  const salvageValue = baseAssetValue * (oil.salvagePercent / 100);
  const salvagePV = salvageValue / Math.pow(1 + discountRate / 100, oil.lifeExpectancy);

  let replacementPV = 0;
  let totalLifeCycleCost = initialInvestment + omPV + insurancePV + failureCostPV - salvagePV;

  if (analysisYears > oil.lifeExpectancy) {
    const replacementYear = oil.lifeExpectancy;
    const fullAssetCost = baseTransformerCost + oilCostInitial + oil.fireProtectionCapex;
    const futureReplacementCost = fullAssetCost * Math.pow(1 + inflationRate / 100, replacementYear);
    replacementPV = (futureReplacementCost - salvageValue) / Math.pow(1 + discountRate / 100, replacementYear);

    const remainingYears = analysisYears - oil.lifeExpectancy;
    if (remainingYears > 0) {
      const futureAnnualOM = totalAnnualOM * Math.pow(1 + inflationRate / 100, replacementYear + 1);
      const futureInsurance = oil.insurancePremium * Math.pow(1 + inflationRate / 100, replacementYear + 1);

      const futureOMPV = calculateEscalatingAnnuityPV(futureAnnualOM, inflationRate, discountRate, remainingYears);
      const futureInsurancePV = calculateEscalatingAnnuityPV(futureInsurance, inflationRate, discountRate, remainingYears);

      const discountedFutureOM = futureOMPV / Math.pow(1 + discountRate / 100, replacementYear);
      const discountedFutureInsurance = futureInsurancePV / Math.pow(1 + discountRate / 100, replacementYear);

      omPV += discountedFutureOM;
      insurancePV += discountedFutureInsurance;
      totalLifeCycleCost = initialInvestment + omPV + insurancePV + failureCostPV - salvagePV + replacementPV;
    } else {
      totalLifeCycleCost = initialInvestment + omPV + insurancePV + failureCostPV - salvagePV + replacementPV;
    }
  }

  const costPerYear = totalLifeCycleCost / analysisYears;
  const costPerMVAYear = costPerYear / transformerRating;
  const annualEnergy = transformerRating * 0.67 * 8760;
  const costPerMWh = costPerYear / annualEnergy;

  const r = discountRate / 100;
  const n = analysisYears;
  const annuityFactor = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const annualEquivalentCost = totalLifeCycleCost * annuityFactor;

  const totalBenefits = initialInvestment + omPV + insurancePV + failureCostPV;
  const benefitCostRatio = totalBenefits / totalLifeCycleCost;
  const investmentMultiple = totalBenefits / initialInvestment;
  const simpleROI = ((totalBenefits - totalLifeCycleCost) / initialInvestment) * 100;
  const costPerMVA = initialInvestment / transformerRating;

  return {
    oilType: oil.oilType,
    oilCost: oilCostInitial,
    lifeExpectancy: oil.lifeExpectancy,
    failureRate: oil.failureRate,
    fireProtectionCapex: oil.fireProtectionCapex,
    fireProtectionOM: oil.fireProtectionOM,
    initialInvestment,
    omPV,
    insurancePV,
    failureCostPV,
    salvagePV,
    replacementPV,
    fireProtectionOMPV: calculateEscalatingAnnuityPV(oil.fireProtectionOM, inflationRate, discountRate, yearsToAnalyze),
    totalLifeCycleCost,
    annualEquivalentCost,
    costPerYear,
    costPerMVAYear,
    costPerMWh,
    costPerMVA,
    benefitCostRatio,
    investmentMultiple,
    simpleROI,
  };
}

export interface ComparisonOutput {
  mineral: OilMetrics;
  natural: OilMetrics;
  synthetic: OilMetrics;
  lowestLCC: string;
  moVsNaturalSavings: number;
  moVsSyntheticSavings: number;
  naturalVsSyntheticSavings: number;
  moVsNaturalNPV: number;
  moVsSyntheticNPV: number;
  // Best (lowest TLCC)
  bestValue: "Mineral Oil" | "Natural Ester" | "Synthetic Ester";
  // Comparison vs mineral baseline
  naturalSavings: number; // mineral.TLCC - natural.TLCC (positive => savings)
  syntheticSavings: number;
  naturalBenefitCostRatio: number; // savings / extra capex
  syntheticBenefitCostRatio: number;
  naturalInvestmentMultiple: number; // savings / extra capex (same numerically as BCR; included for spec compliance)
  syntheticInvestmentMultiple: number;
  naturalSimpleROI: number; // %
  syntheticSimpleROI: number;
  naturalPayback: number; // years
  syntheticPayback: number;
  synthVsNatPayback: number;
  synthVsNatSavings: number;
}

export function performComparison(data: ReportData): ComparisonOutput {
  const mineral = calculateOilTypeMetrics(data, {
    oilType: "Mineral Oil",
    oilCostPerLitre: data.moOilCost,
    lifeExpectancy: data.moLifeExpectancy,
    annualOM: data.moAnnualOM,
    salvagePercent: data.moSalvagePercent,
    insurancePremium: data.moInsurancePremium,
    fireProtectionCapex: data.moFireProtectionCapex,
    fireProtectionOM: data.moFireProtectionOM,
    failureRate: data.moFailureRate,
  });

  const natural = calculateOilTypeMetrics(data, {
    oilType: "Natural Ester",
    oilCostPerLitre: data.naturalOilCost,
    lifeExpectancy: data.naturalLifeExpectancy,
    annualOM: data.naturalAnnualOM,
    salvagePercent: data.naturalSalvagePercent,
    insurancePremium: data.naturalInsurancePremium,
    fireProtectionCapex: data.naturalFireProtectionCapex,
    fireProtectionOM: data.naturalFireProtectionOM,
    failureRate: data.naturalFailureRate,
  });

  const synthetic = calculateOilTypeMetrics(data, {
    oilType: "Synthetic Ester",
    oilCostPerLitre: data.syntheticOilCost,
    lifeExpectancy: data.syntheticLifeExpectancy,
    annualOM: data.syntheticAnnualOM,
    salvagePercent: data.syntheticSalvagePercent,
    insurancePremium: data.syntheticInsurancePremium,
    fireProtectionCapex: data.syntheticFireProtectionCapex,
    fireProtectionOM: data.syntheticFireProtectionOM,
    failureRate: data.syntheticFailureRate,
  });

  const naturalSavings = mineral.totalLifeCycleCost - natural.totalLifeCycleCost;
  const syntheticSavings = mineral.totalLifeCycleCost - synthetic.totalLifeCycleCost;
  const naturalVsSyntheticSavings = natural.totalLifeCycleCost - synthetic.totalLifeCycleCost;

  const naturalExtra = natural.initialInvestment - mineral.initialInvestment;
  const syntheticExtra = synthetic.initialInvestment - mineral.initialInvestment;

  const naturalPayback = naturalExtra > 0 ? naturalExtra / (mineral.annualEquivalentCost - natural.annualEquivalentCost) : 0;
  const syntheticPayback = syntheticExtra > 0 ? syntheticExtra / (mineral.annualEquivalentCost - synthetic.annualEquivalentCost) : 0;

  const synthVsNatExtra = synthetic.initialInvestment - natural.initialInvestment;
  const synthVsNatPayback = synthVsNatExtra > 0 ? synthVsNatExtra / (natural.annualEquivalentCost - synthetic.annualEquivalentCost) : 0;

  const tlccs: { name: ComparisonOutput["bestValue"]; v: number }[] = [];
  if (data.compareMineral !== false) {
    tlccs.push({ name: "Mineral Oil", v: mineral.totalLifeCycleCost });
  }
  if (data.compareNatural !== false) {
    tlccs.push({ name: "Natural Ester", v: natural.totalLifeCycleCost });
  }
  if (data.compareSynthetic !== false) {
    tlccs.push({ name: "Synthetic Ester", v: synthetic.totalLifeCycleCost });
  }
  if (tlccs.length === 0) {
    tlccs.push({ name: "Mineral Oil", v: mineral.totalLifeCycleCost });
  }
  tlccs.sort((a, b) => a.v - b.v);
  const bestValue = tlccs[0].name;

  return {
    mineral,
    natural,
    synthetic,
    lowestLCC: bestValue,
    moVsNaturalSavings: naturalSavings,
    moVsSyntheticSavings: syntheticSavings,
    naturalVsSyntheticSavings,
    moVsNaturalNPV: natural.totalLifeCycleCost - mineral.totalLifeCycleCost,
    moVsSyntheticNPV: synthetic.totalLifeCycleCost - mineral.totalLifeCycleCost,
    bestValue,
    naturalSavings,
    syntheticSavings,
    naturalBenefitCostRatio: natural.benefitCostRatio,
    syntheticBenefitCostRatio: synthetic.benefitCostRatio,
    naturalInvestmentMultiple: natural.investmentMultiple,
    syntheticInvestmentMultiple: synthetic.investmentMultiple,
    naturalSimpleROI: natural.simpleROI,
    syntheticSimpleROI: synthetic.simpleROI,
    naturalPayback,
    syntheticPayback,
    synthVsNatPayback,
    synthVsNatSavings: naturalVsSyntheticSavings,
  };
}

// Indian Rupee formatter — matches Indian numbering system (lakhs/crores)
export const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(v: number | undefined | null): string {
  if (v === undefined || v === null || !isFinite(v)) return "—";
  return inrFormatter.format(Math.round(v));
}

export function formatINRCompact(v: number | undefined | null): string {
  if (v === undefined || v === null || !isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `₹${(v / 1_00_000).toFixed(2)} L`;
  return inrFormatter.format(Math.round(v));
}

export function formatNumber(v: number, digits = 2): string {
  if (!isFinite(v)) return "—";
  return v.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export function formatPercent(v: number, digits = 2): string {
  if (!isFinite(v)) return "—";
  return `${(v).toFixed(digits)}%`;
}
