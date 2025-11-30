import { useState, useEffect } from "react";
import WaveBackground from "@/components/WaveBackground";
import LoadingScreen from "@/components/LoadingScreen";
import PredictionForm, { PredictionResult } from "@/components/PredictionForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import FeatureCards from "@/components/FeatureCards";
import { Activity, Moon, Heart } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handlePrediction = (result: PredictionResult) => {
    setPrediction(result);
  };

  const handleReset = () => {
    setPrediction(null);
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen relative">
      <WaveBackground />

      <main className="relative z-10 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-12 animate-fade-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Moon className="w-8 h-8 text-secondary animate-float" />
              <Activity className="w-10 h-10 text-primary" />
              <Heart className="w-8 h-8 text-destructive animate-float animation-delay-200" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-foreground">Sleep Disorder</span>
              <br />
              <span className="text-gradient text-glow-white">Prediction System</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Advanced AI-powered analysis for healthcare professionals to predict
              and prevent sleep disorders with clinical precision.
            </p>
          </section>

          {/* Main Content */}
          <section className="max-w-4xl mx-auto">
            {prediction ? (
              <ResultsDisplay result={prediction} onReset={handleReset} />
            ) : (
              <PredictionForm onPredict={handlePrediction} />
            )}
          </section>

          {/* Feature Cards */}
          {!prediction && <FeatureCards />}

          {/* Footer */}
          <footer className="mt-20 text-center">
            <div className="glass-card rounded-2xl p-6 max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Medical Disclaimer:</strong> This
                tool is designed to assist healthcare professionals and should not be
                used as a substitute for clinical judgment. Always refer patients to
                qualified sleep specialists for definitive diagnosis.
              </p>
            </div>

            <p className="text-xs text-muted-foreground mt-8">
              © 2024 SleepHealth. Built for healthcare excellence.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
