import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFeeCategorySchema, insertFeeStructureSchema, type FeeCategory, type FeeStructure, type Class, type AcademicSession } from "@shared/schema";
import { z } from "zod";
import { Plus, Pencil, Trash2, DollarSign, Tag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const feeCategoryFormSchema = insertFeeCategorySchema;
const feeStructureFormSchema = insertFeeStructureSchema.extend({
  amount: z.string().min(1, "Amount is required"),
});

export default function FeeManagement() {
  const { toast } = useToast();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [structureDialogOpen, setStructureDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FeeCategory | null>(null);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery<FeeCategory[]>({
    queryKey: ['/api/fee-categories'],
  });

  const { data: structures, isLoading: structuresLoading } = useQuery<FeeStructure[]>({
    queryKey: ['/api/fee-structures'],
  });

  const { data: classes } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
  });

  const { data: sessions } = useQuery<AcademicSession[]>({
    queryKey: ['/api/academic-sessions'],
  });

  const categoryForm = useForm<z.infer<typeof feeCategoryFormSchema>>({
    resolver: zodResolver(feeCategoryFormSchema),
    defaultValues: { name: "", description: "" },
  });

  const resetCategoryForm = () => categoryForm.reset({ name: "", description: "" });

  const structureForm = useForm<z.infer<typeof feeStructureFormSchema>>({
    resolver: zodResolver(feeStructureFormSchema),
    defaultValues: {
      name: "",
      classId: "",
      academicSessionId: "",
      feeCategoryId: "",
      amount: "",
      dueDate: "",
      isRecurring: false,
    },
  });

  const resetStructureForm = () => structureForm.reset({
    name: "",
    classId: "",
    academicSessionId: "",
    feeCategoryId: "",
    amount: "",
    dueDate: "",
    isRecurring: false,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: z.infer<typeof feeCategoryFormSchema>) => apiRequest("/api/fee-categories", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fee-categories'] });
      toast({ title: "Success", description: "Fee category created successfully" });
      setCategoryDialogOpen(false);
      resetCategoryForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create fee category", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<z.infer<typeof feeCategoryFormSchema>> }) =>
      apiRequest(`/api/fee-categories/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fee-categories'] });
      toast({ title: "Success", description: "Fee category updated successfully" });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      resetCategoryForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update fee category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/fee-categories/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fee-categories'] });
      toast({ title: "Success", description: "Fee category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete fee category", variant: "destructive" });
    },
  });

  const createStructureMutation = useMutation({
    mutationFn: (data: z.infer<typeof feeStructureFormSchema>) => apiRequest("/api/fee-structures", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fee-structures'] });
      toast({ title: "Success", description: "Fee structure created successfully" });
      setStructureDialogOpen(false);
      resetStructureForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create fee structure", variant: "destructive" });
    },
  });

  const updateStructureMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<z.infer<typeof feeStructureFormSchema>> }) =>
      apiRequest(`/api/fee-structures/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fee-structures'] });
      toast({ title: "Success", description: "Fee structure updated successfully" });
      setStructureDialogOpen(false);
      setEditingStructure(null);
      resetStructureForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update fee structure", variant: "destructive" });
    },
  });

  const deleteStructureMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/fee-structures/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fee-structures'] });
      toast({ title: "Success", description: "Fee structure deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete fee structure", variant: "destructive" });
    },
  });

  const onCategorySubmit = (data: z.infer<typeof feeCategoryFormSchema>) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const onStructureSubmit = (data: z.infer<typeof feeStructureFormSchema>) => {
    if (editingStructure) {
      updateStructureMutation.mutate({ id: editingStructure.id, data });
    } else {
      createStructureMutation.mutate(data);
    }
  };

  const handleEditCategory = (category: FeeCategory) => {
    setEditingCategory(category);
    categoryForm.reset({ name: category.name, description: category.description ?? "" });
    setCategoryDialogOpen(true);
  };

  const handleEditStructure = (structure: FeeStructure) => {
    setEditingStructure(structure);
    structureForm.reset({
      name: structure.name,
      classId: structure.classId ?? "",
      academicSessionId: structure.academicSessionId ?? "",
      feeCategoryId: structure.feeCategoryId ?? "",
      amount: structure.amount,
      dueDate: structure.dueDate ?? "",
      isRecurring: structure.isRecurring ?? false,
    });
    setStructureDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setEditingCategory(null);
    resetCategoryForm();
  };

  const handleCloseStructureDialog = () => {
    setStructureDialogOpen(false);
    setEditingStructure(null);
    resetStructureForm();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground">Manage fee categories and structures</p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList>
          <TabsTrigger value="categories" data-testid="tab-categories">
            <Tag className="mr-2 h-4 w-4" />
            Fee Categories
          </TabsTrigger>
          <TabsTrigger value="structures" data-testid="tab-structures">
            <DollarSign className="mr-2 h-4 w-4" />
            Fee Structures
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fee Categories</CardTitle>
                <CardDescription>Define fee types like tuition, admission, exam fees, etc.</CardDescription>
              </div>
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingCategory(null); resetCategoryForm(); }} data-testid="button-add-category">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "Edit Fee Category" : "Create Fee Category"}</DialogTitle>
                    <DialogDescription>
                      {editingCategory ? "Update the fee category details." : "Add a new fee category to the system."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Tuition Fee" {...field} data-testid="input-category-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Optional description" {...field} value={field.value ?? ""} data-testid="input-category-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCloseCategoryDialog} data-testid="button-cancel-category">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending} data-testid="button-save-category">
                          {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {editingCategory ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : categories && categories.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                        <TableCell className="font-medium" data-testid={`text-category-name-${category.id}`}>{category.name}</TableCell>
                        <TableCell data-testid={`text-category-description-${category.id}`}>{category.description || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditCategory(category)} data-testid={`button-edit-category-${category.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this category?")) {
                                deleteCategoryMutation.mutate(category.id);
                              }
                            }}
                            data-testid={`button-delete-category-${category.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No fee categories found. Create one to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structures">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fee Structures</CardTitle>
                <CardDescription>Configure fee amounts for classes and categories</CardDescription>
              </div>
              <Dialog open={structureDialogOpen} onOpenChange={setStructureDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingStructure(null); resetStructureForm(); }} data-testid="button-add-structure">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Structure
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingStructure ? "Edit Fee Structure" : "Create Fee Structure"}</DialogTitle>
                    <DialogDescription>
                      {editingStructure ? "Update the fee structure details." : "Add a new fee structure to the system."}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...structureForm}>
                    <form onSubmit={structureForm.handleSubmit(onStructureSubmit)} className="space-y-4">
                      <FormField
                        control={structureForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Grade 10 Tuition Fee" {...field} data-testid="input-structure-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={structureForm.control}
                          name="classId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Class</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-structure-class">
                                    <SelectValue placeholder="Select class" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {classes?.map((cls) => (
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
                          control={structureForm.control}
                          name="academicSessionId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Academic Session</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-structure-session">
                                    <SelectValue placeholder="Select session" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {sessions?.map((session) => (
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
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={structureForm.control}
                          name="feeCategoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fee Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-structure-category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories?.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={structureForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-structure-amount" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={structureForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value ?? ""} data-testid="input-structure-duedate" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={structureForm.control}
                        name="isRecurring"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value ?? false}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-structure-recurring"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Recurring Fee</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCloseStructureDialog} data-testid="button-cancel-structure">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createStructureMutation.isPending || updateStructureMutation.isPending} data-testid="button-save-structure">
                          {(createStructureMutation.isPending || updateStructureMutation.isPending) && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {editingStructure ? "Update" : "Create"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {structuresLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : structures && structures.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Recurring</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {structures.map((structure) => (
                      <TableRow key={structure.id} data-testid={`row-structure-${structure.id}`}>
                        <TableCell className="font-medium" data-testid={`text-structure-name-${structure.id}`}>{structure.name}</TableCell>
                        <TableCell data-testid={`text-structure-amount-${structure.id}`}>${structure.amount}</TableCell>
                        <TableCell data-testid={`text-structure-duedate-${structure.id}`}>{structure.dueDate || "-"}</TableCell>
                        <TableCell>
                          {structure.isRecurring ? (
                            <Badge variant="secondary">Recurring</Badge>
                          ) : (
                            <Badge variant="outline">One-time</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditStructure(structure)} data-testid={`button-edit-structure-${structure.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this fee structure?")) {
                                deleteStructureMutation.mutate(structure.id);
                              }
                            }}
                            data-testid={`button-delete-structure-${structure.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No fee structures found. Create one to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
