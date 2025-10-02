import {
  users,
  institutions,
  academicSessions,
  classes,
  sections,
  subjects,
  enrollments,
  attendance,
  notifications,
  feeCategories,
  feeStructures,
  studentFees,
  payments,
  expenseCategories,
  expenses,
  type User,
  type UpsertUser,
  type Institution,
  type AcademicSession,
  type Class,
  type Section,
  type Subject,
  type Enrollment,
  type Attendance,
  type Notification,
  type FeeCategory,
  type FeeStructure,
  type StudentFee,
  type Payment,
  type ExpenseCategory,
  type Expense,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql as drizzleSql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (Required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  // Institution operations
  getInstitution(id: string): Promise<Institution | undefined>;
  getFirstInstitution(): Promise<Institution | undefined>;
  createInstitution(data: typeof institutions.$inferInsert): Promise<Institution>;
  updateInstitution(id: string, data: Partial<typeof institutions.$inferInsert>): Promise<Institution | undefined>;

  // Academic session operations
  getAllAcademicSessions(): Promise<AcademicSession[]>;
  getAcademicSession(id: string): Promise<AcademicSession | undefined>;
  getCurrentAcademicSession(): Promise<AcademicSession | undefined>;
  createAcademicSession(data: typeof academicSessions.$inferInsert): Promise<AcademicSession>;
  updateAcademicSession(id: string, data: Partial<typeof academicSessions.$inferInsert>): Promise<AcademicSession | undefined>;
  deleteAcademicSession(id: string): Promise<void>;
  setCurrentAcademicSession(id: string): Promise<void>;

  // Class operations
  getAllClasses(): Promise<Class[]>;
  getClassesBySession(sessionId: string): Promise<Class[]>;
  getClass(id: string): Promise<Class | undefined>;
  createClass(data: typeof classes.$inferInsert): Promise<Class>;
  updateClass(id: string, data: Partial<typeof classes.$inferInsert>): Promise<Class | undefined>;
  deleteClass(id: string): Promise<void>;

  // Section operations
  getAllSections(): Promise<Section[]>;
  getSectionsByClass(classId: string): Promise<Section[]>;
  getSection(id: string): Promise<Section | undefined>;
  createSection(data: typeof sections.$inferInsert): Promise<Section>;
  updateSection(id: string, data: Partial<typeof sections.$inferInsert>): Promise<Section | undefined>;
  deleteSection(id: string): Promise<void>;

  // Subject operations
  getAllSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(data: typeof subjects.$inferInsert): Promise<Subject>;
  updateSubject(id: string, data: Partial<typeof subjects.$inferInsert>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<void>;

  // Enrollment operations
  getAllEnrollments(): Promise<Enrollment[]>;
  getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]>;
  getEnrollmentsByClass(classId: string): Promise<Enrollment[]>;
  getEnrollment(id: string): Promise<Enrollment | undefined>;
  createEnrollment(data: typeof enrollments.$inferInsert): Promise<Enrollment>;
  updateEnrollment(id: string, data: Partial<typeof enrollments.$inferInsert>): Promise<Enrollment | undefined>;
  deleteEnrollment(id: string): Promise<void>;

  // Attendance operations
  getAllAttendance(): Promise<Attendance[]>;
  getAttendanceByUser(userId: string): Promise<Attendance[]>;
  getAttendanceByDate(date: Date): Promise<Attendance[]>;
  getAttendanceByUserAndDate(userId: string, date: Date): Promise<Attendance | undefined>;
  createAttendance(data: typeof attendance.$inferInsert): Promise<Attendance>;
  updateAttendance(id: string, data: Partial<typeof attendance.$inferInsert>): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<void>;

  // Notification operations
  getAllNotifications(): Promise<Notification[]>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  getUnreadNotificationsByUser(userId: string): Promise<Notification[]>;
  getNotification(id: string): Promise<Notification | undefined>;
  createNotification(data: typeof notifications.$inferInsert): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  deleteNotification(id: string): Promise<void>;

  // Fee category operations
  getAllFeeCategories(): Promise<FeeCategory[]>;
  getFeeCategory(id: string): Promise<FeeCategory | undefined>;
  createFeeCategory(data: typeof feeCategories.$inferInsert): Promise<FeeCategory>;
  updateFeeCategory(id: string, data: Partial<typeof feeCategories.$inferInsert>): Promise<FeeCategory | undefined>;
  deleteFeeCategory(id: string): Promise<void>;

  // Fee structure operations
  getAllFeeStructures(): Promise<FeeStructure[]>;
  getFeeStructuresByClass(classId: string): Promise<FeeStructure[]>;
  getFeeStructuresBySession(sessionId: string): Promise<FeeStructure[]>;
  getFeeStructure(id: string): Promise<FeeStructure | undefined>;
  createFeeStructure(data: typeof feeStructures.$inferInsert): Promise<FeeStructure>;
  updateFeeStructure(id: string, data: Partial<typeof feeStructures.$inferInsert>): Promise<FeeStructure | undefined>;
  deleteFeeStructure(id: string): Promise<void>;

  // Student fee operations
  getAllStudentFees(): Promise<StudentFee[]>;
  getStudentFeesByStudent(studentId: string): Promise<StudentFee[]>;
  getPendingStudentFees(studentId: string): Promise<StudentFee[]>;
  getStudentFee(id: string): Promise<StudentFee | undefined>;
  createStudentFee(data: typeof studentFees.$inferInsert): Promise<StudentFee>;
  updateStudentFee(id: string, data: Partial<typeof studentFees.$inferInsert>): Promise<StudentFee | undefined>;
  deleteStudentFee(id: string): Promise<void>;
  assignFeesToStudents(classId: string, sessionId: string): Promise<void>;

  // Payment operations
  getAllPayments(): Promise<Payment[]>;
  getPaymentsByStudent(studentId: string): Promise<Payment[]>;
  getPaymentsByStudentFee(studentFeeId: string): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(data: typeof payments.$inferInsert): Promise<Payment>;
  updatePayment(id: string, data: Partial<typeof payments.$inferInsert>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<void>;

  // Expense category operations
  getAllExpenseCategories(): Promise<ExpenseCategory[]>;
  getExpenseCategory(id: string): Promise<ExpenseCategory | undefined>;
  createExpenseCategory(data: typeof expenseCategories.$inferInsert): Promise<ExpenseCategory>;
  updateExpenseCategory(id: string, data: Partial<typeof expenseCategories.$inferInsert>): Promise<ExpenseCategory | undefined>;
  deleteExpenseCategory(id: string): Promise<void>;

  // Expense operations
  getAllExpenses(): Promise<Expense[]>;
  getExpensesByCategory(categoryId: string): Promise<Expense[]>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(data: typeof expenses.$inferInsert): Promise<Expense>;
  updateExpense(id: string, data: Partial<typeof expenses.$inferInsert>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<void>;
  approveExpense(id: string, approvedBy: string): Promise<Expense | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Institution operations
  async getInstitution(id: string): Promise<Institution | undefined> {
    const [institution] = await db.select().from(institutions).where(eq(institutions.id, id));
    return institution;
  }

  async getFirstInstitution(): Promise<Institution | undefined> {
    const [institution] = await db.select().from(institutions).limit(1);
    return institution;
  }

  async createInstitution(data: typeof institutions.$inferInsert): Promise<Institution> {
    const [institution] = await db.insert(institutions).values(data).returning();
    return institution;
  }

  async updateInstitution(id: string, data: Partial<typeof institutions.$inferInsert>): Promise<Institution | undefined> {
    const [institution] = await db
      .update(institutions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(institutions.id, id))
      .returning();
    return institution;
  }

  // Academic session operations
  async getAllAcademicSessions(): Promise<AcademicSession[]> {
    return await db.select().from(academicSessions).orderBy(desc(academicSessions.createdAt));
  }

  async getAcademicSession(id: string): Promise<AcademicSession | undefined> {
    const [session] = await db.select().from(academicSessions).where(eq(academicSessions.id, id));
    return session;
  }

  async getCurrentAcademicSession(): Promise<AcademicSession | undefined> {
    const [session] = await db.select().from(academicSessions).where(eq(academicSessions.isCurrent, true));
    return session;
  }

  async createAcademicSession(data: typeof academicSessions.$inferInsert): Promise<AcademicSession> {
    const [session] = await db.insert(academicSessions).values(data).returning();
    return session;
  }

  async updateAcademicSession(id: string, data: Partial<typeof academicSessions.$inferInsert>): Promise<AcademicSession | undefined> {
    const [session] = await db
      .update(academicSessions)
      .set(data)
      .where(eq(academicSessions.id, id))
      .returning();
    return session;
  }

  async deleteAcademicSession(id: string): Promise<void> {
    await db.delete(academicSessions).where(eq(academicSessions.id, id));
  }

  async setCurrentAcademicSession(id: string): Promise<void> {
    await db.update(academicSessions).set({ isCurrent: false });
    await db.update(academicSessions).set({ isCurrent: true }).where(eq(academicSessions.id, id));
  }

  // Class operations
  async getAllClasses(): Promise<Class[]> {
    return await db.select().from(classes).orderBy(desc(classes.createdAt));
  }

  async getClassesBySession(sessionId: string): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.academicSessionId, sessionId));
  }

  async getClass(id: string): Promise<Class | undefined> {
    const [cls] = await db.select().from(classes).where(eq(classes.id, id));
    return cls;
  }

  async createClass(data: typeof classes.$inferInsert): Promise<Class> {
    const [cls] = await db.insert(classes).values(data).returning();
    return cls;
  }

  async updateClass(id: string, data: Partial<typeof classes.$inferInsert>): Promise<Class | undefined> {
    const [cls] = await db
      .update(classes)
      .set(data)
      .where(eq(classes.id, id))
      .returning();
    return cls;
  }

  async deleteClass(id: string): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  // Section operations
  async getAllSections(): Promise<Section[]> {
    return await db.select().from(sections).orderBy(desc(sections.createdAt));
  }

  async getSectionsByClass(classId: string): Promise<Section[]> {
    return await db.select().from(sections).where(eq(sections.classId, classId));
  }

  async getSection(id: string): Promise<Section | undefined> {
    const [section] = await db.select().from(sections).where(eq(sections.id, id));
    return section;
  }

  async createSection(data: typeof sections.$inferInsert): Promise<Section> {
    const [section] = await db.insert(sections).values(data).returning();
    return section;
  }

  async updateSection(id: string, data: Partial<typeof sections.$inferInsert>): Promise<Section | undefined> {
    const [section] = await db
      .update(sections)
      .set(data)
      .where(eq(sections.id, id))
      .returning();
    return section;
  }

  async deleteSection(id: string): Promise<void> {
    await db.delete(sections).where(eq(sections.id, id));
  }

  // Subject operations
  async getAllSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects).orderBy(desc(subjects.createdAt));
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async createSubject(data: typeof subjects.$inferInsert): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(data).returning();
    return subject;
  }

  async updateSubject(id: string, data: Partial<typeof subjects.$inferInsert>): Promise<Subject | undefined> {
    const [subject] = await db
      .update(subjects)
      .set(data)
      .where(eq(subjects.id, id))
      .returning();
    return subject;
  }

  async deleteSubject(id: string): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  // Enrollment operations
  async getAllEnrollments(): Promise<Enrollment[]> {
    return await db.select().from(enrollments).orderBy(desc(enrollments.createdAt));
  }

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
  }

  async getEnrollmentsByClass(classId: string): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.classId, classId));
  }

  async getEnrollment(id: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, id));
    return enrollment;
  }

  async createEnrollment(data: typeof enrollments.$inferInsert): Promise<Enrollment> {
    const [enrollment] = await db.insert(enrollments).values(data).returning();
    return enrollment;
  }

  async updateEnrollment(id: string, data: Partial<typeof enrollments.$inferInsert>): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .update(enrollments)
      .set(data)
      .where(eq(enrollments.id, id))
      .returning();
    return enrollment;
  }

  async deleteEnrollment(id: string): Promise<void> {
    await db.delete(enrollments).where(eq(enrollments.id, id));
  }

  // Attendance operations
  async getAllAttendance(): Promise<Attendance[]> {
    return await db.select().from(attendance).orderBy(desc(attendance.createdAt));
  }

  async getAttendanceByUser(userId: string): Promise<Attendance[]> {
    return await db.select().from(attendance).where(eq(attendance.userId, userId));
  }

  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const dateStr = date.toISOString().split('T')[0];
    return await db.select().from(attendance).where(eq(attendance.date, dateStr));
  }

  async getAttendanceByUserAndDate(userId: string, date: Date): Promise<Attendance | undefined> {
    const dateStr = date.toISOString().split('T')[0];
    const [record] = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.userId, userId), eq(attendance.date, dateStr)));
    return record;
  }

  async createAttendance(data: typeof attendance.$inferInsert): Promise<Attendance> {
    const [record] = await db.insert(attendance).values(data).returning();
    return record;
  }

  async updateAttendance(id: string, data: Partial<typeof attendance.$inferInsert>): Promise<Attendance | undefined> {
    const [record] = await db
      .update(attendance)
      .set(data)
      .where(eq(attendance.id, id))
      .returning();
    return record;
  }

  async deleteAttendance(id: string): Promise<void> {
    await db.delete(attendance).where(eq(attendance.id, id));
  }

  // Notification operations
  async getAllNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt));
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async createNotification(data: typeof notifications.$inferInsert): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  // Fee category operations
  async getAllFeeCategories(): Promise<FeeCategory[]> {
    return await db.select().from(feeCategories).orderBy(desc(feeCategories.createdAt));
  }

  async getFeeCategory(id: string): Promise<FeeCategory | undefined> {
    const [category] = await db.select().from(feeCategories).where(eq(feeCategories.id, id));
    return category;
  }

  async createFeeCategory(data: typeof feeCategories.$inferInsert): Promise<FeeCategory> {
    const [category] = await db.insert(feeCategories).values(data).returning();
    return category;
  }

  async updateFeeCategory(id: string, data: Partial<typeof feeCategories.$inferInsert>): Promise<FeeCategory | undefined> {
    const [category] = await db
      .update(feeCategories)
      .set(data)
      .where(eq(feeCategories.id, id))
      .returning();
    return category;
  }

  async deleteFeeCategory(id: string): Promise<void> {
    await db.delete(feeCategories).where(eq(feeCategories.id, id));
  }

  // Fee structure operations
  async getAllFeeStructures(): Promise<FeeStructure[]> {
    return await db.select().from(feeStructures).orderBy(desc(feeStructures.createdAt));
  }

  async getFeeStructuresByClass(classId: string): Promise<FeeStructure[]> {
    return await db.select().from(feeStructures).where(eq(feeStructures.classId, classId));
  }

  async getFeeStructuresBySession(sessionId: string): Promise<FeeStructure[]> {
    return await db.select().from(feeStructures).where(eq(feeStructures.academicSessionId, sessionId));
  }

  async getFeeStructure(id: string): Promise<FeeStructure | undefined> {
    const [structure] = await db.select().from(feeStructures).where(eq(feeStructures.id, id));
    return structure;
  }

  async createFeeStructure(data: typeof feeStructures.$inferInsert): Promise<FeeStructure> {
    const [structure] = await db.insert(feeStructures).values(data).returning();
    return structure;
  }

  async updateFeeStructure(id: string, data: Partial<typeof feeStructures.$inferInsert>): Promise<FeeStructure | undefined> {
    const [structure] = await db
      .update(feeStructures)
      .set(data)
      .where(eq(feeStructures.id, id))
      .returning();
    return structure;
  }

  async deleteFeeStructure(id: string): Promise<void> {
    await db.delete(feeStructures).where(eq(feeStructures.id, id));
  }

  // Student fee operations
  async getAllStudentFees(): Promise<StudentFee[]> {
    return await db.select().from(studentFees).orderBy(desc(studentFees.createdAt));
  }

  async getStudentFeesByStudent(studentId: string): Promise<StudentFee[]> {
    return await db.select().from(studentFees).where(eq(studentFees.studentId, studentId));
  }

  async getPendingStudentFees(studentId: string): Promise<StudentFee[]> {
    return await db
      .select()
      .from(studentFees)
      .where(
        and(
          eq(studentFees.studentId, studentId),
          drizzleSql`${studentFees.status} IN ('pending', 'partial')`
        )
      );
  }

  async getStudentFee(id: string): Promise<StudentFee | undefined> {
    const [fee] = await db.select().from(studentFees).where(eq(studentFees.id, id));
    return fee;
  }

  async createStudentFee(data: typeof studentFees.$inferInsert): Promise<StudentFee> {
    const [fee] = await db.insert(studentFees).values(data).returning();
    return fee;
  }

  async updateStudentFee(id: string, data: Partial<typeof studentFees.$inferInsert>): Promise<StudentFee | undefined> {
    const [fee] = await db
      .update(studentFees)
      .set(data)
      .where(eq(studentFees.id, id))
      .returning();
    return fee;
  }

  async deleteStudentFee(id: string): Promise<void> {
    await db.delete(studentFees).where(eq(studentFees.id, id));
  }

  async assignFeesToStudents(classId: string, sessionId: string): Promise<void> {
    const classEnrollments = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.classId, classId),
          eq(enrollments.academicSessionId, sessionId),
          eq(enrollments.status, 'active')
        )
      );

    const feeStructs = await db
      .select()
      .from(feeStructures)
      .where(
        and(
          eq(feeStructures.classId, classId),
          eq(feeStructures.academicSessionId, sessionId)
        )
      );

    for (const enrollment of classEnrollments) {
      for (const feeStruct of feeStructs) {
        const [existing] = await db
          .select()
          .from(studentFees)
          .where(
            and(
              eq(studentFees.studentId, enrollment.studentId!),
              eq(studentFees.feeStructureId, feeStruct.id)
            )
          );

        if (!existing) {
          await db.insert(studentFees).values({
            studentId: enrollment.studentId,
            feeStructureId: feeStruct.id,
            amount: feeStruct.amount,
            finalAmount: feeStruct.amount,
            dueDate: feeStruct.dueDate,
            status: 'pending',
          });
        }
      }
    }
  }

  // Payment operations
  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPaymentsByStudent(studentId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.studentId, studentId));
  }

  async getPaymentsByStudentFee(studentFeeId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.studentFeeId, studentFeeId));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async createPayment(data: typeof payments.$inferInsert): Promise<Payment> {
    const [payment] = await db.insert(payments).values(data).returning();

    if (data.studentFeeId) {
      const [studentFee] = await db
        .select()
        .from(studentFees)
        .where(eq(studentFees.id, data.studentFeeId));

      if (studentFee) {
        const allPaymentsForFee = await db
          .select()
          .from(payments)
          .where(eq(payments.studentFeeId, data.studentFeeId));

        const totalPaid = allPaymentsForFee.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

        const finalAmount = parseFloat(studentFee.finalAmount || '0');
        let status = 'pending';
        if (totalPaid >= finalAmount) {
          status = 'paid';
        } else if (totalPaid > 0) {
          status = 'partial';
        }

        await db
          .update(studentFees)
          .set({
            paidAmount: totalPaid.toString(),
            status,
          })
          .where(eq(studentFees.id, data.studentFeeId));
      }
    }

    return payment;
  }

  async updatePayment(id: string, data: Partial<typeof payments.$inferInsert>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    await db.delete(payments).where(eq(payments.id, id));
  }

  // Expense category operations
  async getAllExpenseCategories(): Promise<ExpenseCategory[]> {
    return await db.select().from(expenseCategories).orderBy(desc(expenseCategories.createdAt));
  }

  async getExpenseCategory(id: string): Promise<ExpenseCategory | undefined> {
    const [category] = await db.select().from(expenseCategories).where(eq(expenseCategories.id, id));
    return category;
  }

  async createExpenseCategory(data: typeof expenseCategories.$inferInsert): Promise<ExpenseCategory> {
    const [category] = await db.insert(expenseCategories).values(data).returning();
    return category;
  }

  async updateExpenseCategory(id: string, data: Partial<typeof expenseCategories.$inferInsert>): Promise<ExpenseCategory | undefined> {
    const [category] = await db
      .update(expenseCategories)
      .set(data)
      .where(eq(expenseCategories.id, id))
      .returning();
    return category;
  }

  async deleteExpenseCategory(id: string): Promise<void> {
    await db.delete(expenseCategories).where(eq(expenseCategories.id, id));
  }

  // Expense operations
  async getAllExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.createdAt));
  }

  async getExpensesByCategory(categoryId: string): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.categoryId, categoryId));
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    return await db
      .select()
      .from(expenses)
      .where(
        and(
          drizzleSql`${expenses.expenseDate} >= ${startStr}`,
          drizzleSql`${expenses.expenseDate} <= ${endStr}`
        )
      );
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(data: typeof expenses.$inferInsert): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(data).returning();
    return expense;
  }

  async updateExpense(id: string, data: Partial<typeof expenses.$inferInsert>): Promise<Expense | undefined> {
    const [expense] = await db
      .update(expenses)
      .set(data)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async approveExpense(id: string, approvedBy: string): Promise<Expense | undefined> {
    const [expense] = await db
      .update(expenses)
      .set({
        status: 'approved',
        approvedBy,
      })
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }
}

export const storage = new DatabaseStorage();
