import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
}

export default function QuickActions({ title = "Quick Actions", actions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={action.onClick}
              data-testid={`quick-action-${idx}`}
            >
              <action.icon className="w-6 h-6" />
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
