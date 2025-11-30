import { useEffect, useState } from "react";
import { Moon, Heart, Activity } from "lucide-react";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onLoadingComplete, 400);
          }, 200);
          return 100;
        }
        return prev + Math.random() * 25 + 10;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-secondary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl animate-pulse animation-delay-500" />
      </div>

      {/* Logo & Icons */}
      <div className="relative mb-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Moon className="w-10 h-10 text-secondary animate-float" />
          <div className="w-20 h-20 rounded-2xl medical-gradient flex items-center justify-center shadow-elevated">
            <Activity className="w-10 h-10 text-primary-foreground" />
          </div>
          <Heart className="w-10 h-10 text-primary animate-float animation-delay-200" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
          <span className="text-gradient">SleepHealth</span>
        </h1>
        <p className="text-muted-foreground text-center text-sm md:text-base">
          Sleep Disorder Prediction System
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-64 md:w-80">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full medical-gradient transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-3">
          Loading... {Math.min(Math.round(progress), 100)}%
        </p>
      </div>

      {/* Loading Message */}
      <p className="text-xs text-muted-foreground mt-8 animate-pulse">
        Preparing your health analysis tools
      </p>
    </div>
  );
};

export default LoadingScreen;
