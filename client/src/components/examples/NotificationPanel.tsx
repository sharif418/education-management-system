import NotificationPanel from '../NotificationPanel';

//TODO: remove mock functionality
const mockNotifications = [
  {
    id: "1",
    type: "info" as const,
    title: "New Assignment Posted",
    message: "Mathematics assignment due on Friday",
    time: "2 hours ago",
    isRead: false,
  },
  {
    id: "2",
    type: "warning" as const,
    title: "Fee Payment Due",
    message: "Monthly fee payment due in 3 days",
    time: "1 day ago",
    isRead: false,
  },
  {
    id: "3",
    type: "success" as const,
    title: "Exam Results Published",
    message: "Your semester results are now available",
    time: "2 days ago",
    isRead: true,
  },
];

export default function NotificationPanelExample() {
  return (
    <div className="p-6">
      <NotificationPanel notifications={mockNotifications} />
    </div>
  );
}
