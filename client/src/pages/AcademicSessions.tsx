import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertAcademicSessionSchema } from "@shared/schema";
import type { AcademicSession } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Calendar, Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function AcademicSessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: sessions = [], isLoading } = useQuery<AcademicSession[]>({
    queryKey: ['/api/academic-sessions'],
    enabled: !!user,
  });

  const form = useForm({
    resolver: zodResolver(insertAcademicSessionSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertAcademicSessionSchema>) => {
      const res = await apiRequest('POST', '/api/academic-sessions', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic-sessions'] });
      toast({ title: "Success", description: "Academic session created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create academic session", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/academic-sessions/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic-sessions'] });
      toast({ title: "Success", description: "Academic session deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete academic session", variant: "destructive" });
    },
  });

  const setCurrentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/academic-sessions/${id}/set-current`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/academic-sessions'] });
      toast({ title: "Success", description: "Current academic session updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to set current session", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof insertAcademicSessionSchema>) => {
    createMutation.mutate(data);
  };

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

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role={userRole} user={userData} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-semibold">Academic Sessions</h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Academic Year Management</h2>
                  <p className="text-sm text-muted-foreground">Manage academic sessions for your institution</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-session">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Academic Session</DialogTitle>
                      <DialogDescription>
                        Add a new academic year/session for your institution
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 2024-2025" {...field} data-testid="input-session-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-start-date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-end-date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-session">
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Session
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No academic sessions found</p>
                    <p className="text-sm text-muted-foreground mb-4">Create your first academic session to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle>{session.name}</CardTitle>
                              {session.isCurrent && (
                                <Badge variant="default" data-testid={`badge-current-${session.id}`}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Current
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="mt-1">
                              {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {!session.isCurrent && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentMutation.mutate(session.id)}
                                disabled={setCurrentMutation.isPending}
                                data-testid={`button-set-current-${session.id}`}
                              >
                                Set as Current
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMutation.mutate(session.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${session.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
