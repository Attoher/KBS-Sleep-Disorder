import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Download, Lightbulb } from "lucide-react";
import { PredictionResult } from "./PredictionForm";

interface ResultsDisplayProps {
  result: PredictionResult;
  onReset: () => void;
}

const ResultsDisplay = ({ result, onReset }: ResultsDisplayProps) => {
  const getStatusConfig = () => {
    if (result.disorder === "None") {
      return {
        icon: CheckCircle2,
        color: "text-secondary",
        bgColor: "bg-secondary/10",
        borderColor: "border-secondary/30",
        badgeVariant: "secondary" as const,
        title: "No Sleep Disorder Detected",
        subtitle: "Your sleep health indicators are within normal range",
      };
    } else if (result.confidence > 70) {
      return {
        icon: AlertTriangle,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        badgeVariant: "destructive" as const,
        title: `${result.disorder} Detected`,
        subtitle: "Moderate confidence - Consider consulting a specialist",
      };
    } else {
      return {
        icon: XCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/30",
        badgeVariant: "destructive" as const,
        title: `Possible ${result.disorder}`,
        subtitle: "Lower confidence - Further evaluation recommended",
      };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Main Result Card */}
      <Card variant="glass" className={`border-2 ${config.borderColor}`}>
        <CardHeader className="text-center pb-4">
          <div className={`w-20 h-20 mx-auto rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
            <StatusIcon className={`w-10 h-10 ${config.color}`} />
          </div>
          <CardTitle className="text-2xl md:text-3xl">{config.title}</CardTitle>
          <CardDescription className="text-base">{config.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <Badge variant={config.badgeVariant} className="text-sm px-4 py-1">
                {result.disorder}
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-1">
                {result.confidence}% Confidence
              </Badge>
            </div>

            {/* Confidence Bar */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Confidence Level</span>
                <span>{result.confidence}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full medical-gradient transition-all duration-1000 rounded-full"
                  style={{ width: `${result.confidence}%` }}
                />
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
          <ul className="space-y-3">
            {result.recommendations.map((rec, index) => (
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
                <span className="text-sm text-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="medical" size="lg" className="flex-1" onClick={onReset}>
          <RefreshCw className="w-4 h-4" />
          New Analysis
        </Button>
        <Button variant="outline" size="lg" className="flex-1">
          <Download className="w-4 h-4" />
          Download Report
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
