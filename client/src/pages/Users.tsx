import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users as UsersIcon, Loader2, Shield } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export default function Users() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: !!user,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await apiRequest('PATCH', `/api/users/${id}/role`, { role });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Success", description: "User role updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" });
    },
  });

  const userData = {
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User',
    email: user?.email || '',
    avatar: user?.profileImageUrl || undefined,
  };

  const userRole = (user?.role || 'student') as "admin" | "teacher" | "student" | "guardian";

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const roleColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    superadmin: "destructive",
    admin: "default",
    teacher: "secondary",
    student: "outline",
    guardian: "outline",
    accountant: "secondary",
    hostel_manager: "secondary",
  };

  const roles = [
    { value: "superadmin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "teacher", label: "Teacher" },
    { value: "student", label: "Student" },
    { value: "guardian", label: "Guardian" },
    { value: "accountant", label: "Accountant" },
    { value: "hostel_manager", label: "Hostel Manager" },
  ];

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role={userRole} user={userData} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-semibold">User Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">Manage Users</h2>
                <p className="text-sm text-muted-foreground">View and manage user roles in your institution</p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <UsersIcon className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No users found</p>
                    <p className="text-sm text-muted-foreground mb-4">Users will appear here after they sign up</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>All Users ({users.length})</CardTitle>
                    <CardDescription>Manage user roles and permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={u.profileImageUrl || undefined} />
                                  <AvatarFallback>
                                    {u.firstName?.[0]}{u.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {u.firstName} {u.lastName}
                                  </p>
                                  {u.id === user?.id && (
                                    <Badge variant="outline" className="text-xs mt-1">You</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={roleColors[u.role] || "outline"}>
                                {roles.find(r => r.value === u.role)?.label || u.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <Select
                                value={u.role}
                                onValueChange={(role) => updateRoleMutation.mutate({ id: u.id, role })}
                                disabled={u.id === user?.id}
                              >
                                <SelectTrigger className="w-32" data-testid={`select-role-${u.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
