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
import { Textarea } from "@/components/ui/textarea";
import { insertAttendanceSchema, type Attendance, type User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Calendar, Loader2, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: attendance = [], isLoading } = useQuery<Attendance[]>({
    queryKey: ['/api/attendance', selectedDate],
    enabled: !!user,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: !!user,
  });

  const form = useForm({
    resolver: zodResolver(insertAttendanceSchema.extend({
      userId: z.string().min(1, "User is required"),
      date: z.string().min(1, "Date is required"),
      status: z.string().min(1, "Status is required"),
    })),
    defaultValues: {
      userId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      remarks: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertAttendanceSchema>) => {
      const res = await apiRequest('POST', '/api/attendance', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      toast({ title: "Success", description: "Attendance marked successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to mark attendance", variant: "destructive" });
    },
  });

  const bulkMarkMutation = useMutation({
    mutationFn: async ({ userIds, status, date }: { userIds: string[]; status: string; date: string }) => {
      const promises = userIds.map(userId =>
        apiRequest('POST', '/api/attendance', { userId, date, status, remarks: '' })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      toast({ title: "Success", description: "Bulk attendance marked successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to mark bulk attendance", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof insertAttendanceSchema>) => {
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

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Unknown';
    const u = users.find(usr => usr.id === userId);
    return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Unknown';
  };

  const getUserAvatar = (userId: string | null) => {
    if (!userId) return undefined;
    const u = users.find(usr => usr.id === userId);
    return u?.profileImageUrl || undefined;
  };

  const statusIcons = {
    present: <CheckCircle className="w-4 h-4 text-green-500" />,
    absent: <XCircle className="w-4 h-4 text-red-500" />,
    late: <Clock className="w-4 h-4 text-yellow-500" />,
    holiday: <Calendar className="w-4 h-4 text-blue-500" />,
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    present: "default",
    absent: "destructive",
    late: "secondary",
    holiday: "outline",
  };

  const students = users.filter(u => u.role === 'student');
  const markedUserIds = new Set(attendance.map(a => a.userId));
  const unmarkedStudents = students.filter(s => !markedUserIds.has(s.id));

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role={userRole} user={userData} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-semibold">Attendance Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-6xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Mark Attendance</h2>
                    <p className="text-sm text-muted-foreground">Track student attendance</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-auto"
                      data-testid="input-filter-date"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {unmarkedStudents.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => bulkMarkMutation.mutate({
                        userIds: unmarkedStudents.map(s => s.id),
                        status: 'present',
                        date: selectedDate
                      })}
                      disabled={bulkMarkMutation.isPending}
                      data-testid="button-mark-all-present"
                    >
                      {bulkMarkMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Mark All Present
                    </Button>
                  )}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-attendance">
                        <Plus className="w-4 h-4 mr-2" />
                        Mark Attendance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Mark Attendance</DialogTitle>
                        <DialogDescription>
                          Record attendance for a student
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Student *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-user">
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
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-status">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="late">Late</SelectItem>
                                    <SelectItem value="holiday">Holiday</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Remarks</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Optional notes" {...field} value={field.value || ''} data-testid="input-remarks" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-attendance">
                              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Mark Attendance
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
                    <CardDescription>
                      {attendance.length} record{attendance.length !== 1 ? 's' : ''} marked
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {attendance.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No attendance records for this date
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Remarks</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendance.map((record) => (
                            <TableRow key={record.id} data-testid={`row-attendance-${record.id}`}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={getUserAvatar(record.userId)} />
                                    <AvatarFallback>
                                      {getUserName(record.userId).substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{getUserName(record.userId)}</span>
                                </div>
                              </TableCell>
                              <TableCell>{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={statusColors[record.status] || "outline"} className="flex items-center gap-1 w-fit">
                                  {statusIcons[record.status as keyof typeof statusIcons]}
                                  {record.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{record.remarks || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
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
