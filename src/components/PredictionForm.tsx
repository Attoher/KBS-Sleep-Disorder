import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Activity, Heart, Moon, Clock, User, Footprints, Brain, Database, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "./ui/checkbox";
import { preprocessInput, RawInput } from "../lib/kbs/fact_preprocess";
import { forwardChain, InferenceResult } from "../lib/kbs/inference";
import { Neo4jClient } from "../lib/neo4j/neo4j_client";
import { v4 as uuidv4 } from 'uuid';

interface PredictionFormProps {
  onPredict: (result: InferenceResult) => void;
}

const PredictionForm = ({ onPredict }: PredictionFormProps) => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    sleepDuration: 7,
    qualityOfSleep: 7,
    physicalActivity: 50,
    stressLevel: 5,
    bmiCategory: "",
    heartRate: "",
    dailySteps: "",
    bloodPressure: "", // New field
  });

  const [logNeo4j, setLogNeo4j] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.age || !formData.gender || !formData.bmiCategory || !formData.heartRate || !formData.dailySteps || !formData.bloodPressure) {
      toast.error("Please fill in all fields", {
        description: "All fields are required for accurate prediction.",
      });
      return;
    }

    // Validate BP format
    if (!/^\d+\/\d+$/.test(formData.bloodPressure)) {
      toast.error("Invalid Blood Pressure format", {
        description: "Please use format: systolic/diastolic (e.g., 120/80)",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Prepare Raw Input
      const rawInput: RawInput = {
        age: parseInt(formData.age),
        gender: formData.gender,
        sleepDuration: formData.sleepDuration,
        qualityOfSleep: formData.qualityOfSleep,
        stressLevel: formData.stressLevel,
        physicalActivity: formData.physicalActivity,
        bmiCategory: formData.bmiCategory.charAt(0).toUpperCase() + formData.bmiCategory.slice(1), // Capitalize for rules
        bloodPressure: formData.bloodPressure,
        heartRate: parseInt(formData.heartRate),
        dailySteps: parseInt(formData.dailySteps),
      };

      // 2. Preprocess & Inference
      const facts = preprocessInput(rawInput);
      const result = forwardChain(facts);

      // 3. Neo4j Logging (Optional)
      if (logNeo4j) {
        const personId = `UI_${uuidv4().slice(0, 8)}`;
        const neo4jClient = new Neo4jClient();
        try {
          await neo4jClient.pushCase(personId, rawInput, result.facts, result.firedRules);
          toast.success(`Case logged to Neo4j`, {
            description: `Person ID: ${personId}`,
          });
        } catch (error) {
          console.error("Neo4j Error:", error);
          toast.error("Failed to log to Neo4j", {
            description: "Check console for details. Analysis still displayed.",
          });
        } finally {
          await neo4jClient.close();
        }
      }

      // 4. Return results
      // Simulate small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onPredict(result);
      toast.success("Analysis complete!", {
        description: "Your sleep health prediction is ready.",
      });

    } catch (error) {
      console.error("Prediction Error:", error);
      toast.error("An error occurred during analysis");
    } finally {
      setIsLoading(false);
    }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age <span className="text-destructive">*</span></Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  min={1}
                  max={120}
                  placeholder="Enter your age"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bmi">BMI Category <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.bmiCategory}
                  onValueChange={(value) =>
                    setFormData({ ...formData, bmiCategory: value })
                  }
                  required
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

              {/* NEW: Blood Pressure Field */}
              <div className="space-y-2">
                <Label htmlFor="bloodPressure" className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-destructive" />
                  Blood Pressure <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bloodPressure"
                  type="text"
                  value={formData.bloodPressure}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bloodPressure: e.target.value,
                    })
                  }
                  placeholder="e.g., 120/80"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heartRate" className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-destructive" />
                  Heart Rate (BPM) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      heartRate: e.target.value,
                    })
                  }
                  min={40}
                  max={200}
                  placeholder="e.g., 70"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailySteps" className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-secondary" />
                  Daily Steps <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dailySteps"
                  type="number"
                  value={formData.dailySteps}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dailySteps: e.target.value,
                    })
                  }
                  min={0}
                  max={50000}
                  placeholder="e.g., 7000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Neo4j Logging Option */}
          <div className="flex items-center space-x-3 py-2">
            <Checkbox
              id="logNeo4j"
              checked={logNeo4j}
              onCheckedChange={(checked) => setLogNeo4j(checked as boolean)}
            />
            <Label htmlFor="logNeo4j" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <Database className="w-4 h-4 text-primary" />
              Log This Case to Neo4j
            </Label>
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
