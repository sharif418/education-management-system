import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ClassSchedule {
  period: number;
  subject: string;
  time: string;
  teacher?: string;
  room?: string;
  isActive?: boolean;
}

interface ScheduleCardProps {
  title: string;
  schedule: ClassSchedule[];
}

export default function ScheduleCard({ title, schedule }: ScheduleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.map((item) => (
          <div
            key={item.period}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              item.isActive ? "border-primary bg-primary/5" : "border-border"
            }`}
            data-testid={`schedule-period-${item.period}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant={item.isActive ? "default" : "outline"} className="text-xs">
                  Period {item.period}
                </Badge>
                <h4 className="font-medium">{item.subject}</h4>
              </div>
              {item.teacher && (
                <p className="text-sm text-muted-foreground mt-1">
                  {item.teacher} {item.room && `• Room ${item.room}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {item.time}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
