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
import { insertPaymentSchema, insertStudentFeeSchema, type StudentFee, type Payment, type User, type FeeStructure } from "@shared/schema";
import { z } from "zod";
import { Plus, Receipt, DollarSign, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const paymentFormSchema = insertPaymentSchema.extend({
  amount: z.string().min(1, "Amount is required"),
});

const studentFeeFormSchema = insertStudentFeeSchema.extend({
  amount: z.string().min(1, "Amount is required"),
  discountAmount: z.string().optional(),
  finalAmount: z.string().min(1, "Final amount is required"),
});

type StudentFeeWithDetails = StudentFee & {
  student?: User;
  feeStructure?: FeeStructure;
};

export default function FeeCollection() {
  const { toast } = useToast();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [waiverDialogOpen, setWaiverDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<StudentFeeWithDetails | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const { data: studentFees, isLoading: feesLoading } = useQuery<StudentFee[]>({
    queryKey: ['/api/student-fees'],
  });

  const { data: students } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: feeStructures } = useQuery<FeeStructure[]>({
    queryKey: ['/api/fee-structures'],
  });

  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      studentFeeId: "",
      studentId: "",
      amount: "",
      paymentMethod: "cash",
      transactionId: "",
      paymentDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const waiverForm = useForm<z.infer<typeof studentFeeFormSchema>>({
    resolver: zodResolver(studentFeeFormSchema),
    defaultValues: {
      studentId: "",
      feeStructureId: "",
      amount: "",
      discountAmount: "0",
      waiverReason: "",
      finalAmount: "",
      status: "pending",
      dueDate: "",
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: z.infer<typeof paymentFormSchema>) => apiRequest("/api/payments", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/student-fees'] });
      toast({ title: "Success", description: "Payment recorded successfully" });
      setPaymentDialogOpen(false);
      setSelectedFee(null);
      paymentForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record payment", variant: "destructive" });
    },
  });

  const updateStudentFeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<z.infer<typeof studentFeeFormSchema>> }) =>
      apiRequest(`/api/student-fees/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-fees'] });
      toast({ title: "Success", description: "Fee updated successfully" });
      setWaiverDialogOpen(false);
      setSelectedFee(null);
      waiverForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update fee", variant: "destructive" });
    },
  });

  const onPaymentSubmit = (data: z.infer<typeof paymentFormSchema>) => {
    createPaymentMutation.mutate(data);
  };

  const onWaiverSubmit = (data: z.infer<typeof studentFeeFormSchema>) => {
    if (selectedFee) {
      const finalAmount = parseFloat(data.amount) - parseFloat(data.discountAmount || "0");
      updateStudentFeeMutation.mutate({
        id: selectedFee.id,
        data: {
          ...data,
          finalAmount: finalAmount.toString(),
        },
      });
    }
  };

  const handleCollectPayment = (fee: StudentFee) => {
    setSelectedFee(fee);
    const remaining = parseFloat(fee.finalAmount || "0") - parseFloat(fee.paidAmount || "0");
    paymentForm.reset({
      studentFeeId: fee.id,
      studentId: fee.studentId ?? "",
      amount: remaining.toString(),
      paymentMethod: "cash",
      transactionId: "",
      paymentDate: new Date().toISOString().split('T')[0],
      notes: "",
    });
    setPaymentDialogOpen(true);
  };

  const handleApplyWaiver = (fee: StudentFee) => {
    setSelectedFee(fee);
    waiverForm.reset({
      studentId: fee.studentId ?? "",
      feeStructureId: fee.feeStructureId ?? "",
      amount: fee.amount,
      discountAmount: fee.discountAmount ?? "0",
      waiverReason: fee.waiverReason ?? "",
      finalAmount: fee.finalAmount,
      status: fee.status ?? "pending",
      dueDate: fee.dueDate ?? "",
    });
    setWaiverDialogOpen(true);
  };

  const handlePrintReceipt = (fee: StudentFee) => {
    setSelectedFee(fee);
    setReceiptDialogOpen(true);
  };

  const generateReceiptPDF = () => {
    if (!selectedFee) return;

    const receiptContent = `
=================================
       PAYMENT RECEIPT
=================================

Student ID: ${selectedFee.studentId}
Fee ID: ${selectedFee.id}
Amount: $${selectedFee.finalAmount}
Paid Amount: $${selectedFee.paidAmount}
Status: ${selectedFee.status}
Date: ${new Date().toLocaleDateString()}

=================================
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${selectedFee.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Success", description: "Receipt downloaded successfully" });
  };

  const filteredFees = selectedStudentId
    ? studentFees?.filter((fee) => fee.studentId === selectedStudentId)
    : studentFees;

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      paid: { variant: "default", label: "Paid" },
      partial: { variant: "secondary", label: "Partial" },
      pending: { variant: "outline", label: "Pending" },
      waived: { variant: "destructive", label: "Waived" },
    };
    const s = statusMap[status || "pending"];
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Collection</h1>
          <p className="text-muted-foreground">Collect fees, apply waivers, and generate receipts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Student Fees</CardTitle>
              <CardDescription>View and manage student fee payments</CardDescription>
            </div>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger className="w-[250px]" data-testid="select-filter-student">
                <SelectValue placeholder="Filter by student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Students</SelectItem>
                {students
                  ?.filter((s) => s.role === "student")
                  .map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {feesLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredFees && filteredFees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.map((fee) => {
                  const balance = parseFloat(fee.finalAmount || "0") - parseFloat(fee.paidAmount || "0");
                  return (
                    <TableRow key={fee.id} data-testid={`row-fee-${fee.id}`}>
                      <TableCell className="font-medium" data-testid={`text-fee-student-${fee.id}`}>
                        {students?.find((s) => s.id === fee.studentId)?.firstName || "Unknown"}
                      </TableCell>
                      <TableCell data-testid={`text-fee-amount-${fee.id}`}>${fee.finalAmount}</TableCell>
                      <TableCell data-testid={`text-fee-paid-${fee.id}`}>${fee.paidAmount}</TableCell>
                      <TableCell data-testid={`text-fee-balance-${fee.id}`}>${balance.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleCollectPayment(fee)}
                          disabled={fee.status === "paid" || fee.status === "waived"}
                          data-testid={`button-collect-${fee.id}`}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Collect
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleApplyWaiver(fee)} data-testid={`button-waiver-${fee.id}`}>
                          Waiver
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePrintReceipt(fee)} data-testid={`button-receipt-${fee.id}`}>
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No student fees found. Assign fees to students to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a payment for the selected fee. Supports partial payments.</DialogDescription>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={paymentForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-payment-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={paymentForm.control}
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
                          <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={paymentForm.control}
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} value={field.value ?? ""} data-testid="input-transaction-id" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={paymentForm.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ""} data-testid="input-payment-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={paymentForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Optional notes" {...field} value={field.value ?? ""} data-testid="input-payment-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)} data-testid="button-cancel-payment">
                  Cancel
                </Button>
                <Button type="submit" disabled={createPaymentMutation.isPending} data-testid="button-submit-payment">
                  {createPaymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Record Payment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={waiverDialogOpen} onOpenChange={setWaiverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Fee Waiver/Discount</DialogTitle>
            <DialogDescription>Apply a discount or complete waiver to the selected fee.</DialogDescription>
          </DialogHeader>
          <Form {...waiverForm}>
            <form onSubmit={waiverForm.handleSubmit(onWaiverSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={waiverForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} disabled data-testid="input-waiver-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={waiverForm.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ""} data-testid="input-discount-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={waiverForm.control}
                name="waiverReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waiver Reason</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Reason for discount/waiver" {...field} value={field.value ?? ""} data-testid="input-waiver-reason" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setWaiverDialogOpen(false)} data-testid="button-cancel-waiver">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateStudentFeeMutation.isPending} data-testid="button-submit-waiver">
                  {updateStudentFeeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Apply Waiver
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>View and download the payment receipt</DialogDescription>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Student ID:</span>
                <span>{selectedFee.studentId}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Fee Amount:</span>
                <span>${selectedFee.finalAmount}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Paid Amount:</span>
                <span className="text-green-600">${selectedFee.paidAmount}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Balance:</span>
                <span className="text-orange-600">
                  ${(parseFloat(selectedFee.finalAmount || "0") - parseFloat(selectedFee.paidAmount || "0")).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-medium">Status:</span>
                <span>{getStatusBadge(selectedFee.status)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)} data-testid="button-close-receipt">
              Close
            </Button>
            <Button onClick={generateReceiptPDF} data-testid="button-download-receipt">
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
