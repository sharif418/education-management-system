import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, iconColor = "text-primary" }: StatCardProps) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-semibold">{value}</p>
            {trend && (
              <p className={`text-xs mt-2 ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-primary/10 ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
