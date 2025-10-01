import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertInstitutionSchema, type Institution } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Building2, Loader2 } from "lucide-react";

export default function InstitutionSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: institution, isLoading } = useQuery<Institution | null>({
    queryKey: ['/api/institution'],
    enabled: !!user,
  });

  const form = useForm({
    resolver: zodResolver(insertInstitutionSchema),
    defaultValues: {
      name: institution?.name || '',
      address: institution?.address || '',
      phone: institution?.phone || '',
      email: institution?.email || '',
      website: institution?.website || '',
      logo: institution?.logo || '',
    },
    values: institution ? {
      name: institution.name,
      address: institution.address || '',
      phone: institution.phone || '',
      email: institution.email || '',
      website: institution.website || '',
      logo: institution.logo || '',
    } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertInstitutionSchema>) => {
      const res = await apiRequest('POST', '/api/institution', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/institution'] });
      toast({ title: "Success", description: "Institution settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save institution settings", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertInstitutionSchema>) => {
      const res = await apiRequest('PATCH', `/api/institution/${institution?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/institution'] });
      toast({ title: "Success", description: "Institution settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update institution settings", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof insertInstitutionSchema>) => {
    if (institution) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
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
              <h1 className="text-2xl font-display font-semibold">Institution Settings</h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <Card className="max-w-3xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  <div>
                    <CardTitle>Institution Information</CardTitle>
                    <CardDescription>
                      Configure your institution's basic information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter institution name" {...field} data-testid="input-institution-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter full address" {...field} data-testid="input-address" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter phone number" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter email address" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} data-testid="input-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="logo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/logo.png" {...field} data-testid="input-logo" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button 
                          type="submit" 
                          disabled={createMutation.isPending || updateMutation.isPending}
                          data-testid="button-save-institution"
                        >
                          {(createMutation.isPending || updateMutation.isPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {institution ? 'Update Settings' : 'Save Settings'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
