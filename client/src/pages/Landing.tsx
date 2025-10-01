import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Calendar, FileText, CreditCard, Globe } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Landing() {
  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student information system with enrollment tracking",
    },
    {
      icon: Calendar,
      title: "Attendance Tracking",
      description: "Digital attendance system for students and staff",
    },
    {
      icon: FileText,
      title: "Academic Management",
      description: "Classes, subjects, exams, and grading system",
    },
    {
      icon: CreditCard,
      title: "Fee Management",
      description: "Complete financial management with invoicing",
    },
    {
      icon: Globe,
      title: "Multi-language",
      description: "Support for English, Bengali, and Arabic",
    },
    {
      icon: GraduationCap,
      title: "Result Processing",
      description: "Automated result calculation and report cards",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg">EduPro</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">Login</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl font-display font-bold mb-6">
            Complete Education Management System
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            A comprehensive solution for schools and educational institutions to manage students, 
            staff, academics, and finances - all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-get-started">
              <a href="/api/login">Get Started</a>
            </Button>
            <Button size="lg" variant="outline" data-testid="button-learn-more">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-display font-bold mb-4">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of educational institutions using EduPro to streamline their operations.
          </p>
          <Button size="lg" asChild data-testid="button-cta-login">
            <a href="/api/login">Start Free Trial</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 EduPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
