import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (Required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (Required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"), // superadmin, admin, teacher, student, guardian, accountant, hostel_manager
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Institution settings
export const institutions = pgTable("institutions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  logo: varchar("logo"),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  website: varchar("website"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic sessions/years
export const academicSessions = pgTable("academic_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isCurrent: boolean("is_current").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Classes/Grades
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  academicSessionId: varchar("academic_session_id").references(() => academicSessions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sections within classes
export const sections = pgTable("sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  classId: varchar("class_id").references(() => classes.id),
  capacity: integer("capacity"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subjects
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  code: varchar("code"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student enrollments
export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id),
  classId: varchar("class_id").references(() => classes.id),
  sectionId: varchar("section_id").references(() => sections.id),
  academicSessionId: varchar("academic_session_id").references(() => academicSessions.id),
  enrollmentDate: date("enrollment_date").notNull(),
  status: varchar("status").default("active"), // active, transferred, graduated, dropped
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance records
export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  date: date("date").notNull(),
  status: varchar("status").notNull(), // present, absent, late, holiday
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").default("info"), // info, warning, success
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Institution = typeof institutions.$inferSelect;
export type AcademicSession = typeof academicSessions.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Insert schemas for validation
export const insertInstitutionSchema = createInsertSchema(institutions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAcademicSessionSchema = createInsertSchema(academicSessions).omit({ id: true, createdAt: true });
export const insertClassSchema = createInsertSchema(classes).omit({ id: true, createdAt: true });
export const insertSectionSchema = createInsertSchema(sections).omit({ id: true, createdAt: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true, createdAt: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, createdAt: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
