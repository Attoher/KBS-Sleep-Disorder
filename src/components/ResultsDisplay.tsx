import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Lightbulb, Activity, Moon, Brain } from "lucide-react";
import { InferenceResult } from "../lib/kbs/inference";

interface ResultsDisplayProps {
  result: InferenceResult;
  onReset: () => void;
}

const ResultsDisplay = ({ result, onReset }: ResultsDisplayProps) => {
  const { facts, firedRules } = result;

  // Rule descriptions for explainability
  const ruleDescriptions: Record<string, string> = {
    R1: "High insomnia risk: Sleep < 5h AND quality ≤ 4",
    R2: "Moderate insomnia risk: 5 ≤ sleep < 7h AND stress ≥ 7",
    R3: "Moderate insomnia risk: Quality ≤ 4 AND stress ≥ 7",
    R4: "Low insomnia risk: 7 ≤ sleep ≤ 9h AND quality ≥ 7 AND stress < 7",
    R5: "High apnea risk: Obese AND Hypertension",
    R6: "Moderate apnea risk: Overweight AND Hypertension",
    R7: "Moderate apnea risk: Obese AND age ≥ 40",
    R8: "Low apnea risk: Normal BMI AND Normal BP",
    R9: "Low physical activity detected",
    R10: "High stress level detected (≥ 7)",
    R11: "Insufficient sleep duration (< 6h)",
    R12: "Weight issue: Overweight or Obese",
    R13: "Insomnia diagnosis confirmed",
    R14: "Sleep apnea diagnosis confirmed",
    R15: "Mixed disorder diagnosis (both conditions)",
    R16: "No disorder diagnosis (healthy)",
    R17: "Recommend sleep hygiene improvement",
    R18: "Recommend physical activity increase",
    R19: "Recommend stress management techniques",
    R20: "Recommend weight management and apnea evaluation",
  };

  // Determine main status based on diagnosis
  const getStatusConfig = () => {
    if (facts.diagnosis_mixed) {
      return {
        icon: AlertTriangle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/30",
        badgeVariant: "destructive" as const,
        title: "Mixed Sleep Disorder Detected",
        subtitle: "Indicators for both Insomnia and Sleep Apnea found",
      };
    } else if (facts.diagnosis_apnea) {
      return {
        icon: AlertTriangle,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        badgeVariant: "destructive" as const,
        title: "Sleep Apnea Detected",
        subtitle: "High risk indicators for Sleep Apnea",
      };
    } else if (facts.diagnosis_insomnia) {
      return {
        icon: AlertTriangle,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        badgeVariant: "destructive" as const,
        title: "Insomnia Detected",
        subtitle: "High risk indicators for Insomnia",
      };
    } else {
      return {
        icon: CheckCircle2,
        color: "text-secondary",
        bgColor: "bg-secondary/10",
        borderColor: "border-secondary/30",
        badgeVariant: "secondary" as const,
        title: "No Sleep Disorder Detected",
        subtitle: "Your sleep health indicators are within normal range",
      };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;
  const recommendations = Array.from(facts.recommendations);

  // Helper for risk badges
  const getRiskBadge = (risk: string | null | undefined) => {
    if (!risk || risk === "low") return <Badge className="bg-secondary text-secondary-foreground border-0 hover:bg-secondary">Low</Badge>;
    if (risk === "moderate") return <Badge className="bg-amber-500/90 text-white border-0 hover:bg-amber-500/90">Moderate</Badge>;
    return <Badge variant="destructive" className="hover:bg-destructive">High</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Main Result Card */}
      <Card variant="glass" className={`border-2 ${config.borderColor} bg-background/80`}>
        <CardHeader className="text-center pb-4">
          <div className={`w-20 h-20 mx-auto rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
            <StatusIcon className={`w-10 h-10 ${config.color}`} />
          </div>
          <CardTitle className="text-2xl md:text-3xl">{config.title}</CardTitle>
          <CardDescription className="text-base">{config.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">

            {/* Risk Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              <div className="p-4 rounded-lg bg-background/50 border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-primary" />
                  <span className="font-medium">Insomnia Risk</span>
                </div>
                {getRiskBadge(facts.insomnia_risk)}
              </div>
              <div className="p-4 rounded-lg bg-background/50 border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-destructive" />
                  <span className="font-medium">Apnea Risk</span>
                </div>
                {getRiskBadge(facts.apnea_risk)}
              </div>
            </div>

            {/* Lifestyle Issues */}
            <div className="w-full max-w-2xl">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Lifestyle Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`p-3 rounded border-2 text-center text-sm font-medium ${facts.lifestyle_issue_sleep ? 'bg-destructive/20 border-destructive text-foreground' : 'bg-secondary/30 border-secondary text-foreground'}`}>
                  Sleep Habits
                  {facts.lifestyle_issue_sleep ? <XCircle className="w-4 h-4 mx-auto mt-1 text-destructive" /> : <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-secondary" />}
                </div>
                <div className={`p-3 rounded border-2 text-center text-sm font-medium ${facts.lifestyle_issue_stress ? 'bg-destructive/20 border-destructive text-foreground' : 'bg-secondary/30 border-secondary text-foreground'}`}>
                  Stress Mgmt
                  {facts.lifestyle_issue_stress ? <XCircle className="w-4 h-4 mx-auto mt-1 text-destructive" /> : <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-secondary" />}
                </div>
                <div className={`p-3 rounded border-2 text-center text-sm font-medium ${facts.lifestyle_issue_activity ? 'bg-destructive/20 border-destructive text-foreground' : 'bg-secondary/30 border-secondary text-foreground'}`}>
                  Activity
                  {facts.lifestyle_issue_activity ? <XCircle className="w-4 h-4 mx-auto mt-1 text-destructive" /> : <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-secondary" />}
                </div>
                <div className={`p-3 rounded border-2 text-center text-sm font-medium ${facts.lifestyle_issue_weight ? 'bg-destructive/20 border-destructive text-foreground' : 'bg-secondary/30 border-secondary text-foreground'}`}>
                  Weight/BMI
                  {facts.lifestyle_issue_weight ? <XCircle className="w-4 h-4 mx-auto mt-1 text-destructive" /> : <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-secondary" />}
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Recommendations Card */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-secondary" />
            Recommendations
          </CardTitle>
          <CardDescription>
            Personalized suggestions based on your analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-6 h-6 rounded-full medical-gradient flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm text-foreground">
                    {/* Map recommendation IDs to readable text */}
                    {rec === "REC_SLEEP_HYGIENE" && "Improve sleep hygiene (consistent schedule, avoid screens)"}
                    {rec === "REC_PHYSICAL_ACTIVITY" && "Increase physical activity (aim for ≥150 min/week)"}
                    {rec === "REC_STRESS_MANAGEMENT" && "Practice stress reduction techniques (meditation, breathing)"}
                    {rec === "REC_WEIGHT_MANAGEMENT" && "Consider a weight management program"}
                    {rec === "REC_APNEA_EVAL" && "Consult a healthcare provider for sleep apnea evaluation"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No specific recommendations generated.</p>
          )}
        </CardContent>
      </Card>

      {/* Explainability / Fired Rules */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-4 h-4 text-muted-foreground" />
            Analysis Logic (Explainable AI)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">The following clinical rules were triggered by your data:</p>
          <div className="space-y-2">
            {firedRules.map(ruleId => (
              <div key={ruleId} className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
                <Badge variant="outline" className="font-mono text-xs shrink-0">
                  {ruleId}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {ruleDescriptions[ruleId] || "Clinical rule triggered"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <Button variant="medical" size="lg" className="min-w-[200px]" onClick={onReset}>
          <RefreshCw className="w-4 h-4" />
          New Analysis
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center text-muted-foreground px-4">
        <strong>Disclaimer:</strong> This prediction is for informational purposes only
        and should not replace professional medical advice. Please consult a healthcare
        provider for proper diagnosis and treatment.
      </p>
    </div>
  );
};

export default ResultsDisplay;
