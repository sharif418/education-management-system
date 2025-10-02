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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertExpenseCategorySchema, insertExpenseSchema, type ExpenseCategory, type Expense } from "@shared/schema";
import { z } from "zod";
import { Plus, Check, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const expenseCategoryFormSchema = insertExpenseCategorySchema;
const expenseFormSchema = insertExpenseSchema.extend({
  amount: z.string().min(1, "Amount is required"),
});

export default function Expenses() {
  const { toast } = useToast();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery<ExpenseCategory[]>({
    queryKey: ['/api/expense-categories'],
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
  });

  const categoryForm = useForm<z.infer<typeof expenseCategoryFormSchema>>({
    resolver: zodResolver(expenseCategoryFormSchema),
    defaultValues: { name: "", description: "" },
  });

  const expenseForm = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      categoryId: "",
      title: "",
      description: "",
      amount: "",
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: "cash",
      referenceNumber: "",
      status: "pending",
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: z.infer<typeof expenseCategoryFormSchema>) => apiRequest("/api/expense-categories", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expense-categories'] });
      toast({ title: "Success", description: "Expense category created successfully" });
      setCategoryDialogOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create expense category", variant: "destructive" });
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: z.infer<typeof expenseFormSchema>) => apiRequest("/api/expenses", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      toast({ title: "Success", description: "Expense recorded successfully" });
      setExpenseDialogOpen(false);
      expenseForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record expense", variant: "destructive" });
    },
  });

  const approveExpenseMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/expenses/${id}/approve`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      toast({ title: "Success", description: "Expense approved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve expense", variant: "destructive" });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/expenses/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      toast({ title: "Success", description: "Expense deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" });
    },
  });

  const onCategorySubmit = (data: z.infer<typeof expenseCategoryFormSchema>) => {
    createCategoryMutation.mutate(data);
  };

  const onExpenseSubmit = (data: z.infer<typeof expenseFormSchema>) => {
    createExpenseMutation.mutate(data);
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      approved: { variant: "default", label: "Approved" },
      pending: { variant: "secondary", label: "Pending" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const s = statusMap[status || "pending"];
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
          <p className="text-muted-foreground">Track and manage institutional expenses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${expenses?.reduce((sum, exp) => sum + parseFloat(exp.amount || "0"), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses?.filter((e) => e.status === "pending").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Manage expense categories</CardDescription>
          </div>
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => categoryForm.reset()} data-testid="button-add-category">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Expense Category</DialogTitle>
                <DialogDescription>Add a new expense category to organize expenses.</DialogDescription>
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
                          <Input placeholder="e.g., Utilities" {...field} data-testid="input-category-name" />
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
                    <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)} data-testid="button-cancel-category">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCategoryMutation.isPending} data-testid="button-save-category">
                      {createCategoryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create
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
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category.id} variant="secondary" className="text-sm" data-testid={`badge-category-${category.id}`}>
                  {category.name}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">No categories found. Create one to get started.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Record and track institutional expenses</CardDescription>
          </div>
          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => expenseForm.reset()} data-testid="button-add-expense">
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Expense</DialogTitle>
                <DialogDescription>Add a new expense to the system.</DialogDescription>
              </DialogHeader>
              <Form {...expenseForm}>
                <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                  <FormField
                    control={expenseForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Electricity Bill - January" {...field} data-testid="input-expense-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={expenseForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-expense-category">
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
                      control={expenseForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-expense-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={expenseForm.control}
                      name="expenseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expense Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value ?? ""} data-testid="input-expense-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={expenseForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payment-method">
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={expenseForm.control}
                    name="referenceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Optional reference number" {...field} value={field.value ?? ""} data-testid="input-reference-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expenseForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Optional description" {...field} value={field.value ?? ""} data-testid="input-expense-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setExpenseDialogOpen(false)} data-testid="button-cancel-expense">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createExpenseMutation.isPending} data-testid="button-save-expense">
                      {createExpenseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {expensesLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : expenses && expenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                    <TableCell className="font-medium" data-testid={`text-expense-title-${expense.id}`}>
                      {expense.title}
                    </TableCell>
                    <TableCell data-testid={`text-expense-category-${expense.id}`}>
                      {categories?.find((c) => c.id === expense.categoryId)?.name || "-"}
                    </TableCell>
                    <TableCell data-testid={`text-expense-amount-${expense.id}`}>${expense.amount}</TableCell>
                    <TableCell data-testid={`text-expense-date-${expense.id}`}>{expense.expenseDate}</TableCell>
                    <TableCell>{getStatusBadge(expense.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {expense.status === "pending" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => approveExpenseMutation.mutate(expense.id)}
                          data-testid={`button-approve-${expense.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this expense?")) {
                            deleteExpenseMutation.mutate(expense.id);
                          }
                        }}
                        data-testid={`button-delete-${expense.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 text-muted-foreground">No expenses found. Record one to get started.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
