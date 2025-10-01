import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Info, AlertCircle, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
}

const typeIcons = {
  info: Info,
  warning: AlertCircle,
  success: CheckCircle,
};

const typeColors = {
  info: "text-blue-500",
  warning: "text-yellow-500",
  success: "text-green-500",
};

export default function NotificationPanel({ notifications }: NotificationPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </span>
          {notifications.filter(n => !n.isRead).length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {notifications.filter(n => !n.isRead).length} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {notifications.map((notif) => {
              const Icon = typeIcons[notif.type];
              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border ${
                    !notif.isRead ? "bg-accent/50 border-accent" : "bg-card border-border"
                  }`}
                  data-testid={`notification-${notif.id}`}
                >
                  <div className="flex gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${typeColors[notif.type]}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">{notif.title}</h4>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
