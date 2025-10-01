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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
