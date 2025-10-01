import AppSidebar from '../AppSidebar';
import { SidebarProvider } from "@/components/ui/sidebar";

//TODO: remove mock functionality
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  avatar: undefined,
};

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role="admin" user={mockUser} />
        <main className="flex-1 p-6">
          <p className="text-muted-foreground">Main content area</p>
        </main>
      </div>
    </SidebarProvider>
  );
}
