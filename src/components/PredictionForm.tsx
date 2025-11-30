import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Activity, Heart, Moon, Clock, User, Briefcase, Footprints, Brain } from "lucide-react";
import { toast } from "sonner";

interface PredictionFormProps {
  onPredict: (result: PredictionResult) => void;
}

export interface PredictionResult {
  disorder: string;
  confidence: number;
  recommendations: string[];
}

const PredictionForm = ({ onPredict }: PredictionFormProps) => {
  const [formData, setFormData] = useState({
    age: 30,
    gender: "",
    occupation: "",
    sleepDuration: 7,
    qualityOfSleep: 7,
    physicalActivity: 50,
    stressLevel: 5,
    bmiCategory: "",
    bloodPressure: "",
    heartRate: 70,
    dailySteps: 7000,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate prediction logic
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock prediction result based on inputs
    let disorder = "None";
    let confidence = 85;
    const recommendations: string[] = [];

    if (formData.sleepDuration < 6) {
      disorder = "Insomnia";
      confidence = 78;
      recommendations.push("Maintain a consistent sleep schedule");
      recommendations.push("Avoid caffeine and screens before bed");
    } else if (formData.stressLevel > 7 && formData.qualityOfSleep < 5) {
      disorder = "Sleep Apnea";
      confidence = 72;
      recommendations.push("Consider consulting a sleep specialist");
      recommendations.push("Maintain a healthy weight");
    } else if (formData.physicalActivity < 30 && formData.bmiCategory === "overweight") {
      disorder = "Sleep Apnea";
      confidence = 68;
      recommendations.push("Increase daily physical activity");
      recommendations.push("Try sleeping on your side");
    } else {
      recommendations.push("Continue maintaining healthy sleep habits");
      recommendations.push("Regular exercise supports quality sleep");
    }

    onPredict({ disorder, confidence, recommendations });
    toast.success("Analysis complete!", {
      description: "Your sleep health prediction is ready.",
    });
    setIsLoading(false);
  };

  return (
    <Card variant="glass" className="w-full animate-fade-up">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl md:text-3xl flex items-center justify-center gap-3">
          <Brain className="w-7 h-7 text-primary" />
          <span className="text-gradient">Sleep Analysis</span>
        </CardTitle>
        <CardDescription className="text-base">
          Enter your health metrics for an AI-powered sleep disorder prediction
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
                  }
                  min={1}
                  max={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Select
                  value={formData.occupation}
                  onValueChange={(value) =>
                    setFormData({ ...formData, occupation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sleep Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Sleep Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Sleep Duration
                  </Label>
                  <span className="text-sm font-medium text-primary">
                    {formData.sleepDuration} hrs
                  </span>
                </div>
                <Slider
                  value={[formData.sleepDuration]}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sleepDuration: value[0] })
                  }
                  max={12}
                  min={1}
                  step={0.5}
                  className="py-2"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Quality of Sleep</Label>
                  <span className="text-sm font-medium text-primary">
                    {formData.qualityOfSleep}/10
                  </span>
                </div>
                <Slider
                  value={[formData.qualityOfSleep]}
                  onValueChange={(value) =>
                    setFormData({ ...formData, qualityOfSleep: value[0] })
                  }
                  max={10}
                  min={1}
                  step={1}
                  className="py-2"
                />
              </div>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Health Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-secondary" />
                    Physical Activity
                  </Label>
                  <span className="text-sm font-medium text-secondary">
                    {formData.physicalActivity} min/day
                  </span>
                </div>
                <Slider
                  value={[formData.physicalActivity]}
                  onValueChange={(value) =>
                    setFormData({ ...formData, physicalActivity: value[0] })
                  }
                  max={120}
                  min={0}
                  step={5}
                  className="py-2"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Stress Level</Label>
                  <span className="text-sm font-medium text-destructive">
                    {formData.stressLevel}/10
                  </span>
                </div>
                <Slider
                  value={[formData.stressLevel]}
                  onValueChange={(value) =>
                    setFormData({ ...formData, stressLevel: value[0] })
                  }
                  max={10}
                  min={1}
                  step={1}
                  className="py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bmi">BMI Category</Label>
                <Select
                  value={formData.bmiCategory}
                  onValueChange={(value) =>
                    setFormData({ ...formData, bmiCategory: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select BMI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="underweight">Underweight</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="overweight">Overweight</SelectItem>
                    <SelectItem value="obese">Obese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heartRate" className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" />
                  Heart Rate (BPM)
                </Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      heartRate: parseInt(e.target.value) || 0,
                    })
                  }
                  min={40}
                  max={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailySteps" className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-secondary" />
                  Daily Steps
                </Label>
                <Input
                  id="dailySteps"
                  type="number"
                  value={formData.dailySteps}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dailySteps: parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                  max={50000}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="medical"
            size="xl"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Analyze Sleep Health
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PredictionForm;
