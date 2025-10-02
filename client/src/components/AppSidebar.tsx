import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  FileText,
  CreditCard,
  Settings,
  BookOpen,
  Home,
  LogOut,
  DollarSign,
  Receipt,
  TrendingDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AppSidebarProps {
  role: "admin" | "teacher" | "student" | "guardian";
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const menuItems = {
  admin: [
    { title: "Dashboard", icon: LayoutDashboard, url: "/" },
    { title: "Academic Sessions", icon: Calendar, url: "/academic-sessions" },
    { title: "Classes", icon: BookOpen, url: "/classes" },
    { title: "Subjects", icon: BookOpen, url: "/subjects" },
    { title: "Sections", icon: Users, url: "/sections" },
    { title: "Enrollments", icon: GraduationCap, url: "/enrollments" },
    { title: "Users", icon: Users, url: "/users" },
    { title: "Attendance", icon: Calendar, url: "/attendance" },
    { title: "Fee Management", icon: DollarSign, url: "/fee-management" },
    { title: "Fee Collection", icon: Receipt, url: "/fee-collection" },
    { title: "Expenses", icon: TrendingDown, url: "/expenses" },
    { title: "Settings", icon: Settings, url: "/settings" },
  ],
  teacher: [
    { title: "Dashboard", icon: Home, url: "/" },
    { title: "My Classes", icon: BookOpen, url: "/classes" },
    { title: "Attendance", icon: Calendar, url: "/attendance" },
    { title: "Assignments", icon: FileText, url: "/assignments" },
    { title: "Exams", icon: FileText, url: "/exams" },
  ],
  student: [
    { title: "Dashboard", icon: Home, url: "/" },
    { title: "My Classes", icon: BookOpen, url: "/classes" },
    { title: "Attendance", icon: Calendar, url: "/attendance" },
    { title: "Assignments", icon: FileText, url: "/assignments" },
    { title: "Exams", icon: FileText, url: "/exams" },
    { title: "Results", icon: GraduationCap, url: "/results" },
  ],
  guardian: [
    { title: "Dashboard", icon: Home, url: "/" },
    { title: "Children", icon: Users, url: "/children" },
    { title: "Attendance", icon: Calendar, url: "/attendance" },
    { title: "Results", icon: GraduationCap, url: "/results" },
    { title: "Fees", icon: CreditCard, url: "/fees" },
  ],
};

const roleLabels = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
  guardian: "Guardian",
};

export default function AppSidebar({ role, user }: AppSidebarProps) {
  const items = menuItems[role];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display font-semibold">EduPro</h2>
            <p className="text-xs text-muted-foreground">Education System</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-testid={`sidebar-${item.title.toLowerCase()}`}>
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user.name}</p>
            <Badge variant="outline" className="text-xs mt-0.5">
              {roleLabels[role]}
            </Badge>
          </div>
        </div>
        <a
          href="/api/logout"
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent rounded-md transition-colors"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
