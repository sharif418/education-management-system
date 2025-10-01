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
import { insertEnrollmentSchema, type Enrollment, type User, type Class, type Section, type AcademicSession } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { UserPlus, Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export default function Enrollments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: enrollments = [], isLoading } = useQuery<Enrollment[]>({
    queryKey: ['/api/enrollments'],
    enabled: !!user,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: !!user,
  });

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
    enabled: !!user,
  });

  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ['/api/sections'],
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery<AcademicSession[]>({
    queryKey: ['/api/academic-sessions'],
    enabled: !!user,
  });

  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const students = users.filter(u => u.role === 'student');
  const filteredSections = selectedClassId ? sections.filter(s => s.classId === selectedClassId) : [];

  const form = useForm({
    resolver: zodResolver(insertEnrollmentSchema.extend({
      studentId: z.string().min(1, "Student is required"),
      classId: z.string().min(1, "Class is required"),
      sectionId: z.string().min(1, "Section is required"),
      academicSessionId: z.string().min(1, "Academic session is required"),
      enrollmentDate: z.string().min(1, "Enrollment date is required"),
    })),
    defaultValues: {
      studentId: '',
      classId: '',
      sectionId: '',
      academicSessionId: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertEnrollmentSchema>) => {
      const res = await apiRequest('POST', '/api/enrollments', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
      toast({ title: "Success", description: "Student enrolled successfully" });
      setIsDialogOpen(false);
      form.reset();
      setSelectedClassId('');
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to enroll student", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/enrollments/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
      toast({ title: "Success", description: "Enrollment deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete enrollment", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof insertEnrollmentSchema>) => {
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

  const getStudentName = (studentId: string | null) => {
    if (!studentId) return 'Unknown';
    const student = users.find(u => u.id === studentId);
    return student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : 'Unknown';
  };

  const getStudentAvatar = (studentId: string | null) => {
    if (!studentId) return undefined;
    const student = users.find(u => u.id === studentId);
    return student?.profileImageUrl || undefined;
  };

  const getClassName = (classId: string | null) => {
    if (!classId) return 'N/A';
    const cls = classes.find(c => c.id === classId);
    return cls?.name || 'Unknown';
  };

  const getSectionName = (sectionId: string | null) => {
    if (!sectionId) return 'N/A';
    const section = sections.find(s => s.id === sectionId);
    return section?.name || 'Unknown';
  };

  const getSessionName = (sessionId: string | null) => {
    if (!sessionId) return 'N/A';
    const session = sessions.find(s => s.id === sessionId);
    return session?.name || 'Unknown';
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    transferred: "secondary",
    graduated: "outline",
    dropped: "destructive",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role={userRole} user={userData} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-semibold">Student Enrollments</h1>
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
                  <h2 className="text-lg font-semibold">Manage Enrollments</h2>
                  <p className="text-sm text-muted-foreground">Enroll students to classes and sections</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-enrollment">
                      <Plus className="w-4 h-4 mr-2" />
                      Enroll Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Enroll Student</DialogTitle>
                      <DialogDescription>
                        Enroll a student to a class and section
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="studentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-student">
                                    <SelectValue placeholder="Select student" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {students.map((student) => (
                                    <SelectItem key={student.id} value={student.id}>
                                      {student.firstName} {student.lastName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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

                        <FormField
                          control={form.control}
                          name="classId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class *</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setSelectedClassId(value);
                                  form.setValue('sectionId', '');
                                }} 
                                value={field.value || undefined}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-class">
                                    <SelectValue placeholder="Select class" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                      {cls.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sectionId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || undefined} disabled={!selectedClassId}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-section">
                                    <SelectValue placeholder="Select section" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {filteredSections.map((section) => (
                                    <SelectItem key={section.id} value={section.id}>
                                      {section.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="enrollmentDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Enrollment Date *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid="input-enrollment-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-enrollment">
                            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enroll Student
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
              ) : enrollments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <UserPlus className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No enrollments found</p>
                    <p className="text-sm text-muted-foreground mb-4">Enroll your first student to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>All Enrollments ({enrollments.length})</CardTitle>
                    <CardDescription>Student enrollments across all classes and sections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead>Session</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Enrolled</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enrollment) => (
                          <TableRow key={enrollment.id} data-testid={`row-enrollment-${enrollment.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={getStudentAvatar(enrollment.studentId)} />
                                  <AvatarFallback>
                                    {getStudentName(enrollment.studentId).substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{getStudentName(enrollment.studentId)}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getClassName(enrollment.classId)}</TableCell>
                            <TableCell>{getSectionName(enrollment.sectionId)}</TableCell>
                            <TableCell>{getSessionName(enrollment.academicSessionId)}</TableCell>
                            <TableCell>
                              <Badge variant={statusColors[enrollment.status || 'active'] || "outline"}>
                                {enrollment.status || 'active'}
                              </Badge>
                            </TableCell>
                            <TableCell>{enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMutation.mutate(enrollment.id)}
                                disabled={deleteMutation.isPending}
                                data-testid={`button-delete-${enrollment.id}`}
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
