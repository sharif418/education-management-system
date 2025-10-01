import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AttendanceDay {
  date: number;
  status: "present" | "absent" | "late" | "holiday" | null;
}

interface AttendanceCalendarProps {
  month: string;
  year: number;
  days: AttendanceDay[];
}

const statusColors = {
  present: "bg-green-500",
  absent: "bg-red-500",
  late: "bg-yellow-500",
  holiday: "bg-gray-300 dark:bg-gray-600",
};

export default function AttendanceCalendar({ month, year, days }: AttendanceCalendarProps) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attendance - {month} {year}</span>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Present
            </Badge>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Absent
            </Badge>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              Late
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`aspect-square flex items-center justify-center rounded-md text-sm ${
                day.status
                  ? `${statusColors[day.status]} text-white font-medium`
                  : "bg-muted/30 text-muted-foreground"
              }`}
              data-testid={`attendance-day-${day.date || 'empty'}`}
            >
              {day.date || ""}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
