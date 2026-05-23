import { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Printer,
  Download,
  RotateCcw,
  Settings,
  FileText,
  LineChart,
  Calculator,
  Factory,
  Info,
  Award,
  MessageSquare,
  Sparkles,
  Search,
  Send,
  MessageCircle,
} from "lucide-react";

import {
  ReportData,
  defaultReportData,
  performComparison,
  formatINR,
  formatINRCompact,
  formatNumber,
  formatPercent,
  OilMetrics,
} from "@/lib/calculations";
import { Logo } from "@/components/Logo";
import { FieldInput } from "@/components/FieldInput";
import { generateReportPdf } from "@/lib/pdfReport";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { knowledgeBase, interpolateAnswer } from "@shared/knowledgeBase";


type NumericKey = {
  [K in keyof ReportData]: ReportData[K] extends number ? K : never;
}[keyof ReportData];

const sections = [
  { id: "project", label: "Project", icon: Factory },
  { id: "mineral", label: "Savita Mineral Oil", icon: Calculator },
  { id: "natural", label: "bioTRANSOL (Natural)", icon: Calculator },
  { id: "synthetic", label: "TRANSOLSYNTH (Synthetic)", icon: Calculator },
  { id: "common", label: "Common", icon: Settings },
  { id: "results", label: "Results", icon: LineChart },
  { id: "report", label: "Report", icon: FileText },
  { id: "qa", label: "Q&A Assistant", icon: MessageSquare },
];

export default function Home() {
  const [data, setData] = useState<ReportData>({ ...defaultReportData });
  const [active, setActive] = useState<string>("project");

  const setNum = (key: NumericKey, raw: string) => {
    const v = raw === "" ? 0 : Number(raw);
    setData((d) => ({ ...d, [key]: Number.isFinite(v) ? v : 0 }));
  };

  const comp = useMemo(() => performComparison(data), [data]);

  const reset = () => setData({ ...defaultReportData });

  // Q&A Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; sender: "user" | "agent" }>>([
    {
      id: "welcome",
      text: "Hello! I am your Savita Oil Technologies Q&A Assistant. Ask me any question about the financial appraisal (LCC, ROI, Payback), safety properties, or operations of bioTRANSOL (Natural Ester) and TRANSOLSYNTH (Synthetic Ester) oils vs Mineral Oil. Savita Oil Technologies Limited is the pioneer manufacturer of all kinds of Mineral Oil, Natural Ester Oil & Synthetic Ester Oil, starting production and business of both Ester technologies in India first.",
      sender: "agent",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeOilTab, setActiveOilTab] = useState<"Natural Ester" | "Synthetic Ester">("Natural Ester");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // Automatically update target oil type context based on best value
  useEffect(() => {
    if (comp.bestValue !== "Mineral Oil") {
      setActiveOilTab(comp.bestValue);
    }
  }, [comp.bestValue]);

  const handleAsk = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = { id: `user-${Date.now()}`, text, sender: "user" as const };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          data,
          comparison: comp,
          targetOil: activeOilTab,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const agentMsg = {
          id: `agent-${Date.now()}`,
          text: result.answer,
          sender: "agent" as const,
        };
        setChatMessages((prev) => [...prev, agentMsg]);
      } else {
        const errorData = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorData}`);
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = {
        id: `agent-err-${Date.now()}`,
        text: `DEBUG ERROR: ${err.message}`,
        sender: "agent" as const,
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopyQuestionToChat = (q: any) => {
    const formattedAnswer = interpolateAnswer(q.answerTemplate, data, comp, activeOilTab);
    setChatMessages((prev) => [
      ...prev,
      { id: `user-click-${Date.now()}-${q.id}`, text: q.question, sender: "user" },
      { id: `agent-click-${Date.now()}-${q.id}`, text: formattedAnswer, sender: "agent" }
    ]);
  };

  const filteredQuestions = useMemo(() => {
    return knowledgeBase.filter((q) => {
      const matchesCategory = selectedCategory === "All" || q.category === selectedCategory;
      return matchesCategory;
    });
  }, [selectedCategory]);

  const exportCSV = () => {
    const rows: (string | number)[][] = [];
    rows.push(["Transformer Oil Financial Comparison"]);
    rows.push(["Generated", new Date().toISOString()]);
    rows.push([]);
    rows.push(["Customer", data.customerName || ""]);
    rows.push(["Transformer Rating (MVA)", data.transformerRating]);
    rows.push(["Voltage Class", data.voltageClass]);
    rows.push(["Oil Volume (L)", data.oilVolume]);
    rows.push(["Base Transformer Cost (INR)", data.baseTransformerCost]);
    rows.push(["Inflation Rate", data.inflationRate]);
    rows.push(["Discount Rate", data.discountRate]);
    rows.push(["Analysis Years", data.analysisYears]);
    rows.push(["Failure Cost per Event (INR)", data.failureCost]);
    rows.push([]);

    const headers = ["Metric", "Savita Mineral Oil", "bioTRANSOL (Natural Ester)", "TRANSOLSYNTH (Synthetic Ester)"];
    rows.push(headers);

    const m = comp.mineral;
    const n = comp.natural;
    const s = comp.synthetic;
    const addRow = (label: string, f: (x: OilMetrics) => number, digits = 0) => {
      rows.push([
        label,
        Number(f(m).toFixed(digits)),
        Number(f(n).toFixed(digits)),
        Number(f(s).toFixed(digits)),
      ]);
    };

    addRow("Initial Investment (INR)", (x) => x.initialInvestment);
    addRow("Oil Cost (INR)", (x) => x.oilCost);
    addRow("Fire Protection CapEx (INR)", (x) => x.fireProtectionCapex);
    addRow("Fire Protection O&M (INR/yr)", (x) => x.fireProtectionOM);
    addRow("O&M PV (INR)", (x) => x.omPV);
    addRow("Insurance PV (INR)", (x) => x.insurancePV);
    addRow("Failure Cost PV (INR)", (x) => x.failureCostPV);
    addRow("Replacement PV (INR)", (x) => x.replacementPV);
    addRow("Salvage PV (INR)", (x) => x.salvagePV);
    addRow("Total Life Cycle Cost (INR)", (x) => x.totalLifeCycleCost);
    addRow("Annual Equivalent Cost (INR)", (x) => x.annualEquivalentCost);
    addRow("Cost / Year (INR)", (x) => x.costPerYear);
    addRow("Cost / MVA-Year (INR)", (x) => x.costPerMVAYear);
    addRow("Cost / MWh (INR)", (x) => x.costPerMWh, 4);
    addRow("Cost / MVA (INR)", (x) => x.costPerMVA);
    addRow("Life Expectancy (years)", (x) => x.lifeExpectancy);
    addRow("Failure Rate (per year)", (x) => x.failureRate, 6);

    rows.push([]);
    rows.push(["Comparison vs Mineral Oil baseline"]);
    rows.push(["", "bioTRANSOL (Natural Ester)", "TRANSOLSYNTH (Synthetic Ester)"]);
    rows.push(["Savings (INR)", comp.naturalSavings, comp.syntheticSavings]);
    rows.push(["Benefit / Cost Ratio", comp.naturalBenefitCostRatio, comp.syntheticBenefitCostRatio]);
    rows.push(["Investment Multiple", comp.naturalInvestmentMultiple, comp.syntheticInvestmentMultiple]);
    rows.push(["Simple ROI (%)", comp.naturalSimpleROI, comp.syntheticSimpleROI]);
    rows.push(["Payback (years)", isFinite(comp.naturalPayback) ? comp.naturalPayback : "N/A", isFinite(comp.syntheticPayback) ? comp.syntheticPayback : "N/A"]);
    rows.push([]);
    rows.push(["Best Value (lowest TLCC)", comp.bestValue]);

    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "");
            if (s.includes(",") || s.includes('"') || s.includes("\n")) {
              return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fileName = `transformer-oil-comparison-${(data.customerName || "report").replace(/\s+/g, "-")}.csv`;
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const print = () => window.print();
  const generatePDF = () => generateReportPdf(data, comp);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="no-print w-56 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
          <Logo className="w-7 h-7 text-sidebar-primary" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Transformer TCO</div>
            <div className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">Oil Fluid Analyzer</div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActive(s.id);
                  document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                data-testid={`nav-${s.id}`}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors text-left ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-3 border-t border-sidebar-border text-[10px] leading-snug text-sidebar-foreground/60">
          Manufactured by:
          <div className="font-semibold text-sidebar-foreground mt-0.5">Savita Oil Technologies Limited</div>
          <div className="mt-1 text-[9px] leading-tight text-sidebar-foreground/50">
            Pioneer & India's first manufacturer of bioTRANSOL (Natural Ester) & TRANSOLSYNTH (Synthetic Ester) oils.
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top toolbar */}
        <header className="app-toolbar no-print h-14 border-b border-border bg-card/80 backdrop-blur flex items-center px-4 gap-3 shrink-0">
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-semibold tracking-tight truncate">Transformer Oil Financial Comparison</h1>
            <p className="text-[11px] text-muted-foreground truncate">
              Whole-life cost modelling · Savita Mineral Oil vs bioTRANSOL vs TRANSOLSYNTH
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="hidden md:inline-flex font-mono text-[10px] tabular-nums" data-testid="badge-best-value">
              <Award className="w-3 h-3 mr-1" />
              Best: {comp.bestValue}
            </Badge>
            <Button size="sm" variant="outline" onClick={reset} data-testid="button-reset">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
            </Button>
            <Button size="sm" variant="outline" onClick={exportCSV} data-testid="button-export-csv">
              <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
            </Button>
            <Button size="sm" variant="outline" onClick={generatePDF} data-testid="button-generate-pdf">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> PDF Report
            </Button>
            <Button size="sm" onClick={print} data-testid="button-print">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print report
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto px-6 py-5 space-y-5">
            {/* Disclaimer banner */}
            <div
              className="no-print flex items-start gap-2 rounded-md border border-amber-300/40 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700/40 px-3 py-2 text-xs text-amber-900 dark:text-amber-100"
              data-testid="banner-disclaimer"
            >
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p>
                All values shown are editable assumptions / demo inputs. Validate every figure with site-specific
                engineering, procurement and insurance data before using this output in commercial decisions.
              </p>
            </div>

            {/* Results strip — sticky at top of content */}
            <section id="section-results-summary" className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SummaryCard
                title="Savita Mineral Oil"
                accent="amber"
                metric={comp.mineral}
                isBest={comp.bestValue === "Mineral Oil"}
                testId="card-summary-mineral"
              />
              <SummaryCard
                title="bioTRANSOL (Natural Ester)"
                accent="emerald"
                metric={comp.natural}
                isBest={comp.bestValue === "Natural Ester"}
                testId="card-summary-natural"
              />
              <SummaryCard
                title="TRANSOLSYNTH (Synthetic Ester)"
                accent="teal"
                metric={comp.synthetic}
                isBest={comp.bestValue === "Synthetic Ester"}
                testId="card-summary-synthetic"
              />
            </section>

            {/* Input panels grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Project */}
              <Card id="section-project" className="xl:col-span-3 glassmorphic-card hover-glow-primary border-t border-t-primary/10 transition-all-300 shadow-md scroll-mt-6" data-testid="card-project">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Factory className="w-4 h-4" /> Project & Transformer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="customerName" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Customer
                      </Label>
                      <Input
                        id="customerName"
                        value={data.customerName}
                        onChange={(e) => setData((d) => ({ ...d, customerName: e.target.value }))}
                        placeholder="Utility / OEM name"
                        className="h-8 text-sm"
                        data-testid="input-customerName"
                      />
                    </div>
                    <FieldInput
                      id="transformerRating"
                      label="Rating"
                      value={data.transformerRating}
                      onChange={(v) => setNum("transformerRating", v)}
                      suffix="MVA"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="voltageClass" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Voltage Class
                      </Label>
                      <Input
                        id="voltageClass"
                        value={data.voltageClass}
                        onChange={(e) => setData((d) => ({ ...d, voltageClass: e.target.value }))}
                        className="h-8 text-sm"
                        data-testid="input-voltageClass"
                      />
                    </div>
                    <FieldInput
                      id="oilVolume"
                      label="Oil Volume"
                      value={data.oilVolume}
                      onChange={(v) => setNum("oilVolume", v)}
                      suffix="L"
                    />
                    <FieldInput
                      id="baseTransformerCost"
                      label="Base Transformer Cost"
                      value={data.baseTransformerCost}
                      onChange={(v) => setNum("baseTransformerCost", v)}
                      prefix="₹"
                      hint="Active part + tank (excludes oil & fire protection)"
                    />
                  </div>
                </CardContent>
              </Card>

              <OilCard
                id="section-mineral"
                title="Savita Mineral Oil"
                accent="border-l-amber-500"
                fields={[
                  { id: "moOilCost", label: "Oil Cost", value: data.moOilCost, k: "moOilCost", prefix: "₹", suffix: "/L" },
                  { id: "moLifeExpectancy", label: "Life Expectancy", value: data.moLifeExpectancy, k: "moLifeExpectancy", suffix: "yr" },
                  { id: "moAnnualOM", label: "Annual O&M", value: data.moAnnualOM, k: "moAnnualOM", prefix: "₹" },
                  { id: "moSalvagePercent", label: "Salvage", value: data.moSalvagePercent, k: "moSalvagePercent", suffix: "%" },
                  { id: "moInsurancePremium", label: "Insurance / yr", value: data.moInsurancePremium, k: "moInsurancePremium", prefix: "₹" },
                  { id: "moFireProtectionCapex", label: "Fire Protection CapEx", value: data.moFireProtectionCapex, k: "moFireProtectionCapex", prefix: "₹" },
                  { id: "moFireProtectionOM", label: "Fire Protection O&M / yr", value: data.moFireProtectionOM, k: "moFireProtectionOM", prefix: "₹" },
                  { id: "moFailureRate", label: "Failure Rate", value: data.moFailureRate, k: "moFailureRate", suffix: "%/yr", step: "0.1" },
                ]}
                onChange={setNum}
              />

              <OilCard
                id="section-natural"
                title="bioTRANSOL (Natural Ester)"
                accent="border-l-emerald-500"
                fields={[
                  { id: "naturalOilCost", label: "Oil Cost", value: data.naturalOilCost, k: "naturalOilCost", prefix: "₹", suffix: "/L" },
                  { id: "naturalLifeExpectancy", label: "Life Expectancy", value: data.naturalLifeExpectancy, k: "naturalLifeExpectancy", suffix: "yr" },
                  { id: "naturalAnnualOM", label: "Annual O&M", value: data.naturalAnnualOM, k: "naturalAnnualOM", prefix: "₹" },
                  { id: "naturalSalvagePercent", label: "Salvage", value: data.naturalSalvagePercent, k: "naturalSalvagePercent", suffix: "%" },
                  { id: "naturalInsurancePremium", label: "Insurance / yr", value: data.naturalInsurancePremium, k: "naturalInsurancePremium", prefix: "₹" },
                  { id: "naturalFireProtectionCapex", label: "Fire Protection CapEx", value: data.naturalFireProtectionCapex, k: "naturalFireProtectionCapex", prefix: "₹" },
                  { id: "naturalFireProtectionOM", label: "Fire Protection O&M / yr", value: data.naturalFireProtectionOM, k: "naturalFireProtectionOM", prefix: "₹" },
                  { id: "naturalFailureRate", label: "Failure Rate", value: data.naturalFailureRate, k: "naturalFailureRate", suffix: "%/yr", step: "0.1" },
                ]}
                onChange={setNum}
              />

              <OilCard
                id="section-synthetic"
                title="TRANSOLSYNTH (Synthetic Ester)"
                accent="border-l-teal-500"
                fields={[
                  { id: "syntheticOilCost", label: "Oil Cost", value: data.syntheticOilCost, k: "syntheticOilCost", prefix: "₹", suffix: "/L" },
                  { id: "syntheticLifeExpectancy", label: "Life Expectancy", value: data.syntheticLifeExpectancy, k: "syntheticLifeExpectancy", suffix: "yr" },
                  { id: "syntheticAnnualOM", label: "Annual O&M", value: data.syntheticAnnualOM, k: "syntheticAnnualOM", prefix: "₹" },
                  { id: "syntheticSalvagePercent", label: "Salvage", value: data.syntheticSalvagePercent, k: "syntheticSalvagePercent", suffix: "%" },
                  { id: "syntheticInsurancePremium", label: "Insurance / yr", value: data.syntheticInsurancePremium, k: "syntheticInsurancePremium", prefix: "₹" },
                  { id: "syntheticFireProtectionCapex", label: "Fire Protection CapEx", value: data.syntheticFireProtectionCapex, k: "syntheticFireProtectionCapex", prefix: "₹" },
                  { id: "syntheticFireProtectionOM", label: "Fire Protection O&M / yr", value: data.syntheticFireProtectionOM, k: "syntheticFireProtectionOM", prefix: "₹" },
                  { id: "syntheticFailureRate", label: "Failure Rate", value: data.syntheticFailureRate, k: "syntheticFailureRate", suffix: "%/yr", step: "0.1" },
                ]}
                onChange={setNum}
              />

              {/* Common assumptions */}
              <Card id="section-common" className="xl:col-span-3 glassmorphic-card hover-glow-primary border-t border-t-primary/10 transition-all-300 shadow-md scroll-mt-6" data-testid="card-common">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Common Assumptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <FieldInput
                      id="inflationRate"
                      label="Inflation Rate"
                      value={data.inflationRate}
                      step="0.001"
                      onChange={(v) => setNum("inflationRate", v)}
                      suffix="%"
                      hint="Percent per year, e.g. 6 = 6%"
                    />
                    <FieldInput
                      id="discountRate"
                      label="Discount Rate"
                      value={data.discountRate}
                      step="0.001"
                      onChange={(v) => setNum("discountRate", v)}
                      suffix="%"
                      hint="Percent per year, e.g. 10 = 10%"
                    />
                    <FieldInput
                      id="analysisYears"
                      label="Analysis Horizon"
                      value={data.analysisYears}
                      onChange={(v) => setNum("analysisYears", v)}
                      suffix="yr"
                    />
                    <FieldInput
                      id="failureCost"
                      label="Failure Cost / Event"
                      value={data.failureCost}
                      onChange={(v) => setNum("failureCost", v)}
                      prefix="₹"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparison table */}
            <Card id="section-results" className="glassmorphic-card hover-glow-primary border-t border-t-primary/10 transition-all-300 shadow-md scroll-mt-6" data-testid="card-results-table">
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <LineChart className="w-4 h-4" /> Comparative Results
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  Horizon: {data.analysisYears} yrs · Disc {data.discountRate.toFixed(1)}% · Infl {data.inflationRate.toFixed(1)}%
                </Badge>
              </CardHeader>
              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[260px]">Metric</TableHead>
                        <TableHead className="text-right">Savita Mineral Oil</TableHead>
                        <TableHead className="text-right">bioTRANSOL (Natural)</TableHead>
                        <TableHead className="text-right">TRANSOLSYNTH (Synthetic)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <MetricRow label="Initial Investment" pick={(x) => formatINR(x.initialInvestment)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-initial" />
                      <MetricRow label="Oil Fill Cost (t=0)" pick={(x) => formatINR(x.oilCost)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-oilcost" />
                      <MetricRow label="Fire Protection CapEx" pick={(x) => formatINR(x.fireProtectionCapex)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-fp-capex" />
                      <MetricRow label="Fire Protection O&M (PV)" pick={(x) => formatINR(x.fireProtectionOMPV)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-fp-om" />
                      <MetricRow label="O&M PV" pick={(x) => formatINR(x.omPV)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-om" />
                      <MetricRow label="Insurance PV" pick={(x) => formatINR(x.insurancePV)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-insurance" />
                      <MetricRow label="Failure Cost PV" pick={(x) => formatINR(x.failureCostPV)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-failure" />
                      <MetricRow label="Asset Replacement Cost (PV)" pick={(x) => formatINR(x.replacementPV)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-replacement" />
                      <MetricRow label="Salvage PV (credit)" pick={(x) => formatINR(x.salvagePV)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-salvage" />
                      <MetricRow strong label="Total Life Cycle Cost" pick={(x) => formatINR(x.totalLifeCycleCost)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-tlcc" />
                      <MetricRow label="Annual Equivalent Cost" pick={(x) => formatINR(x.annualEquivalentCost)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-aec" />
                      <MetricRow label="Cost / Year" pick={(x) => formatINR(x.costPerYear)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-cost-year" />
                      <MetricRow label="Cost / MVA · Year" pick={(x) => formatINR(x.costPerMVAYear)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-cost-mva-year" />
                      <MetricRow label="Cost / MWh" pick={(x) => `₹${formatNumber(x.costPerMWh, 2)}`} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-cost-mwh" />
                      <MetricRow label="Cost / MVA" pick={(x) => formatINR(x.costPerMVA)} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-cost-mva" />
                      <MetricRow label="Life Expectancy" pick={(x) => `${x.lifeExpectancy} yr`} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-life" />
                      <MetricRow label="Failure Rate" pick={(x) => `${x.failureRate.toFixed(3)}% / yr`} m={comp.mineral} n={comp.natural} s={comp.synthetic} testId="row-failure-rate" />
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-6 py-4">
                  <Card className="border-l-4 border-l-emerald-500" data-testid="card-vs-natural">
                    <CardHeader className="py-2"><CardTitle className="text-sm">bioTRANSOL (Natural Ester) vs Savita Mineral Oil</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <KV label="Lifetime savings" value={formatINRCompact(comp.naturalSavings)} testId="kv-nat-savings" />
                      <KV label="Benefit / cost" value={isFinite(comp.naturalBenefitCostRatio) ? formatNumber(comp.naturalBenefitCostRatio) : "∞"} testId="kv-nat-bcr" />
                      <KV label="Investment multiple" value={isFinite(comp.naturalInvestmentMultiple) ? `${formatNumber(comp.naturalInvestmentMultiple)}×` : "∞"} testId="kv-nat-im" />
                      <KV label="Simple ROI" value={formatPercent(comp.naturalSimpleROI)} testId="kv-nat-roi" />
                      <KV label="Payback" value={isFinite(comp.naturalPayback) ? `${formatNumber(comp.naturalPayback, 1)} yr` : "—"} testId="kv-nat-payback" />
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-teal-500" data-testid="card-vs-synthetic">
                    <CardHeader className="py-2"><CardTitle className="text-sm">TRANSOLSYNTH (Synthetic Ester) vs Savita Mineral Oil</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <KV label="Lifetime savings" value={formatINRCompact(comp.syntheticSavings)} testId="kv-syn-savings" />
                      <KV label="Benefit / cost" value={isFinite(comp.syntheticBenefitCostRatio) ? formatNumber(comp.syntheticBenefitCostRatio) : "∞"} testId="kv-syn-bcr" />
                      <KV label="Investment multiple" value={isFinite(comp.syntheticInvestmentMultiple) ? `${formatNumber(comp.syntheticInvestmentMultiple)}×` : "∞"} testId="kv-syn-im" />
                      <KV label="Simple ROI" value={formatPercent(comp.syntheticSimpleROI)} testId="kv-syn-roi" />
                      <KV label="Payback" value={isFinite(comp.syntheticPayback) ? `${formatNumber(comp.syntheticPayback, 1)} yr` : "—"} testId="kv-syn-payback" />
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Report preview */}
            <Card id="section-report" data-testid="card-report">
              <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Report preview
                </CardTitle>
                <div className="text-[11px] text-muted-foreground">
                  Use <span className="font-mono">Print report</span> to render this section as PDF.
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border bg-card p-6 space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Transformer Oil Financial Comparison
                      </div>
                      <h2 className="text-base font-semibold mt-0.5" data-testid="text-report-title">
                        {data.customerName ? `${data.customerName} — ` : ""}{data.transformerRating} MVA, {data.voltageClass}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        {data.oilVolume.toLocaleString("en-IN")} L oil volume · {data.analysisYears} year horizon
                      </p>
                    </div>
                    <Logo className="w-10 h-10 text-primary" />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4">
                    <ReportStat label="Best value" value={comp.bestValue} testId="text-report-best" />
                    <ReportStat label="bioTRANSOL savings" value={formatINRCompact(comp.naturalSavings)} testId="text-report-nat-savings" />
                    <ReportStat label="TRANSOLSYNTH savings" value={formatINRCompact(comp.syntheticSavings)} testId="text-report-syn-savings" />
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Lifecycle modelling assumes inflation of {(data.inflationRate * 100).toFixed(1)}% per annum and a
                    discount rate of {(data.discountRate * 100).toFixed(1)}% per annum across a {data.analysisYears}-year
                    horizon. Operating, insurance, fire-protection O&M and failure-cost streams are escalated annually and
                    discounted to present value. Salvage value is taken as a percentage of the initial investment at end of
                    horizon, discounted to present.
                  </p>

                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Note: Values shown are editable assumptions and demo inputs intended for indicative analysis. Validate
                    every input with project-specific engineering, procurement and insurance data before using the output
                    in commercial decisions.
                  </p>

                  <Separator />
                  <div className="text-[10px] text-muted-foreground flex justify-between">
                    <span>Generated by Transformer TCO · v0.1 prototype</span>
                    <span>{new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Q&A Assistant */}
            <Card id="section-qa" className="glassmorphic-card border-t border-t-primary/10 hover-glow-primary transition-all-300 shadow-lg scroll-mt-6 overflow-hidden" data-testid="card-qa">
              <CardHeader className="py-3 flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 rounded-md">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold tracking-tight">Interactive TCO Advisor & Q&A</CardTitle>
                    <p className="text-xs text-muted-foreground">Expert financial and technical advice on Ester fluid upgrades</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
                  {/* Left Side: Dynamic Chat (Lg: 8 columns / 2/3 position) */}
                  <div className="lg:col-span-8 flex flex-col h-[580px] bg-muted/5">
                    {/* Chat Header Banner */}
                    <div className="px-4 py-2.5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-border/20 shadow-sm shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-extrabold border border-primary/30">S</div>
                        <div>
                          <div className="text-sm font-bold leading-none">Savita Technical Advisor</div>
                          <div className="text-[10px] text-slate-400">TCO & Life Cycle Specialist</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Online</span>
                      </div>
                    </div>

                    {/* Chat History Area */}
                    <ScrollArea className="flex-1 p-4 overflow-y-auto">
                      <div className="space-y-4">
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex gap-2 items-start ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            {msg.sender === "agent" && (
                              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs text-emerald-600 dark:text-emerald-400 font-black shrink-0">
                                S
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap shadow-sm border ${
                                msg.sender === "user"
                                  ? "chat-bubble-user border-primary/20 rounded-tr-none text-white font-medium"
                                  : "chat-bubble-agent border-border/50 rounded-tl-none text-foreground font-normal"
                              }`}
                            >
                              {msg.text}
                            </div>
                            {msg.sender === "user" && (
                              <div className="w-7 h-7 rounded-full bg-primary/25 border border-primary/35 flex items-center justify-center text-xs text-primary font-bold shrink-0">
                                U
                              </div>
                            )}
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="flex gap-2 items-start justify-start">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs text-emerald-600 dark:text-emerald-400 font-black shrink-0">
                              S
                            </div>
                            <div className="bg-card border border-border/50 rounded-2xl rounded-tl-none px-3.5 py-2 shadow-sm flex gap-1 items-center h-8">
                              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}
                        <div ref={chatBottomRef} />
                      </div>
                    </ScrollArea>

                    {/* Suggested Chips */}
                    <div className="px-4 py-2 border-t border-border/40 bg-muted/20 shrink-0">
                      <div className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">Quick-Ask Topics:</div>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => handleAsk("What is the payback period of this project?")}
                          className="bg-card hover:bg-muted text-xs border border-border/60 hover:border-primary/40 px-2 py-0.5 rounded-full text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer shadow-2xs font-medium"
                        >
                          💸 Payback Period
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAsk("Explain LCC savings vs Initial Cost Premium")}
                          className="bg-card hover:bg-muted text-xs border border-border/60 hover:border-primary/40 px-2 py-0.5 rounded-full text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer shadow-2xs font-medium"
                        >
                          📉 TCO Savings
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAsk("Can you explain Simple ROI in plain terms?")}
                          className="bg-card hover:bg-muted text-xs border border-border/60 hover:border-primary/40 px-2 py-0.5 rounded-full text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer shadow-2xs font-medium"
                        >
                          📊 Simple ROI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAsk("Why is Ester oil fire-safe?")}
                          className="bg-card hover:bg-muted text-xs border border-border/60 hover:border-primary/40 px-2 py-0.5 rounded-full text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer shadow-2xs font-medium"
                        >
                          🔥 Fire Safety
                        </button>
                      </div>
                    </div>

                    {/* Chat Input form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (chatInput.trim()) {
                          handleAsk(chatInput);
                        }
                      }}
                      className="p-3 border-t border-border/50 bg-card flex gap-2 shrink-0 items-center"
                    >
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={`Ask about ${activeOilTab} payback, savings, safety...`}
                        className="flex-1 h-9 text-sm bg-muted/20 border-border focus-visible:ring-1 focus-visible:ring-primary/40"
                        disabled={chatLoading}
                      />
                      <Button type="submit" size="sm" className="h-9 w-9 p-0 shrink-0 bg-primary hover:bg-primary/95 text-white" disabled={chatLoading}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Right Side: 50 Q&A Explorer (Lg: 4 columns / 1/3 position) */}
                  <div className="lg:col-span-4 flex flex-col h-[580px] bg-card">
                    {/* Categories Bar (Search Bar Removed) */}
                    <div className="p-4 border-b border-border/50 flex flex-col gap-3 shrink-0 bg-muted/5">
                      {/* Horizontal Pills Category Filter */}
                      <div className="overflow-x-auto flex gap-1.5 pb-1 select-none scrollbar-none scrollbar-thin">
                        {[
                          { id: "All", label: "All Topics" },
                          { id: "Financial & TCO Metrics", label: "TCO & Financial" },
                          { id: "Investment & Cost Questions", label: "Investments" },
                          { id: "Technology & Product Questions", label: "Technology" },
                          { id: "Risk, Safety & Operational Questions", label: "Risk & Safety" },
                          { id: "Insurance, ESG & Strategic Questions", label: "ESG & Strategy" },
                          { id: "Decision-Making & Process Questions", label: "Decision Path" },
                        ].map((cat) => {
                          const isActive = selectedCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`text-xs font-bold px-3 py-1 rounded-md border shrink-0 transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? "bg-primary text-white border-primary shadow-xs"
                                  : "bg-card text-muted-foreground border-border/80 hover:bg-muted/80 hover:text-foreground"
                              }`}
                            >
                              {cat.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scrollable Questions list */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredQuestions.length > 0 ? (
                          filteredQuestions.map((q) => (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => handleCopyQuestionToChat(q)}
                              className="w-full text-left font-semibold text-sm hover:text-primary p-3 rounded-lg border border-border/40 bg-muted/5 hover:bg-muted/10 transition-colors flex items-center justify-between gap-3 group"
                            >
                              <span>{q.question}</span>
                              <MessageCircle className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0" />
                            </button>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-12 text-sm flex flex-col items-center justify-center gap-2">
                            <Info className="w-6 h-6 text-muted-foreground/60" />
                            <span>No Q&A matches this category. Try switching topic pills above.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  metric,
  isBest,
  testId,
  accent,
}: {
  title: string;
  metric: OilMetrics;
  isBest: boolean;
  testId: string;
  accent: "amber" | "emerald" | "teal";
}) {
  const accentClass =
    accent === "amber"
      ? "border-l-amber-500 border-t-amber-500/10 hover-glow-amber"
      : accent === "emerald"
      ? "border-l-emerald-500 border-t-emerald-500/10 hover-glow-emerald"
      : "border-l-teal-500 border-t-teal-500/10 hover-glow-teal";
  return (
    <Card className={`border-l-4 border-t shadow-md glassmorphic-card transition-all-300 ${accentClass}`} data-testid={testId}>
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        {isBest && (
          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px]" data-testid={`${testId}-best`}>
            <Award className="w-3 h-3 mr-1" /> Best value
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total life cycle cost</div>
          <div className="text-lg font-semibold tabular-nums" data-testid={`${testId}-tlcc`}>
            {formatINRCompact(metric.totalLifeCycleCost)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <KV label="Initial" value={formatINRCompact(metric.initialInvestment)} testId={`${testId}-initial`} />
          <KV label="AEC" value={formatINRCompact(metric.annualEquivalentCost)} testId={`${testId}-aec`} />
          <KV label="Life" value={`${metric.lifeExpectancy} yr`} testId={`${testId}-life`} />
          <KV label="Fail rate" value={`${metric.failureRate.toFixed(3)}%/yr`} testId={`${testId}-failrate`} />
        </div>
      </CardContent>
    </Card>
  );
}

function OilCard({
  id,
  title,
  accent,
  fields,
  onChange,
}: {
  id: string;
  title: string;
  accent: string;
  fields: Array<{
    id: string;
    label: string;
    value: number;
    k: NumericKey;
    prefix?: string;
    suffix?: string;
    step?: string;
  }>;
  onChange: (k: NumericKey, v: string) => void;
}) {
  const glowClass = 
    accent.includes("amber") 
      ? "hover-glow-amber border-t-amber-500/10" 
      : accent.includes("emerald") 
      ? "hover-glow-emerald border-t-emerald-500/10" 
      : "hover-glow-teal border-t-teal-500/10";
  return (
    <Card id={id} className={`border-l-4 border-t shadow-md glassmorphic-card transition-all-300 ${glowClass} ${accent}`} data-testid={`card-${id}`}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm">{title} — parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <FieldInput
              key={f.id}
              id={f.id}
              label={f.label}
              value={f.value}
              prefix={f.prefix}
              suffix={f.suffix}
              step={f.step}
              onChange={(v) => onChange(f.k, v)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({
  label,
  pick,
  m,
  n,
  s,
  strong,
  testId,
}: {
  label: string;
  pick: (x: OilMetrics) => string;
  m: OilMetrics;
  n: OilMetrics;
  s: OilMetrics;
  strong?: boolean;
  testId?: string;
}) {
  return (
    <TableRow data-testid={testId}>
      <TableCell className={`text-sm ${strong ? "font-semibold" : ""}`}>{label}</TableCell>
      <TableCell className={`text-right tabular-nums text-sm ${strong ? "font-semibold" : ""}`}>{pick(m)}</TableCell>
      <TableCell className={`text-right tabular-nums text-sm ${strong ? "font-semibold" : ""}`}>{pick(n)}</TableCell>
      <TableCell className={`text-right tabular-nums text-sm ${strong ? "font-semibold" : ""}`}>{pick(s)}</TableCell>
    </TableRow>
  );
}

function KV({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="flex justify-between items-baseline gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums" data-testid={testId}>{value}</span>
    </div>
  );
}

function ReportStat({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold tabular-nums mt-0.5" data-testid={testId}>{value}</div>
    </div>
  );
}
