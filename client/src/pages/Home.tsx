import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import StatCard from "@/components/StatCard";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import ScheduleCard from "@/components/ScheduleCard";
import NotificationPanel from "@/components/NotificationPanel";
import QuickActions from "@/components/QuickActions";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Users, GraduationCap, DollarSign, Calendar, FileText, CreditCard } from "lucide-react";

export default function Home() {
  //TODO: remove mock functionality - replace with actual user data
  const mockUser = {
    name: "Admin User",
    email: "admin@edupro.com",
    avatar: undefined,
  };

  //TODO: remove mock functionality - replace with actual stats
  const stats = [
    { title: "Total Students", value: "1,234", icon: Users, trend: { value: "12% from last month", isPositive: true } },
    { title: "Total Teachers", value: "87", icon: GraduationCap, trend: { value: "3 new this month", isPositive: true } },
    { title: "Revenue", value: "$45,231", icon: DollarSign, trend: { value: "8% from last month", isPositive: true } },
    { title: "Attendance", value: "92%", icon: Calendar, trend: { value: "2% from last week", isPositive: true } },
  ];

  //TODO: remove mock functionality
  const schedule = [
    { period: 1, subject: "Mathematics", time: "8:00 - 8:45", teacher: "Mr. Rahman", room: "101" },
    { period: 2, subject: "English", time: "8:50 - 9:35", teacher: "Ms. Sultana", room: "102", isActive: true },
    { period: 3, subject: "Physics", time: "9:40 - 10:25", teacher: "Mr. Khan", room: "Lab-1" },
  ];

  //TODO: remove mock functionality
  const notifications = [
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
  ];

  //TODO: remove mock functionality
  const attendanceDays = [
    ...Array(5).fill({ date: null, status: null }),
    ...Array(20).fill(null).map((_, i) => ({ 
      date: i + 1, 
      status: ["present", "present", "present", "absent", "late"][Math.floor(Math.random() * 5)] 
    })),
  ];

  //TODO: remove mock functionality
  const quickActions = [
    { label: "Take Attendance", icon: Users, onClick: () => console.log("Take Attendance") },
    { label: "View Schedule", icon: Calendar, onClick: () => console.log("View Schedule") },
    { label: "Submit Report", icon: FileText, onClick: () => console.log("Submit Report") },
    { label: "Fee Collection", icon: CreditCard, onClick: () => console.log("Fee Collection") },
  ];

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role="admin" user={mockUser} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                <AttendanceCalendar 
                  month="January" 
                  year={2025} 
                  days={attendanceDays as any} 
                />
                <ScheduleCard title="Today's Schedule" schedule={schedule} />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <QuickActions actions={quickActions} />
                <NotificationPanel notifications={notifications} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
