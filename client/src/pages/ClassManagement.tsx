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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertClassSchema, type Class, type AcademicSession } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { BookOpen, Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

export default function ClassManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: classes = [], isLoading } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery<AcademicSession[]>({
    queryKey: ['/api/academic-sessions'],
    enabled: !!user,
  });

  const form = useForm({
    resolver: zodResolver(insertClassSchema.extend({
      academicSessionId: z.string().min(1, "Academic session is required")
    })),
    defaultValues: {
      name: '',
      academicSessionId: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertClassSchema>) => {
      const res = await apiRequest('POST', '/api/classes', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      toast({ title: "Success", description: "Class created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create class", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/classes/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      toast({ title: "Success", description: "Class deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete class", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof insertClassSchema>) => {
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

  const getSessionName = (sessionId: string | null) => {
    if (!sessionId) return 'N/A';
    const session = sessions.find(s => s.id === sessionId);
    return session?.name || 'Unknown';
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role={userRole} user={userData} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-semibold">Class Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Manage Classes</h2>
                  <p className="text-sm text-muted-foreground">Create and manage classes for your institution</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-class">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Class</DialogTitle>
                      <DialogDescription>
                        Add a new class/grade to your institution
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Class 1, Grade 9" {...field} data-testid="input-class-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="academicSessionId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Academic Session *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-session">
                                    <SelectValue placeholder="Select session" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {sessions.map((session) => (
                                    <SelectItem key={session.id} value={session.id}>
                                      {session.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-class">
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Class
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
              ) : classes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No classes found</p>
                    <p className="text-sm text-muted-foreground mb-4">Create your first class to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>All Classes</CardTitle>
                    <CardDescription>View and manage all classes in your institution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class Name</TableHead>
                          <TableHead>Academic Session</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classes.map((cls) => (
                          <TableRow key={cls.id} data-testid={`row-class-${cls.id}`}>
                            <TableCell className="font-medium">{cls.name}</TableCell>
                            <TableCell>{getSessionName(cls.academicSessionId)}</TableCell>
                            <TableCell>{cls.createdAt ? new Date(cls.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMutation.mutate(cls.id)}
                                disabled={deleteMutation.isPending}
                                data-testid={`button-delete-${cls.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
