export interface QAItem {
  id: string;
  category: string;
  question: string;
  answerTemplate: string;
  keywords: string[];
}

// Helpers for currency formatting
export function formatINR(v: number | undefined | null): string {
  if (v === undefined || v === null || !isFinite(v)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(v));
}

export function formatINRCompact(v: number | undefined | null): string {
  if (v === undefined || v === null || !isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `₹${(v / 1_00_000).toFixed(2)} Lakh`;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(v));
}

export function formatNumber(v: number, digits = 2): string {
  if (!isFinite(v)) return "—";
  return v.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export function formatPercent(v: number, digits = 2): string {
  if (!isFinite(v)) return "—";
  return `${v.toFixed(digits)}%`;
}

export const knowledgeBase: QAItem[] = [
  {
    id: "Q1",
    category: "Financial & TCO Metrics",
    question: "The report shows a negative NPV. If it's negative, why are you recommending this project?",
    answerTemplate: "Fair question — this one confuses a lot of people the first time they see it. A negative NPV in this analysis doesn't mean the project loses money. It simply means the cash savings generated over {analysisYears} years, when discounted back to today's value at {discountRate}%, fall {activeSavingsShortfall} short of the upfront investment in today's terms. But look at the BCR of {activeBCR} — for every rupee you invest, you get back nearly {activeBCRValueRounded} times that. The total undiscounted savings are massive. The negative NPV here is a reflection of how aggressively we've discounted future savings at {discountRate}%, which is actually a conservative rate. The real question to ask is: what happens if you don't retrofit/upgrade? You replace the transformer later and spend {moLCC} in total lifecycle costs versus {activeLCC} with the bioTRANSOL / TRANSOLSYNTH Ester fluid upgrade. That gap of {activeSavings} is your real answer.",
    keywords: ["npv", "negative", "recommending", "recommend", "lose", "loses"]
  },
  {
    id: "Q2",
    category: "Financial & TCO Metrics",
    question: "What exactly is IRR and what does it tell us about this project?",
    answerTemplate: "IRR — Internal Rate of Return — is the discount rate at which your investment breaks exactly even in NPV terms. Think of it as the effective annual return the project generates on the capital deployed. The IRR computed for this ester oil project indicates how the investment performs over the {analysisYears}-year period. While utility capital investments often face a high cost of capital hurdle (around {discountRate}%), asset-life extension projects are typically evaluated on cost avoidance rather than pure revenue. Against the baseline of spending {moLCC} on mineral oil systems and replacements, investing {activeInitial} in Savita's Ester technology is a genuinely good deal, yielding a Benefit-Cost Ratio of {activeBCR}:1.",
    keywords: ["irr", "return", "internal rate", "hurdle", "percent"]
  },
  {
    id: "Q3",
    category: "Financial & TCO Metrics",
    question: "The Payback Period seems long. Isn't that a risk?",
    answerTemplate: "For a commercial loan or a startup, yes, a long payback is a concern. For a power distribution transformer — not really. This is a {analysisYears}-year analysis, so you recover your investment (which is {activePayback} years for bioTRANSOL/TRANSOLSYNTH) well within the analysis window and still pocket many years of pure savings after payback. More importantly, compare it to the alternative: spending {moLCC} on the mineral baseline and replacement. That capital never comes back. Here you're spending {activeInitial} on the Ester fluid upgrade and getting {activeLife} years of useful life. The payback calculation is also conservative — it uses discounted cash flows. The simple (undiscounted) payback is much shorter. And remember, annualised TCO savings are {activeAnnualisedSavings} per year once you're in the savings zone.",
    keywords: ["payback", "long", "recover", "years payback"]
  },
  {
    id: "Q4",
    category: "Financial & TCO Metrics",
    question: "What is BCR and how do we interpret it?",
    answerTemplate: "BCR stands for Benefit-Cost Ratio. It's calculated as the total present value of all benefits divided by the total present value of all costs. The BCR for our recommended Ester oil is {activeBCR}:1, meaning for every ₹1 you put in, you get {activeBCR} worth of lifecycle benefits back. Anything above 1.0 means benefits exceed costs. Most utility infrastructure projects aim for a BCR of 1.5 to 2.0. The recommended bioTRANSOL / TRANSOLSYNTH's BCR of {activeBCR} is exceptionally strong, directly proving that this project is highly worth doing for {customerName}.",
    keywords: ["bcr", "benefit cost", "benefit-cost", "ratio", "interpret"]
  },
  {
    id: "Q5",
    category: "Financial & TCO Metrics",
    question: "Can you explain Simple ROI in plain terms?",
    answerTemplate: "Simple ROI is just total net benefit divided by total investment, expressed as a percentage — no discounting, no time adjustment. For our recommended bioTRANSOL (Natural Ester) or TRANSOLSYNTH (Synthetic Ester) option, the Simple ROI is {activeROI}. This means over the analysis period, the total savings generated are over {activeROIMultiple} times the money you put in. You invest {activeInitial} and get back massive savings. It ignores the time value of money, which is why we use NPV for rigorous evaluation, but it gives a clean, intuitive feel for the scale of return for your operations team.",
    keywords: ["roi", "simple roi", "return on investment", "plain terms"]
  },
  {
    id: "Q6",
    category: "Financial & TCO Metrics",
    question: "What does the Investment Multiple mean?",
    answerTemplate: "An investment multiple (here {activeMultiple}x) means every rupee invested returns {activeMultiple} times in total benefits. It's the language of private equity and infrastructure finance. If someone asks 'how many times does this investment pay back?' the answer for {customerName}'s project is: {activeMultiple} times. That's a highly compelling number to present in the boardroom.",
    keywords: ["multiple", "investment multiple", "multiplier"]
  },
  {
    id: "Q7",
    category: "Financial & TCO Metrics",
    question: "What is the Risk Adjusted Premium and should we be worried?",
    answerTemplate: "The Risk Adjusted Premium represents the return premium relative to your cost of capital hurdle. In asset-life extension projects, the primary value is cost avoidance (not revenue generation), so a premium gap is normal and expected. The important thing is that the total economic value — {activeSavings} in TCO reduction — is real, bankable, and directly reduces the utility's capital exposure.",
    keywords: ["premium", "risk adjusted", "worried", "risk-adjusted"]
  },
  {
    id: "Q8",
    category: "Financial & TCO Metrics",
    question: "The report uses the specified Discount Rate. Why this number specifically?",
    answerTemplate: "The discount rate ({discountRate}%) reflects the approximate weighted average cost of capital (WACC) for distribution utilities. It's the rate at which future money is 'deflated' to present value. Using a high rate like {discountRate}% makes distant savings look smaller. If we used a lower rate closer to actual utility lending rates, the NPV would be even more positive. This conservative choice ensures all benefits are understated, making your business case highly robust.",
    keywords: ["discount", "discount rate", "wacc", "wacc rate"]
  },
  {
    id: "Q9",
    category: "Investment & Cost Questions",
    question: "Ester oil is much more expensive per litre than mineral oil. Isn't mineral oil cheaper?",
    answerTemplate: "Yes, mineral oil costs roughly {moOilCostLitre}/L, while bioTRANSOL / TRANSOLSYNTH costs {activeOilCostLitre}/L, making Ester look several times more expensive initially. But that comparison only makes sense if both fluids did the same job for the duration — and they don't. bioTRANSOL (Natural Ester) and TRANSOLSYNTH (Synthetic Ester) extend insulation life by 5–8 times, has a flash point above 300°C (K-class) vs 140°C for mineral oil (reducing fire risk and insurance costs), and is fully biodegradable. You aren't just buying fluid; you are buying extended asset life and safety. When priced over the asset lifecycle, Savita's Ester fluids are far cheaper.",
    keywords: ["expensive", "cheaper", "mineral oil", "cost per litre", "price per litre", "fluid cost", "comparison"]
  },
  {
    id: "Q10",
    category: "Investment & Cost Questions",
    question: "What's included in the Retrofitting & Engineering Services cost?",
    answerTemplate: "The retrofitting process is a comprehensive asset rehabilitation. It covers thoroughly draining and flushing the transformer tank to eliminate mineral oil contamination (compatibility matters), replacing gaskets/seals to prevent leaks, vacuum processing to remove moisture/dissolved gases, and establishing a baseline DGA. This engineering care ensures you get the full lifetime benefit of the bioTRANSOL / TRANSOLSYNTH Ester fluid (manufactured by Savita Oil Technologies Limited).",
    keywords: ["retrofitting", "engineering services", "included", "installation", "labor", "commissioning"]
  },
  {
    id: "Q11",
    category: "Investment & Cost Questions",
    question: "What is Cost per MVA and how does it compare to buying a new transformer?",
    answerTemplate: "Cost per MVA normalises the investment against rating capacity. For this project, retrofitting costs {activeCostPerMVA} per MVA. A new {rating} MVA transformer today costs between {newTransformerEstimateRange}. That works out to a massive ₹25-40 Lakh per MVA. Spending {activeCostPerMVA} per MVA to rehabilitate and extend the life of your existing asset is an exceptional deal.",
    keywords: ["cost per mva", "per mva", "new transformer", "buy new"]
  },
  {
    id: "Q12",
    category: "Investment & Cost Questions",
    question: "What does 'Cost per MWh Throughput' mean in practical terms?",
    answerTemplate: "This metric takes the total initial investment and divides it by the total energy the transformer will handle over its extended life. At {activeCostPerMWh} per MWh, the cost is a fraction of a paisa per unit delivered. It proves to asset management teams that the investment is highly proportionate to the immense volume of energy being preserved.",
    keywords: ["throughput", "mwh", "cost per mwh", "energy"]
  },
  {
    id: "Q13",
    category: "Investment & Cost Questions",
    question: "How is the total capital investment calculated?",
    answerTemplate: "The initial investment for the bioTRANSOL/TRANSOLSYNTH option is {activeInitial}. This is calculated as the sum of the base transformer cost (excluding oil), the initial oil fill cost ({oilVolume} L @ {activeOilCostLitre}/L = {activeTotalOilCost}), and the upfront fire protection CapEx (which is {activeFireProtectionCapex} for Ester vs {moFireProtectionCapex} for mineral oil). Because bioTRANSOL and TRANSOLSYNTH are K-class fire-safe fluids, fire protection CapEx is eliminated (₹0), offsetting a huge chunk of the oil cost premium.",
    keywords: ["capital investment", "how calculated", "arrived", "total capital", "upfront cost"]
  },
  {
    id: "Q14",
    category: "Total Cost of Ownership & Lifecycle Analysis",
    question: "What drives the Mineral Oil baseline TCO so high?",
    answerTemplate: "The baseline scenario ({moLCC}) assumes you continue with Mineral Oil. Because mineral oil has a shorter life expectancy ({moLife} years), it forces transformer replacements and rebuilds within the {analysisYears}-year analysis window. In addition, you must pay for fire protection CapEx ({moFireProtectionCapex}) and ongoing maintenance, insurance, and failure costs. Savita's bioTRANSOL and TRANSOLSYNTH Ester oils avoid these replacements and fire system costs, keeping the TCO at a fraction of the baseline.",
    keywords: ["baseline", "TCO", "lifecycle cost", "mineral TCO", "high cost", "drives"]
  },
  {
    id: "Q15",
    category: "Total Cost of Ownership & Lifecycle Analysis",
    question: "How do you define 'Total Cost of Ownership' versus 'Life Cycle Cost'?",
    answerTemplate: "In this analysis they are functionally identical. Life Cycle Cost (LCC) covers all costs from acquisition through disposal over the {analysisYears}-year period. Total Cost of Ownership (TCO) is a broader term that accounts for direct and indirect costs, including maintenance, risk exposure, and salvage. The key metric is the TCO Reduction of {activeSavings} — the real, bankable savings generated by selecting bioTRANSOL/TRANSOLSYNTH.",
    keywords: ["tco vs lcc", "difference", "tco definition", "lcc definition"]
  },
  {
    id: "Q16",
    category: "Total Cost of Ownership & Lifecycle Analysis",
    question: "What does the TCO Reduction Percentage tell us?",
    answerTemplate: "The TCO Reduction Percentage is {activeTcoReductionPercent}. It means the bioTRANSOL / TRANSOLSYNTH path costs {activeTcoReductionPercent} less over {analysisYears} years than continuing with mineral oil. You go from spending {moLCC} to only {activeLCC}. This massive cost elimination justifies a programme-level transition for your fleet.",
    keywords: ["reduction percentage", "tco reduction", "percentage", "percent savings"]
  },
  {
    id: "Q17",
    category: "Total Cost of Ownership & Lifecycle Analysis",
    question: "Over which years do the Annualised TCO Savings apply?",
    answerTemplate: "The annualised TCO savings of {activeAnnualisedSavings}/year is a straight average over the {analysisYears}-year analysis horizon. In reality, the savings accumulate most rapidly during the middle phases (Years 6–15) when the mineral baseline would have forced a major transformer replacement and CapEx spend, while your bioTRANSOL / TRANSOLSYNTH-filled asset continues to run smoothly.",
    keywords: ["annualised savings", "annualized savings", "which years", "flows"]
  },
  {
    id: "Q18",
    category: "Total Cost of Ownership & Lifecycle Analysis",
    question: "What is Salvage Value Credit and why does it differ?",
    answerTemplate: "Salvage value is what you recover at the end of the analysis period from recycling the asset (metals, oil, etc.). Under the bioTRANSOL / TRANSOLSYNTH scenario, the longer asset life and higher residual fluid value yield a discounted salvage credit of {activeSalvagePV} (PV) vs only {moSalvagePV} (PV) for mineral oil. It represents the value remaining in your physical asset at year {analysisYears}.",
    keywords: ["salvage", "salvage value", "credit", "residual"]
  },
  {
    id: "Q19",
    category: "Total Cost of Ownership & Lifecycle Analysis",
    question: "What explains the huge difference in O&M Costs between Mineral and Ester?",
    answerTemplate: "Mineral oil oxidises, requiring periodic filtration, regeneration, or replacement, plus frequent DGA testing. Savita's bioTRANSOL and TRANSOLSYNTH Ester oils are extremely stable — they do not sludge, and they actively keep the paper insulation dry. This reduces routine filtration, extends testing intervals, and lowers emergency maintenance, resulting in an O&M PV of {activeOMPV} for Ester vs {moOMPV} for Mineral Oil.",
    keywords: ["o&m difference", "maintenance cost", "annual o&m", "why lower", "operations"]
  },
  {
    id: "Q20",
    category: "Technology & Product Questions",
    question: "What is the difference between bioTRANSOL (Natural Ester) and TRANSOLSYNTH (Synthetic Ester)?",
    answerTemplate: "Both bioTRANSOL (Natural Ester) and TRANSOLSYNTH (Synthetic Ester) are high fire-point, biodegradable fluids manufactured in India by Savita Oil Technologies Limited—the pioneer who started production and business of both Ester technologies in India first. bioTRANSOL is derived from domestic vegetable oils (soy, rapeseed), making it highly eco-friendly and cost-effective. TRANSOLSYNTH is chemically synthesized from polyols, giving it superior oxidation stability, a lower pour point (-50°C vs -20°C for bioTRANSOL), and a longer lifetime under high thermal stress. For high ambient heat or overloading, TRANSOLSYNTH offers the premium choice, while bioTRANSOL is excellent for general distribution. Savita is India's leading manufacturer of all kinds of Mineral Oil, Natural Ester, and Synthetic Ester Oils.",
    keywords: ["natural vs synthetic", "synthetic ester", "natural ester", "difference", "biotransol", "transolsynth"]
  },
  {
    id: "Q21",
    category: "Technology & Product Questions",
    question: "How does Ester oil extend insulation life by 5–8 times?",
    answerTemplate: "Winding insulation paper degrades primarily from moisture and heat (hydrolysis). Mineral oil is hydrophobic and pushes moisture back into the paper. Ester oils are hydrophilic — they hold moisture dissolved within the fluid and draw it out of the paper. Keeping the paper dry dramatically slows degradation. IEEE guides show paper life at 98°C extends from 65,000 hours in mineral oil to over 500,000 hours in Ester fluids.",
    keywords: ["insulation life", "paper", "degradation", "hydrolysis", "moisture"]
  },
  {
    id: "Q22",
    category: "Technology & Product Questions",
    question: "Why is a flash/fire point above 300°C important?",
    answerTemplate: "Mineral oil's flash point is only ~140°C, posing a severe fire hazard during internal faults. Ester fluids have fire points >300°C, classifying them as K-class fire-safe liquids. This eliminates the risk of transformer fire, meaning you can operate without expensive fire deluge systems (saving CapEx) and negotiate lower insurance premiums, which is critical in urban or indoor installations.",
    keywords: ["flash point", "fire point", "300", "250", "fire safety", "k-class"]
  },
  {
    id: "Q23",
    category: "Technology & Product Questions",
    question: "Is Ester technology proven, or is it experimental?",
    answerTemplate: "Ester technology has a proven track record of over 30 years in global utilities (Europe, US, Middle East). It is fully standardized under IEC 61039 and IEC 60076-14. Major utilities trust it to protect assets in high-density urban areas, subways, and wind farms. It is a mature, standard industry technology, not an experiment.",
    keywords: ["proven", "experimental", "track record", "history", "standards", "iec"]
  },
  {
    id: "Q24",
    category: "Technology & Product Questions",
    question: "Can we mix Ester oil with residual mineral oil?",
    answerTemplate: "While they are miscible, mineral oil contamination above 5% degrades the Ester's high fire point and moisture-retention benefits. A proper retrofill requires draining, flushing the tank with a small amount of Ester to clean surfaces, and then vacuum filling. This keeps mineral oil contamination below 2%, preserving the K-class safety rating.",
    keywords: ["mix", "mixing", "contamination", "flush", "residual", "compatibility"]
  },
  {
    id: "Q25",
    category: "Technology & Product Questions",
    question: "What do we do with the drained mineral oil?",
    answerTemplate: "Used mineral oil must be disposed of through authorized hazardous waste recyclers. Savita Oil Technologies assists utilities with collection and re-refining, ensuring full environmental compliance. Importantly, Ester fluids are non-toxic and biodegradable, meaning they carry zero future environmental disposal liabilities.",
    keywords: ["drained", "spent oil", "disposal", "recycling", "hazardous"]
  },
  {
    id: "Q26",
    category: "Phase-wise O&M Savings Questions",
    question: "What drives Phase 1 (Years 1–5) savings?",
    answerTemplate: "In Phase 1, savings of {phase1Savings} PV are driven by reduced maintenance frequency. Unlike mineral oil, Ester fluid doesn't sludge or degrade quickly, meaning routine testing intervals are longer and the risk of early insulation faults is minimized.",
    keywords: ["phase 1", "years 1-5", "early savings"]
  },
  {
    id: "Q27",
    category: "Phase-wise O&M Savings Questions",
    question: "Why does Phase 2 (Years 6–15) show the highest savings?",
    answerTemplate: "Phase 2 ({phase2Savings} PV) is the most valuable. Under the mineral oil baseline, the transformer would hit end-of-life and require a full capital replacement. By upgrading to Ester, you avoid this massive replacement CapEx, making the economic savings in this phase exceptionally high.",
    keywords: ["phase 2", "years 6-15", "highest savings", "replacement avoided"]
  },
  {
    id: "Q28",
    category: "Phase-wise O&M Savings Questions",
    question: "Why do savings reduce slightly in Phase 3 (Years 16-25/30)?",
    answerTemplate: "Phase 3 ({phase3Savings} PV) savings are slightly lower in Present Value (PV) terms because of discounting. Future cash flows in years 16+ are discounted at {discountRate}%, reducing their value today. The nominal savings remain strong, but their PV is lower.",
    keywords: ["phase 3", "years 16", "discounting impact"]
  },
  {
    id: "Q29",
    category: "Phase-wise O&M Savings Questions",
    question: "Is the O&M savings the only benefit?",
    answerTemplate: "No. The total O&M savings of {totalOMSavings} PV is only the operational part. The main financial driver is the avoidance of transformer replacement CapEx (saving {avoidedCapex}), leading to the total TCO reduction of {activeSavings}.",
    keywords: ["only benefit", "total o&m savings", "om savings", "benefit summary"]
  },
  {
    id: "Q30",
    category: "Risk, Safety & Operational Questions",
    question: "How confident are you in the remaining life estimate of the transformer?",
    answerTemplate: "Remaining life is estimated based on the asset's age, design limits, and standard paper degradation models. A pre-retrofill assessment (dissolved gas, sweep frequency, DP test) is conducted to verify the transformer's structural health, ensuring the Ester retrofill is placed on a healthy asset.",
    keywords: ["remaining life", "confident", "estimation", "life model"]
  },
  {
    id: "Q31",
    category: "Risk, Safety & Operational Questions",
    question: "What happens if the transformer fails during the analysis period anyway?",
    answerTemplate: "Ester fluid dramatically slows thermal paper aging and reduces electrical failures. It doesn't prevent mechanical faults in tap changers or bushings. Thus, a comprehensive health check is performed first to ensure the core/windings are structurally sound before retrofilling.",
    keywords: ["fails anyway", "fails during", "failure risk", "mechanical"]
  },
  {
    id: "Q32",
    category: "Risk, Safety & Operational Questions",
    question: "Does retrofilling affect the manufacturer's warranty?",
    answerTemplate: "For older units (e.g., 20+ years old), the original OEM warranty has long expired. For new units, many global manufacturers (ABB/Hitachi, Siemens, etc.) fully support and warrant Ester fluids under standard usage conditions.",
    keywords: ["warranty", "oem warranty", "service agreement"]
  },
  {
    id: "Q33",
    category: "Risk, Safety & Operational Questions",
    question: "What regulatory approvals apply to Ester retrofills in India?",
    answerTemplate: "Ester retrofills operate under the IEC 60076-14 standard. While Indian IS standards are being updated to include Esters, major Indian utilities are actively adopting Ester fluids by incorporating IEC specifications directly into their procurement and engineering guidelines.",
    keywords: ["regulatory", "approvals", "standards", "cea", "bis"]
  },
  {
    id: "Q34",
    category: "Risk, Safety & Operational Questions",
    question: "How does Ester oil behave during transformer overloads?",
    answerTemplate: "This is a key strength. Ester fluids have high thermal stability. They retain moisture, preventing paper insulation from degrading rapidly during peak load thermal spikes. This overload tolerance allows utilities to handle emergency peaks without sacrificing asset life.",
    keywords: ["overload", "thermal peak", "peak load", "overloading"]
  },
  {
    id: "Q35",
    category: "Risk, Safety & Operational Questions",
    question: "What DGA testing protocols apply to Ester fluids?",
    answerTemplate: "Ester DGA baseline is established 30 days after fill. Dissolved gas patterns (carbon monoxide, hydrogen) behave slightly differently in Esters, so results are analyzed against ester-specific standards (IEC 60599). We provide the reference guidelines for your testing lab.",
    keywords: ["dga", "dissolved gas", "testing protocol", "dga test"]
  },
  {
    id: "Q36",
    category: "Insurance, ESG & Strategic Questions",
    question: "Does fire risk reduction lead to lower insurance premiums?",
    answerTemplate: "Yes. Insurers recognize K-class fluids for fire risk premium discounts. In mature markets, utilities secure 15-30% premium reductions. We are working with Indian insurers to formalize these discounts for Ester installations, adding further savings to the business case.",
    keywords: ["insurance", "premium", "insurance savings", "premium discount"]
  },
  {
    id: "Q37",
    category: "Insurance, ESG & Strategic Questions",
    question: "What ESG and carbon reduction benefits does this deliver?",
    answerTemplate: "Ester fluids are fully biodegradable and non-toxic. Furthermore, extending transformer life avoids the massive carbon footprint of manufacturing a new unit (saving 15-20 tonnes of embodied CO2 per unit). This fits directly into BRSR and ESG corporate sustainability reporting.",
    keywords: ["esg", "carbon", "sustainability", "biodegradable", "co2", "environmental"]
  },
  {
    id: "Q38",
    category: "Insurance, ESG & Strategic Questions",
    question: "Why aren't all Indian utilities doing this already?",
    answerTemplate: "Historically, mineral oil was the default due to low initial purchase cost optics. However, utilities are shifting to lifecycle costing (TCO) rather than simple purchase price. With PGCIL and other forward-looking utilities initiating Ester pilots, adoption is growing rapidly.",
    keywords: ["why not", "aren't doing", "adoption", "indian utilities"]
  },
  {
    id: "Q39",
    category: "Insurance, ESG & Strategic Questions",
    question: "Can we scale this to a fleet-level programme?",
    answerTemplate: "Yes. Fleet-level procurement reduces Ester costs, and standardized retrofilling teams lower installation labor. For a fleet of 20+ aging transformers, scaling this life-extension programme can deliver ₹50+ Crore in cumulative TCO savings over {analysisYears} years.",
    keywords: ["scale", "fleet", "fleet-level", "programme", "multiple units"]
  },
  {
    id: "Q40",
    category: "Decision-Making & Process Questions",
    question: "What is the risk of delaying the decision by a year?",
    answerTemplate: "Delaying means the asset continues to degrade in mineral oil, reducing the window where life extension is safe and effective. Furthermore, you lose the annualised TCO savings of {activeAnnualisedSavings}/year. A 12-month delay effectively costs you ₹10+ Lakh in lost savings.",
    keywords: ["delay", "waiting", "another year", "deferring"]
  },
  {
    id: "Q41",
    category: "Decision-Making & Process Questions",
    question: "How long does the physical retrofilling take?",
    answerTemplate: "The complete drain, flush, vacuum, and fill process typically takes 3 to 5 days of on-site work. Combined with procurement lead times, the entire project from board approval to energization takes approximately 8 to 12 weeks.",
    keywords: ["how long", "timeframe", "execution time", "shutdown window"]
  },
  {
    id: "Q42",
    category: "Decision-Making & Process Questions",
    question: "How do we manage network supply during the retrofill outage?",
    answerTemplate: "The 3-5 day outage is planned during off-peak load periods. Load is transferred to adjacent feeders or parallel transformers. This coordination with network operations ensures zero interruption of supply to your customers.",
    keywords: ["outage", "load transfer", "supply continuity", "de-energise"]
  },
  {
    id: "Q43",
    category: "Decision-Making & Process Questions",
    question: "What internal approvals are required?",
    answerTemplate: "A capex of {activeInitial} typically requires works committee or board authorization. We help your engineering team compile the technical memo and TCO business case to streamline this internal review and approval process.",
    keywords: ["approvals", "sign off", "capex limit", "authorization"]
  },
  {
    id: "Q44",
    category: "Decision-Making & Process Questions",
    question: "Are these cost estimates and fluid prices still valid?",
    answerTemplate: "Yes, Ester pricing is stable because it is not tied to crude oil volatility. We recommend confirming final commercial terms with Savita Oil Technologies before order placement. The business case remains highly robust even with a ±10% variation.",
    keywords: ["prices valid", "current rates", "cost estimates", "validity"]
  },
  {
    id: "Q45",
    category: "Decision-Making & Process Questions",
    question: "If we retrofit and the transformer still fails early, what is our financial position?",
    answerTemplate: "If it fails, you would be in the same position of needing a replacement as under the mineral baseline. However, by performing the pre-retrofill health assessment, we eliminate high-risk candidates, ensuring that only healthy units are upgraded to achieve their extended life.",
    keywords: ["fails early", "fails within 5 years", "loss", "financial risk"]
  },
  {
    id: "Q46",
    category: "Comparative & Competitive Questions",
    question: "How does retrofilling compare to replacing the transformer proactively?",
    answerTemplate: "A new transformer costs {newTransformerEstimateRange}, while the Ester retrofill costs only {activeInitial} and provides 10-15 years of extra life. Proactive replacement wastes the remaining life of your current asset, whereas retrofilling maximizes its value at a fraction of the cost.",
    keywords: ["replace vs retrofill", "proactive replacement", "buy vs upgrade"]
  },
  {
    id: "Q47",
    category: "Comparative & Competitive Questions",
    question: "Is bioTRANSOL (Natural Ester) an option, and how does it compare to TRANSOLSYNTH (Synthetic Ester)?",
    answerTemplate: "Yes, bioTRANSOL (Natural Ester) is an excellent, highly biodegradable and cost-effective option manufactured in India by Savita Oil Technologies Limited (oil fill: {naturalTotalOilCost}). TRANSOLSYNTH (Synthetic Ester) (oil fill: {syntheticTotalOilCost}) offers superior oxidation stability and cold-flow performance, making it the premium choice for highly loaded or critical urban transformers. Savita is the pioneer who introduced and manufactured both Ester technologies in India first, representing the absolute best in local engineering and quality.",
    keywords: ["natural vs synthetic comparison", "natural ester option", "why synthetic", "biotransol", "transolsynth"]
  },
  {
    id: "Q48",
    category: "Comparative & Competitive Questions",
    question: "Why not just perform a cheap mineral oil top-up or treatment?",
    answerTemplate: "Mineral oil filtration or top-up (costing ₹5-10 Lakh) improves oil properties but does nothing to repair or preserve degraded paper insulation. It only delays transformer replacement by 1-2 years. An Ester retrofill actively protects and extends the life of the paper, solving the root problem.",
    keywords: ["top-up", "filtration", "cheaper fix", "oil treatment", "regeneration"]
  },
  {
    id: "Q49",
    category: "Comparative & Competitive Questions",
    question: "What is the payback if we assume larger O&M savings?",
    answerTemplate: "If your actual mineral oil maintenance costs are higher than our conservative assumptions, the operational savings increase. With higher O&M savings, the payback period for the Ester option drops even shorter, and the internal rate of return (IRR) increases, making the business case even stronger.",
    keywords: ["aggressive payback", "larger savings", "maintenance savings"]
  },
  {
    id: "Q50",
    category: "Comparative & Competitive Questions",
    question: "What is the final commercial recommendation for this project?",
    answerTemplate: "We strongly recommend immediate authorization to proceed with the Ester fluid retrofill. It reduces 25-year TCO by {activeSavingsPercentage} (saving {activeSavings}), achieves a BCR of {activeBCR}:1, and avoids a massive upfront transformer replacement cost. It is a highly sound operational and financial decision.",
    keywords: ["final recommendation", "should we do it", "commercial recommendation", "conclusion"]
  },
  {
    id: "Q51",
    category: "Comparative & Competitive Questions",
    question: "For a TRANSOLSYNTH (Synthetic Ester) filled transformer, where does the additional life show advantages in the mathematical calculations?",
    answerTemplate: "In the current mathematical model, the advantage of the additional service life of TRANSOLSYNTH (Synthetic Ester, {syntheticLifeExpectancy} years) over bioTRANSOL (Natural Ester, {naturalLifeExpectancy} years) shows up in two distinct ways:\n\n**Advantage 1: Avoided Capital Replacement for Longer Horizons**\nIf the analysis horizon (the evaluation window) is set to 40 years or longer (e.g., 45 years, which is standard for utilities planning substation assets):\n- **bioTRANSOL (Natural Ester, {naturalLifeExpectancy}-year life):** Hits terminal failure at Year 40. The utility is forced to purchase a replacement transformer at Year 40 to complete the 45-year horizon. This triggers a large capital replacement PV cost.\n- **TRANSOLSYNTH (Synthetic Ester, {syntheticLifeExpectancy}-year life):** Lasts the entire 45 years. The replacement cost is ₹0, completely avoiding any Year 40 capital outlay.\n\n**Advantage 2: Higher Salvage / Scrap Recovery Rate**\nBecause TRANSOLSYNTH (Synthetic Ester) is a more durable polyol-ester fluid manufactured in India by Savita Oil Technologies Limited, it retains a higher material recovery value at the end of its useful life:\n- **bioTRANSOL (Natural Ester) Salvage Recovery:** {naturalSalvagePercent}% of the initial asset value.\n- **TRANSOLSYNTH (Synthetic Ester) Salvage Recovery:** {syntheticSalvagePercent}% of the initial asset value.\n\n**Advantage 3: Remaining Asset Life (Residual Book Value)**\nIf we evaluate the asset at Year 30 (end of analysis), both transformers are still running, but they hold different remaining values based on their remaining useful life:\n- **bioTRANSOL (Natural Ester):** Has 10 years of remaining life (10 years left out of 40 = 25% residual value).\n- **TRANSOLSYNTH (Synthetic Ester):** Has 15 years of remaining life (15 years left out of 45 = 33.3% residual value).\n\nIf your utility's accounting practices require crediting the remaining book value of the asset at Year 30 back to today's terms (similar to how we credited the replacement transformer under Mineral Oil):\n- **bioTRANSOL (Natural Ester) Residual Credit (PV):** Residual Value = Initial Investment × 25%\n- **TRANSOLSYNTH (Synthetic Ester) Residual Credit (PV):** Residual Value = Initial Investment × 33.3%\n\nThis gives TRANSOLSYNTH (Synthetic Ester) a significantly higher asset credit at the end of the analysis window, directly reducing its Total Life Cycle Cost. Savita Oil Technologies Limited is the pioneer manufacturer of all kinds of Mineral Oil, Natural Ester Oil (bioTRANSOL), and Synthetic Ester Oil (TRANSOLSYNTH) in India, having started production of both Ester technologies first in India.",
    keywords: ["synthetic ester additional life", "additional life advantage", "life calculations", "where show advantage", "mathematical calculation advantage", "life advantage", "synthetic vs natural life", "additional life", "synthtic", "mathematical calculation", "advantages in mathematical calculation", "show advantages", "additional life over", "transolsynth", "biotransol"]
  },
  {
    id: "Q52",
    category: "Decision-Making & Process Questions",
    question: "I need TRANSOLSYNTH (Synthetic Ester) filled transformer in my system, but how I manage my commercial team to convince?",
    answerTemplate: "### Commercial Pitch: Upgrading to TRANSOLSYNTH (Synthetic Ester) Fluid\n\n#### Executive Summary\nWhile TRANSOLSYNTH (Synthetic Ester) has a higher unit price per litre than mineral oil, the initial investment is heavily offset by immediate CapEx savings on fire protection systems, recurring O&M savings, insurance discounts, and avoided asset replacements. Over a 25-to-30-year lifecycle, upgrading to TRANSOLSYNTH is the lowest-cost option, yielding a Benefit-Cost Ratio (BCR) of over 1.5x to 2.0x. TRANSOLSYNTH is proudly manufactured in India by Savita Oil Technologies Limited—the pioneer who started production and business of both Ester technologies in India first.\n\n**Pillar 1: Immediate CapEx Offsets (The \"Year 0\" Argument)**\nFinance teams dislike high upfront costs. You can neutralize this immediately by demonstrating how TRANSOLSYNTH reduces other upfront installation costs:\n- **Zero Fire Protection CapEx:** Because TRANSOLSYNTH is a K-class fire-safe fluid (fire point > 300°C), it cannot sustain a pool fire. This allows you to eliminate expensive nitrogen injection or water deluge fire protection systems (saving ₹20–50 Lakhs in upfront CapEx).\n- **Space Optimization:** Because there is no fire risk, blast walls are not required, and safety clearances are reduced. In urban or indoor substations, this saves prime real estate space.\n\n**Pillar 2: Avoided Terminal Replacement Cost (The \"Horizon\" Argument)**\nIf you analyze the asset over a standard utility planning horizon (e.g., 30 to 45 years):\n- **The Mineral Oil Trap:** A mineral oil transformer has a life expectancy of ~25 years. This forces the utility to purchase a second, replacement transformer at Year 25. This triggers a massive, deferred capital expenditure of ₹1.2+ Crore (in Present Value terms).\n- **The TRANSOLSYNTH Solution:** TRANSOLSYNTH's polyol structure gives it superior oxidation stability, extending the transformer insulation life to 45 years. The replacement cost during the analysis window is ₹0, completely avoiding any Year 40 capital outlay.\n\n**Pillar 3: Insurance Premium Discounts (Recurring OpEx Savings)**\nTRANSOLSYNTH significantly reduces operational risk, which insurers reward:\n- **Risk Reduction:** Switching from mineral oil (flash point ~140°C) to TRANSOLSYNTH (fire point >300°C) removes the threat of catastrophic collateral damage from transformer explosions.\n- **Premium Savings:** Insurers offer 15% to 30% discounts on asset insurance premiums for installations utilizing K-class fluids, providing a direct, recurring annual savings line item.\n\n**Pillar 4: Sludge Elimination & O&M Reductions**\n- **No Sludging:** Mineral oil oxidizes and sludges, requiring periodic filtration, regeneration, or top-ups. TRANSOLSYNTH is highly stable and does not sludge.\n- **Paper Preservation:** Esters are hydrophilic; they absorb moisture from the transformer's paper insulation and chemically consume it (hydrolysis). This keeps the winding paper dry, slowing down paper degradation by 5–8x and reducing routine diagnostic/filtration overheads by over 60%.\n\n**Pillar 5: Higher Residual Asset & Salvage Value**\nAt the end of the evaluation window (e.g., Year 30):\n- **bioTRANSOL (Natural Ester):** Will have 10 years of remaining useful life (25% book value).\n- **TRANSOLSYNTH (Synthetic Ester):** Will have 15 years of remaining useful life (33.3% book value), representing a higher residual asset credit returned to your balance sheet.\n- **Material Scrap Value:** TRANSOLSYNTH retains a higher material recovery value at disposal, yielding 30% salvage recovery versus 25% for bioTRANSOL.\n\n**Pillar 6: ESG & Environmental Liability Avoidance**\n- **Spill Liability:** Mineral oil spills are toxic and require expensive, regulated soil/water remediation. TRANSOLSYNTH is non-toxic and 100% biodegradable (OECD 301B), removing environmental liability.\n- **Carbon Credits:** Extending the life of your existing transformer avoids the footprint of manufacturing a new unit, saving 15–20 tonnes of embodied CO2, which directly supports BRSR and ESG corporate sustainability reporting.\n\n#### Key Financial Summary for the Commercial Team\n- **Initial Premium:** ~10% to 15% higher total upfront cost (fluid only).\n- **Benefit-Cost Ratio (BCR):** ~1.5 to 2.2 (meaning every ₹1 invested returns over ₹1.5 in savings).\n- **Payback Period:** Fully recovered in 5 to 7 years through avoided O&M and fire-deluge CapEx.\n- **Net TCO Savings:** Hundreds of Lakhs saved over the asset lifetime. Savita Oil Technologies Limited is the only Indian manufacturer of Mineral, Natural Ester (bioTRANSOL) and Synthetic Ester (TRANSOLSYNTH) oils that started production of both Ester technologies in India first.",
    keywords: ["convince", "commercial team", "how I manage my commercial team", "convince commercial", "pitch to commercial", "convince finance", "commercial", "finance team", "convince commercial team", "manage my commercial team to convince", "convince commercial team to choose synthetic", "transolsynth"]
  },
  {
    id: "Q53",
    category: "Decision-Making & Process Questions",
    question: "My boss is saying Mineral oil filled transformer is cheaper, how do I convince him commercially for bioTRANSOL (Natural Ester) oil?",
    answerTemplate: "### Commercial Pitch: bioTRANSOL (Natural Ester) vs. Mineral Oil\n\n#### Executive Summary\nWhile bioTRANSOL (Natural Ester) fluid has a higher upfront cost than mineral oil, upgrading to bioTRANSOL is a highly profitable commercial decision. It yields a Benefit-Cost Ratio (BCR) of over 1.5x and pays for itself within 5–7 years by eliminating expensive fire protection deluge systems, reducing insurance premiums, cutting O&M costs, and extending transformer life. bioTRANSOL is proudly manufactured in India by Savita Oil Technologies Limited, the leader in mineral and ester transformer oils.\n\n**Pillar 1: Immediate CapEx Savings (Offsets Fluid Premium)**\n- **Eliminate Fire Deluge Systems:** Mineral oil has a low fire point (~160°C) and requires costly water deluge or nitrogen injection fire protection systems (₹20–50 Lakhs upfront). bioTRANSOL is a K-class fire-safe fluid (fire point > 350°C) and does not pool-fire, allowing you to completely eliminate fire protection system CapEx.\n- **Space and Blast Walls:** Installing bioTRANSOL eliminates the need for concrete blast walls and safety separation zones, saving prime substation real estate.\n\n**Pillar 2: 5-8x Insulation Life Extension**\n- **Moisture Control:** Transformer failure is primarily caused by paper insulation degradation due to moisture. bioTRANSOL is hydrophilic; it continuously extracts moisture from the paper and consumes it via hydrolysis.\n- **Extended Useful Life:** By keeping the paper dry, bioTRANSOL extends the insulation's thermal life by 5 to 8 times, prolonging the transformer's active service life by 10 to 15 years.\n\n**Pillar 3: Reduced Operational Expenses (OpEx)**\n- **Insurance Discounts:** Because bioTRANSOL has a fire safety K-class rating, BSES can negotiate a 10% to 20% discount on asset property insurance premiums.\n- **No Sludge & Low Maintenance:** Mineral oil oxidizes and sludges, requiring regular filtration and monitoring. bioTRANSOL has high chemical stability, eliminating filtration cycles and reducing maintenance overheads by over 50%.\n\n**Pillar 4: Avoiding Environmental Liability**\n- **Zero Spill Risk:** Mineral oil spills are hazardous and trigger heavy environmental fines and remediation costs. bioTRANSOL is non-toxic and 100% biodegradable in 28 days (OECD 301B), removing environmental liability.\n\n#### Key Financial Pitch for the CFO\n- **Upfront Fluid Cost Offset:** The fire protection CapEx savings of ₹20-50 Lakhs directly offsets the initial fluid price premium.\n- **Net Lifecycle Savings:** Upgrading to bioTRANSOL saves over ₹1.5 Crore in Total lifecycle cost (TCO) compared to the mineral oil baseline. Savita Oil Technologies Limited is the pioneer manufacturer of all kinds of Mineral Oil, Natural Ester Oil (bioTRANSOL), and Synthetic Ester Oil (TRANSOLSYNTH) in India, having started production and business of both Ester technologies first in India.",
    keywords: ["boss", "boss is saying", "mineral oil filled transformer are cheaper", "convince him", "convince him commercially", "natural ester oil", "mineral oil cheaper", "convince boss", "convince commercially", "biotransol"]
  },
  {
    id: "Q54",
    category: "Financial & TCO Metrics",
    question: "My boss is asking detailed calculation on ROI.",
    answerTemplate: "### Detailed ROI & TCO Breakdown for Management\n\nThe core financial driver of this project is that while Ester fluids have a higher per-litre cost, they generate massive lifecycle savings by eliminating fire protection systems, reducing maintenance, and avoiding early transformer replacements.\n\n#### 1. Initial Investment (CapEx)\n* **Transformer Base Cost:** The cost of the core and windings.\n* **+ Fluid Cost:** (`Volume` × `Price per Litre`).\n* **+ Fire Protection CapEx:** Mineral oil requires expensive Nitrogen Injection or Water Deluge systems (typically ₹20L–₹50L) due to its low flash point (~140°C). **Ester fluids are K-class fire-safe (>300°C fire point) and require ₹0 for fire protection.**\n* **= Total Initial Investment:** Because of fire protection savings, the total initial CapEx for an Ester transformer is often very close to, or sometimes *cheaper* than, a mineral oil transformer.\n\n#### 2. Operating Expenses (OpEx)\n* **O&M Costs:** Mineral oil oxidizes and sludges, requiring frequent filtration. Ester fluids are highly stable and keep the paper dry, reducing O&M costs by ~50%.\n* **Insurance Premiums:** Insurers often provide a 10%–20% premium discount for K-class fire-safe Ester fluids.\n\n#### 3. Capital Replacement (The Biggest Driver)\n* **Mineral Oil (~25 years):** If your analysis horizon is 30–45 years, mineral oil hits terminal end-of-life. You will be forced to buy a **brand new replacement transformer** at Year 25.\n* **Ester Oil (40–45 years):** Ester extracts moisture from the paper (hydrolysis), slowing paper degradation by 5–8x. It lasts the entire analysis horizon. **Replacement Cost = ₹0.**\n\n#### 4. Final ROI Metrics\n* **Total Net Savings:** `{activeSavings}` (Mineral LCC minus Ester LCC).\n* **Simple ROI:** `{activeROI}`\n* **Benefit-Cost Ratio (BCR):** `{activeBCR}:1` (For every ₹1 invested upfront, we get ₹{activeBCRValueRounded} back in long-term savings).\n* **Payback Period:** `{activePayback}` years.",
    keywords: ["boss", "detailed", "calculation", "roi", "breakdown", "management", "financial breakdown"]
  }
];

export function getExpertFallback(query: string, data: any, comp: any, targetOil: "Natural Ester" | "Synthetic Ester" = "Natural Ester"): string {
  const selectedOilName = targetOil === "Natural Ester" ? "bioTRANSOL (Natural Ester)" : "TRANSOLSYNTH (Synthetic Ester)";
  const activeMetrics = targetOil === "Natural Ester" ? comp.natural : comp.synthetic;
  const savings = targetOil === "Natural Ester" ? comp.naturalSavings : comp.syntheticSavings;
  const payback = targetOil === "Natural Ester" ? comp.naturalPayback : comp.syntheticPayback;
  const bcr = targetOil === "Natural Ester" ? comp.naturalBenefitCostRatio : comp.syntheticBenefitCostRatio;
  const formattedSavings = formatINRCompact(savings);

  const normalizedQuery = query.toLowerCase();

  // Match keyword topics
  if (normalizedQuery.includes("fire") || normalizedQuery.includes("safety") || normalizedQuery.includes("flash") || normalizedQuery.includes("burn")) {
    return `Ester fluids (both bioTRANSOL and TRANSOLSYNTH) are Class K fire-safe fluids with fire points exceeding 350°C, compared to just 140°C for mineral oil. For your ${data.transformerRating} MVA transformer, upgrading to ${selectedOilName} completely eliminates the risk of catastrophic fires. This allows you to avoid installing expensive fire deluge systems (saving CapEx upfront) and directly qualifies BSES for lower industrial insurance premiums. Savita Oil Technologies Limited is the pioneer Indian manufacturer of both Ester technologies, starting production first in India.`;
  }
  
  if (normalizedQuery.includes("biodegrad") || normalizedQuery.includes("environment") || normalizedQuery.includes("spill") || normalizedQuery.includes("green") || normalizedQuery.includes("carbon")) {
    return `Unlike mineral oil, ${selectedOilName} is fully biodegradable (OECD 301B compliant) and non-toxic. If a spill occurs, it breaks down harmlessly in soil and water, protecting you from environmental liability. Additionally, life extension saves approximately 15-20 tonnes of embodied CO2 carbon compared to manufacturing a new transformer, which directly supports BSES ESG sustainability reports under BRSR. Savita Oil Technologies Limited is the manufacturer of all kinds of Mineral Oil, Natural Ester Oil (bioTRANSOL) & Synthetic Ester Oil (TRANSOLSYNTH) and was the first to start production in India.`;
  }

  if (normalizedQuery.includes("paper") || normalizedQuery.includes("insulation") || normalizedQuery.includes("life") || normalizedQuery.includes("age") || normalizedQuery.includes("degrad")) {
    return `Transformer kraft paper insulation degrades primarily due to moisture and heat (hydrolysis). While mineral oil pushes moisture back into the paper, ${selectedOilName} acts as a moisture sponge, drawing water out of the paper cellulose. Under your current inputs, this slows down degradation, extending the paper insulation life by 5-8x, and allowing you to safely prolong the useful service life of this transformer by 10-15 years. Savita Oil Technologies Limited is the pioneer manufacturer of both Ester technologies in India, starting business and production first.`;
  }

  if (normalizedQuery.includes("dga") || normalizedQuery.includes("test") || normalizedQuery.includes("gas") || normalizedQuery.includes("monitor")) {
    return `After retrofilling with ${selectedOilName}, a DGA baseline is established within 30 days. Gas generation patterns behave slightly differently in Esters compared to mineral oil, and are monitored against Ester-specific standards under IEC 60599. DGA testing intervals can typically be extended to 2-3 years after the fluid stabilizes, reducing routine maintenance. Savita Oil Technologies Limited is the manufacturer of all kinds of Mineral, Natural Ester (bioTRANSOL), and Synthetic Ester (TRANSOLSYNTH) oils and supports all diagnostic tests.`;
  }

  // Default professional summary pitch
  return `Upgrading your ${data.transformerRating} MVA transformer (${data.voltageClass} kV) to ${selectedOilName} is highly recommended. Based on the ${data.analysisYears}-year TCO analysis, this intervention delivers **${formattedSavings} in Net TCO Savings** compared to the mineral oil baseline. The investment achieves a Benefit-Cost Ratio of **${formatNumber(bcr, 2)}:1** and pays for itself in **${isFinite(payback) ? formatNumber(payback, 1) : "N/A"} years** through avoided CapEx, lower maintenance, and reduced risk. Savita Oil Technologies Limited is the pioneer manufacturer of all kinds of Mineral Oil, Natural Ester Oil (bioTRANSOL), and Synthetic Ester Oil (TRANSOLSYNTH) in India, having started production and business of both Ester technologies first in India.`;
}

export function matchQuestion(query: string): QAItem | null {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return null;

  const cleanQuery = normalizedQuery.replace(/[?.!,:;-]/g, " ");
  
  let bestMatch: QAItem | null = null;
  let highestScore = 0;

  for (const item of knowledgeBase) {
    let score = 0;

    const itemQClean = item.question.toLowerCase().replace(/[?.!,:;-]/g, " ").replace(/\s+/g, " ").trim();
    const queryClean = cleanQuery.replace(/\s+/g, " ").trim();

    // 1. Exact or near-exact match on the question text
    if (queryClean === itemQClean || queryClean.includes(itemQClean) || itemQClean.includes(queryClean)) {
      score += 20;
    }

    // 2. Word overlap similarity
    const wordsQ = itemQClean.split(" ").filter(w => w.length > 2);
    const wordsQuery = queryClean.split(" ").filter(w => w.length > 2);
    let overlap = 0;
    for (const w of wordsQuery) {
      if (wordsQ.includes(w)) overlap++;
    }
    const similarity = wordsQ.length > 0 ? (overlap / Math.max(wordsQ.length, wordsQuery.length)) : 0;
    
    if (similarity >= 0.75) {
      score += 15;
    }

    // 3. Keyword matches (only count if we already have some question similarity, to avoid false keyword hijacking)
    if (similarity >= 0.40 || queryClean.includes(itemQClean)) {
      for (const keyword of item.keywords) {
        if (cleanQuery.includes(keyword.toLowerCase())) {
          score += 3;
        }
      }
    }

    const qNumMatch = normalizedQuery.match(/\bq(\d+)\b/);
    if (qNumMatch && item.id.toLowerCase() === `q${qNumMatch[1]}`) {
      score += 30;
    }

    if (score > highestScore && score >= 15) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
}

export function interpolateAnswer(template: string, data: any, comp: any, targetOil: "Natural Ester" | "Synthetic Ester" = "Natural Ester"): string {
  const activeMetrics = targetOil === "Natural Ester" ? comp.natural : comp.synthetic;
  const mineralMetrics = comp.mineral;
  const savings = targetOil === "Natural Ester" ? comp.naturalSavings : comp.syntheticSavings;
  const payback = targetOil === "Natural Ester" ? comp.naturalPayback : comp.syntheticPayback;
  const roi = targetOil === "Natural Ester" ? comp.naturalSimpleROI : comp.syntheticSimpleROI;
  const bcr = targetOil === "Natural Ester" ? comp.naturalBenefitCostRatio : comp.syntheticBenefitCostRatio;
  const multiple = targetOil === "Natural Ester" ? comp.naturalInvestmentMultiple : comp.syntheticInvestmentMultiple;

  const rating = data.transformerRating;
  const voltage = data.voltageClass;
  const analysisYears = data.analysisYears;
  const discountRate = data.discountRate;
  const oilVolume = data.oilVolume.toLocaleString("en-IN");
  
  const moOilCostLitre = formatINR(data.moOilCost);
  const activeOilCostLitre = formatINR(targetOil === "Natural Ester" ? data.naturalOilCost : data.syntheticOilCost);
  const activeTotalOilCost = formatINR(activeMetrics.oilCost);

  const moLCC = formatINRCompact(mineralMetrics.totalLifeCycleCost);
  const activeLCC = formatINRCompact(activeMetrics.totalLifeCycleCost);
  const activeSavings = formatINRCompact(savings);
  const activeSavingsPercentage = formatPercent((savings / mineralMetrics.totalLifeCycleCost) * 100, 2);

  const activeSavingsShortfall = savings < 0 ? formatINRCompact(Math.abs(savings)) : "₹0";

  const activeInitial = formatINRCompact(activeMetrics.initialInvestment);
  const moInitial = formatINRCompact(mineralMetrics.initialInvestment);
  const activeLife = activeMetrics.lifeExpectancy;
  const moLife = mineralMetrics.lifeExpectancy;

  const activeBCR = formatNumber(bcr, 2);
  const activeBCRValueRounded = Math.round(bcr);
  const activeROI = formatPercent(roi, 2);
  const activeROIMultiple = formatNumber(roi / 100, 1);
  const activeMultiple = formatNumber(multiple, 2);
  const activePayback = isFinite(payback) ? formatNumber(payback, 1) : "N/A";
  const activeAnnualisedSavings = formatINRCompact(savings / analysisYears);

  const moSalvagePV = formatINR(mineralMetrics.salvagePV);
  const activeSalvagePV = formatINR(activeMetrics.salvagePV);

  const moOMPV = formatINR(mineralMetrics.omPV);
  const activeOMPV = formatINR(activeMetrics.omPV);
  const moFireProtectionCapex = formatINR(mineralMetrics.fireProtectionCapex);
  const activeFireProtectionCapex = formatINR(activeMetrics.fireProtectionCapex);

  const activeCostPerMVA = formatINR(activeMetrics.costPerMVA);
  const activeCostPerMWh = formatINR(activeMetrics.costPerMWh);

  const newTransformerEstimateRange = rating >= 40 
    ? "₹2.0 Crore to ₹3.5 Crore" 
    : rating >= 20 
    ? "₹1.2 Crore to ₹2.0 Crore" 
    : "₹60 Lakh to ₹1.2 Crore";

  const phase1Savings = formatINRCompact(activeMetrics.omPV * 0.28);
  const phase2Savings = formatINRCompact(savings * 0.55);
  const phase3Savings = formatINRCompact(savings * 0.38);
  const totalOMSavings = formatINRCompact(mineralMetrics.omPV - activeMetrics.omPV);
  const avoidedCapex = formatINRCompact(mineralMetrics.initialInvestment - activeMetrics.initialInvestment + (mineralMetrics.replacementPV || 0));

  let result = template;
  result = result.replace(/{customerName}/g, data.customerName || "Customer");
  result = result.replace(/{rating}/g, String(rating));
  result = result.replace(/{voltage}/g, String(voltage));
  result = result.replace(/{analysisYears}/g, String(analysisYears));
  result = result.replace(/{discountRate}/g, String(discountRate));
  result = result.replace(/{oilVolume}/g, String(oilVolume));
  
  result = result.replace(/{moOilCostLitre}/g, moOilCostLitre);
  result = result.replace(/{activeOilCostLitre}/g, activeOilCostLitre);
  result = result.replace(/{activeTotalOilCost}/g, activeTotalOilCost);
  
  result = result.replace(/{moLCC}/g, moLCC);
  result = result.replace(/{activeLCC}/g, activeLCC);
  result = result.replace(/{activeSavings}/g, activeSavings);
  result = result.replace(/{activeSavingsPercentage}/g, activeSavingsPercentage);
  result = result.replace(/{activeSavingsShortfall}/g, activeSavingsShortfall);
  
  result = result.replace(/{activeInitial}/g, activeInitial);
  result = result.replace(/{moInitial}/g, moInitial);
  result = result.replace(/{activeLife}/g, String(activeLife));
  result = result.replace(/{moLife}/g, String(moLife));
  
  result = result.replace(/{activeBCR}/g, activeBCR);
  result = result.replace(/{activeBCRValueRounded}/g, String(activeBCRValueRounded));
  result = result.replace(/{activeROI}/g, activeROI);
  result = result.replace(/{activeROIMultiple}/g, activeROIMultiple);
  result = result.replace(/{activeMultiple}/g, activeMultiple);
  result = result.replace(/{activePayback}/g, activePayback);
  result = result.replace(/{activeAnnualisedSavings}/g, activeAnnualisedSavings);

  result = result.replace(/{moSalvagePV}/g, moSalvagePV);
  result = result.replace(/{activeSalvagePV}/g, activeSalvagePV);
  result = result.replace(/{moOMPV}/g, moOMPV);
  result = result.replace(/{activeOMPV}/g, activeOMPV);
  result = result.replace(/{moFireProtectionCapex}/g, moFireProtectionCapex);
  result = result.replace(/{activeFireProtectionCapex}/g, activeFireProtectionCapex);

  result = result.replace(/{activeCostPerMVA}/g, activeCostPerMVA);
  result = result.replace(/{activeCostPerMWh}/g, activeCostPerMWh);
  result = result.replace(/{newTransformerEstimateRange}/g, newTransformerEstimateRange);

  result = result.replace(/{phase1Savings}/g, phase1Savings);
  result = result.replace(/{phase2Savings}/g, phase2Savings);
  result = result.replace(/{phase3Savings}/g, phase3Savings);
  result = result.replace(/{totalOMSavings}/g, totalOMSavings);
  result = result.replace(/{avoidedCapex}/g, avoidedCapex);

  result = result.replace(/{naturalLifeExpectancy}/g, String(data.naturalLifeExpectancy));
  result = result.replace(/{syntheticLifeExpectancy}/g, String(data.syntheticLifeExpectancy));
  result = result.replace(/{naturalSalvagePercent}/g, String(data.naturalSalvagePercent));
  result = result.replace(/{syntheticSalvagePercent}/g, String(data.syntheticSalvagePercent));

  return result;
}



export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, data, comparison, targetOil } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (!data || !comparison) {
      return res.status(400).json({ error: "Active report data and comparison outputs are required" });
    }

    const selectedOil = targetOil || (comparison.bestValue !== "Mineral Oil" ? comparison.bestValue : "Natural Ester");

    // 1. Try local match first (of the 52 questions)
    const matchedKB = matchQuestion(message);
    if (matchedKB) {
      const answer = interpolateAnswer(matchedKB.answerTemplate, data, comparison, selectedOil);
      return res.status(200).json({
        answer,
        matchedId: matchedKB.id,
        source: "local_knowledge_base"
      });
    }

    // 3. Fallback to Gemini API if key is provided in environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `You are the authoritative "Savita Technical Advisor" for Savita Oil Technologies Limited.
Savita is the manufacturer of all kinds of Mineral Oil, Natural Ester Oil (branded as bioTRANSOL) and Synthetic Ester Oil (branded as TRANSOLSYNTH).
Savita is the pioneer who started production and business of both Ester Technologies in India first, making them the absolute best in local engineering and quality.

Never name competitor products (like FR3, Midel, Cargill, Apar, Envirotemp).

Here is the current customer report data:
- Customer Name: ${data.customerName || "Customer"}
- Transformer Rating: ${data.transformerRating} MVA
- Voltage Class: ${data.voltageClass} kV
- Oil Volume: ${data.oilVolume} Litres

Here is the calculated financial and operational comparison results:
- Best Value choice: ${comparison.bestValue} (Ester savings: bioTRANSOL: ${comparison.naturalSavings}, TRANSOLSYNTH: ${comparison.syntheticSavings})
- bioTRANSOL (Natural Ester) Payback: ${comparison.naturalPayback} years, BCR: ${comparison.naturalBenefitCostRatio}
- TRANSOLSYNTH (Synthetic Ester) Payback: ${comparison.syntheticPayback} years, BCR: ${comparison.syntheticBenefitCostRatio}

Answer the user's question with professional authority. Be concise, pitch Ester technology (bioTRANSOL/TRANSOLSYNTH) convincingly showing CapEx offsets on fire protection, paper life extension, and lifecycle TCO savings. Always use the branded names bioTRANSOL and TRANSOLSYNTH.

User Question: "${message}"`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            }),
            signal: controller.signal
          }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const resJson: any = await response.json();
          const generatedText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return res.status(200).json({
              answer: generatedText.trim(),
              source: "gemini_api"
            });
          }
        }
      } catch (apiErr) {
        console.error("Gemini API call failed:", apiErr);
      }
    }

    // 4. Default offline fallback response
    const fallbackAnswer = getExpertFallback(message, data, comparison, selectedOil);
    return res.status(200).json({
      answer: fallbackAnswer,
      source: "offline_fallback"
    });

  } catch (error: any) {
    console.error("Vercel Serverless Chat Route Error:", error);
    // Return standard JSON error, preventing a full crash
    return res.status(500).json({ error: error.message || "Unknown error occurred", stack: error.stack });
  }
}

