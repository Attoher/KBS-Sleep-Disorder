import { Card, CardContent } from "./ui/card";
import { Brain, Shield, Clock, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze your sleep patterns",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your health data is processed securely and never stored",
  },
  {
    icon: Clock,
    title: "Instant Results",
    description: "Get predictions in seconds with detailed recommendations",
  },
  {
    icon: BarChart3,
    title: "Evidence-Based",
    description: "Built on clinical research and validated datasets",
  },
];

const FeatureCards = () => {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          <span className="text-gradient text-glow-white">Why Choose</span> SleepHealth?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trusted by healthcare professionals for accurate sleep disorder predictions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card
            key={feature.title}
            variant="glass"
            className="hover-lift cursor-pointer group animate-fade-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl medical-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;
