import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import InstitutionSettings from "@/pages/InstitutionSettings";
import AcademicSessions from "@/pages/AcademicSessions";
import ClassManagement from "@/pages/ClassManagement";
import Users from "@/pages/Users";
import Subjects from "@/pages/Subjects";
import Sections from "@/pages/Sections";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/settings" component={InstitutionSettings} />
          <Route path="/academic-sessions" component={AcademicSessions} />
          <Route path="/classes" component={ClassManagement} />
          <Route path="/subjects" component={Subjects} />
          <Route path="/sections" component={Sections} />
          <Route path="/users" component={Users} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
