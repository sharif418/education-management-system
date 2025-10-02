import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertInstitutionSchema,
  insertAcademicSessionSchema,
  insertClassSchema,
  insertSectionSchema,
  insertSubjectSchema,
  insertEnrollmentSchema,
  insertAttendanceSchema,
  insertNotificationSchema,
  insertFeeCategorySchema,
  insertFeeStructureSchema,
  insertStudentFeeSchema,
  insertPaymentSchema,
  insertExpenseCategorySchema,
  insertExpenseSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User management routes
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id/role', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await storage.updateUserRole(id, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Institution routes
  app.get('/api/institution', isAuthenticated, async (req, res) => {
    try {
      const institution = await storage.getFirstInstitution();
      res.json(institution || null);
    } catch (error) {
      console.error("Error fetching institution:", error);
      res.status(500).json({ message: "Failed to fetch institution" });
    }
  });

  app.post('/api/institution', isAuthenticated, async (req, res) => {
    try {
      const data = insertInstitutionSchema.parse(req.body);
      const institution = await storage.createInstitution(data);
      res.json(institution);
    } catch (error) {
      console.error("Error creating institution:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create institution" });
    }
  });

  app.patch('/api/institution/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertInstitutionSchema.partial().parse(req.body);
      const institution = await storage.updateInstitution(id, data);
      if (!institution) {
        return res.status(404).json({ message: "Institution not found" });
      }
      res.json(institution);
    } catch (error) {
      console.error("Error updating institution:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update institution" });
    }
  });

  // Academic session routes
  app.get('/api/academic-sessions', isAuthenticated, async (req, res) => {
    try {
      const sessions = await storage.getAllAcademicSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching academic sessions:", error);
      res.status(500).json({ message: "Failed to fetch academic sessions" });
    }
  });

  app.get('/api/academic-sessions/current', isAuthenticated, async (req, res) => {
    try {
      const session = await storage.getCurrentAcademicSession();
      res.json(session || null);
    } catch (error) {
      console.error("Error fetching current academic session:", error);
      res.status(500).json({ message: "Failed to fetch current academic session" });
    }
  });

  app.post('/api/academic-sessions', isAuthenticated, async (req, res) => {
    try {
      const data = insertAcademicSessionSchema.parse(req.body);
      const session = await storage.createAcademicSession(data);
      res.json(session);
    } catch (error) {
      console.error("Error creating academic session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create academic session" });
    }
  });

  app.patch('/api/academic-sessions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertAcademicSessionSchema.partial().parse(req.body);
      const session = await storage.updateAcademicSession(id, data);
      if (!session) {
        return res.status(404).json({ message: "Academic session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error updating academic session:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update academic session" });
    }
  });

  app.delete('/api/academic-sessions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAcademicSession(id);
      res.json({ message: "Academic session deleted successfully" });
    } catch (error) {
      console.error("Error deleting academic session:", error);
      res.status(500).json({ message: "Failed to delete academic session" });
    }
  });

  app.post('/api/academic-sessions/:id/set-current', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.setCurrentAcademicSession(id);
      res.json({ message: "Current academic session updated successfully" });
    } catch (error) {
      console.error("Error setting current academic session:", error);
      res.status(500).json({ message: "Failed to set current academic session" });
    }
  });

  // Class routes
  app.get('/api/classes', isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.query;
      const classes = sessionId 
        ? await storage.getClassesBySession(sessionId as string)
        : await storage.getAllClasses();
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post('/api/classes', isAuthenticated, async (req, res) => {
    try {
      const data = insertClassSchema.parse(req.body);
      const cls = await storage.createClass(data);
      res.json(cls);
    } catch (error) {
      console.error("Error creating class:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create class" });
    }
  });

  app.patch('/api/classes/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertClassSchema.partial().parse(req.body);
      const cls = await storage.updateClass(id, data);
      if (!cls) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(cls);
    } catch (error) {
      console.error("Error updating class:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update class" });
    }
  });

  app.delete('/api/classes/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClass(id);
      res.json({ message: "Class deleted successfully" });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // Section routes
  app.get('/api/sections', isAuthenticated, async (req, res) => {
    try {
      const { classId } = req.query;
      const sections = classId 
        ? await storage.getSectionsByClass(classId as string)
        : await storage.getAllSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  app.post('/api/sections', isAuthenticated, async (req, res) => {
    try {
      const data = insertSectionSchema.parse(req.body);
      const section = await storage.createSection(data);
      res.json(section);
    } catch (error) {
      console.error("Error creating section:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create section" });
    }
  });

  app.patch('/api/sections/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertSectionSchema.partial().parse(req.body);
      const section = await storage.updateSection(id, data);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      res.json(section);
    } catch (error) {
      console.error("Error updating section:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update section" });
    }
  });

  app.delete('/api/sections/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSection(id);
      res.json({ message: "Section deleted successfully" });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ message: "Failed to delete section" });
    }
  });

  // Subject routes
  app.get('/api/subjects', isAuthenticated, async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.post('/api/subjects', isAuthenticated, async (req, res) => {
    try {
      const data = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(data);
      res.json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.patch('/api/subjects/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertSubjectSchema.partial().parse(req.body);
      const subject = await storage.updateSubject(id, data);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      console.error("Error updating subject:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete('/api/subjects/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSubject(id);
      res.json({ message: "Subject deleted successfully" });
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Enrollment routes
  app.get('/api/enrollments', isAuthenticated, async (req, res) => {
    try {
      const { studentId, classId } = req.query;
      let enrollments;
      if (studentId) {
        enrollments = await storage.getEnrollmentsByStudent(studentId as string);
      } else if (classId) {
        enrollments = await storage.getEnrollmentsByClass(classId as string);
      } else {
        enrollments = await storage.getAllEnrollments();
      }
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post('/api/enrollments', isAuthenticated, async (req, res) => {
    try {
      const data = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createEnrollment(data);
      res.json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.patch('/api/enrollments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertEnrollmentSchema.partial().parse(req.body);
      const enrollment = await storage.updateEnrollment(id, data);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      res.json(enrollment);
    } catch (error) {
      console.error("Error updating enrollment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update enrollment" });
    }
  });

  app.delete('/api/enrollments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEnrollment(id);
      res.json({ message: "Enrollment deleted successfully" });
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      res.status(500).json({ message: "Failed to delete enrollment" });
    }
  });

  // Attendance routes
  app.get('/api/attendance', isAuthenticated, async (req, res) => {
    try {
      const { userId, date } = req.query;
      let attendanceRecords;
      if (userId && date) {
        const record = await storage.getAttendanceByUserAndDate(userId as string, new Date(date as string));
        return res.json(record || null);
      } else if (userId) {
        attendanceRecords = await storage.getAttendanceByUser(userId as string);
      } else if (date) {
        attendanceRecords = await storage.getAttendanceByDate(new Date(date as string));
      } else {
        attendanceRecords = await storage.getAllAttendance();
      }
      res.json(attendanceRecords);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post('/api/attendance', isAuthenticated, async (req, res) => {
    try {
      const data = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.createAttendance(data);
      res.json(attendance);
    } catch (error) {
      console.error("Error creating attendance:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create attendance" });
    }
  });

  app.patch('/api/attendance/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertAttendanceSchema.partial().parse(req.body);
      const attendance = await storage.updateAttendance(id, data);
      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      res.json(attendance);
    } catch (error) {
      console.error("Error updating attendance:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  app.delete('/api/attendance/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAttendance(id);
      res.json({ message: "Attendance record deleted successfully" });
    } catch (error) {
      console.error("Error deleting attendance:", error);
      res.status(500).json({ message: "Failed to delete attendance" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const { userId, unreadOnly } = req.query;
      const currentUserId = req.user.claims.sub;
      
      let notifications;
      if (unreadOnly === 'true') {
        notifications = await storage.getUnreadNotificationsByUser(userId || currentUserId);
      } else if (userId) {
        notifications = await storage.getNotificationsByUser(userId as string);
      } else {
        notifications = await storage.getNotificationsByUser(currentUserId);
      }
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications', isAuthenticated, async (req, res) => {
    try {
      const data = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(data);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotification(id);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Fee category routes
  app.get('/api/fee-categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getAllFeeCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching fee categories:", error);
      res.status(500).json({ message: "Failed to fetch fee categories" });
    }
  });

  app.post('/api/fee-categories', isAuthenticated, async (req, res) => {
    try {
      const data = insertFeeCategorySchema.parse(req.body);
      const category = await storage.createFeeCategory(data);
      res.json(category);
    } catch (error) {
      console.error("Error creating fee category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create fee category" });
    }
  });

  app.patch('/api/fee-categories/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertFeeCategorySchema.partial().parse(req.body);
      const category = await storage.updateFeeCategory(id, data);
      if (!category) {
        return res.status(404).json({ message: "Fee category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating fee category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update fee category" });
    }
  });

  app.delete('/api/fee-categories/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFeeCategory(id);
      res.json({ message: "Fee category deleted successfully" });
    } catch (error) {
      console.error("Error deleting fee category:", error);
      res.status(500).json({ message: "Failed to delete fee category" });
    }
  });

  // Fee structure routes
  app.get('/api/fee-structures', isAuthenticated, async (req, res) => {
    try {
      const { classId, sessionId } = req.query;
      let structures;
      if (classId) {
        structures = await storage.getFeeStructuresByClass(classId as string);
      } else if (sessionId) {
        structures = await storage.getFeeStructuresBySession(sessionId as string);
      } else {
        structures = await storage.getAllFeeStructures();
      }
      res.json(structures);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
      res.status(500).json({ message: "Failed to fetch fee structures" });
    }
  });

  app.post('/api/fee-structures', isAuthenticated, async (req, res) => {
    try {
      const data = insertFeeStructureSchema.parse(req.body);
      const structure = await storage.createFeeStructure(data);
      res.json(structure);
    } catch (error) {
      console.error("Error creating fee structure:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create fee structure" });
    }
  });

  app.patch('/api/fee-structures/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertFeeStructureSchema.partial().parse(req.body);
      const structure = await storage.updateFeeStructure(id, data);
      if (!structure) {
        return res.status(404).json({ message: "Fee structure not found" });
      }
      res.json(structure);
    } catch (error) {
      console.error("Error updating fee structure:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update fee structure" });
    }
  });

  app.delete('/api/fee-structures/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFeeStructure(id);
      res.json({ message: "Fee structure deleted successfully" });
    } catch (error) {
      console.error("Error deleting fee structure:", error);
      res.status(500).json({ message: "Failed to delete fee structure" });
    }
  });

  app.post('/api/fee-structures/assign', isAuthenticated, async (req, res) => {
    try {
      const { classId, sessionId } = req.body;
      await storage.assignFeesToStudents(classId, sessionId);
      res.json({ message: "Fees assigned to students successfully" });
    } catch (error) {
      console.error("Error assigning fees:", error);
      res.status(500).json({ message: "Failed to assign fees" });
    }
  });

  // Student fee routes
  app.get('/api/student-fees', isAuthenticated, async (req: any, res) => {
    try {
      const { studentId, pending } = req.query;
      const currentUserId = req.user.claims.sub;
      
      let fees;
      if (pending === 'true') {
        fees = await storage.getPendingStudentFees(studentId || currentUserId);
      } else if (studentId) {
        fees = await storage.getStudentFeesByStudent(studentId as string);
      } else {
        fees = await storage.getAllStudentFees();
      }
      res.json(fees);
    } catch (error) {
      console.error("Error fetching student fees:", error);
      res.status(500).json({ message: "Failed to fetch student fees" });
    }
  });

  app.get('/api/student-fees/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const fee = await storage.getStudentFee(id);
      if (!fee) {
        return res.status(404).json({ message: "Student fee not found" });
      }
      res.json(fee);
    } catch (error) {
      console.error("Error fetching student fee:", error);
      res.status(500).json({ message: "Failed to fetch student fee" });
    }
  });

  app.post('/api/student-fees', isAuthenticated, async (req, res) => {
    try {
      const data = insertStudentFeeSchema.parse(req.body);
      const fee = await storage.createStudentFee(data);
      res.json(fee);
    } catch (error) {
      console.error("Error creating student fee:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create student fee" });
    }
  });

  app.patch('/api/student-fees/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertStudentFeeSchema.partial().parse(req.body);
      const fee = await storage.updateStudentFee(id, data);
      if (!fee) {
        return res.status(404).json({ message: "Student fee not found" });
      }
      res.json(fee);
    } catch (error) {
      console.error("Error updating student fee:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update student fee" });
    }
  });

  app.delete('/api/student-fees/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteStudentFee(id);
      res.json({ message: "Student fee deleted successfully" });
    } catch (error) {
      console.error("Error deleting student fee:", error);
      res.status(500).json({ message: "Failed to delete student fee" });
    }
  });

  // Payment routes
  app.get('/api/payments', isAuthenticated, async (req, res) => {
    try {
      const { studentId, studentFeeId } = req.query;
      let payments;
      if (studentId) {
        payments = await storage.getPaymentsByStudent(studentId as string);
      } else if (studentFeeId) {
        payments = await storage.getPaymentsByStudentFee(studentFeeId as string);
      } else {
        payments = await storage.getAllPayments();
      }
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const receivedBy = req.user.claims.sub;
      const data = insertPaymentSchema.parse({ ...req.body, receivedBy });
      const payment = await storage.createPayment(data);
      res.json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.patch('/api/payments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(id, data);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error updating payment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  app.delete('/api/payments/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePayment(id);
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // Expense category routes
  app.get('/api/expense-categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getAllExpenseCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      res.status(500).json({ message: "Failed to fetch expense categories" });
    }
  });

  app.post('/api/expense-categories', isAuthenticated, async (req, res) => {
    try {
      const data = insertExpenseCategorySchema.parse(req.body);
      const category = await storage.createExpenseCategory(data);
      res.json(category);
    } catch (error) {
      console.error("Error creating expense category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense category" });
    }
  });

  app.patch('/api/expense-categories/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertExpenseCategorySchema.partial().parse(req.body);
      const category = await storage.updateExpenseCategory(id, data);
      if (!category) {
        return res.status(404).json({ message: "Expense category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating expense category:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update expense category" });
    }
  });

  app.delete('/api/expense-categories/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExpenseCategory(id);
      res.json({ message: "Expense category deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense category:", error);
      res.status(500).json({ message: "Failed to delete expense category" });
    }
  });

  // Expense routes
  app.get('/api/expenses', isAuthenticated, async (req, res) => {
    try {
      const { categoryId, startDate, endDate } = req.query;
      let expenses;
      if (categoryId) {
        expenses = await storage.getExpensesByCategory(categoryId as string);
      } else if (startDate && endDate) {
        expenses = await storage.getExpensesByDateRange(
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        expenses = await storage.getAllExpenses();
      }
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const createdBy = req.user.claims.sub;
      const data = insertExpenseSchema.parse({ ...req.body, createdBy });
      const expense = await storage.createExpense(data);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.patch('/api/expenses/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, data);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.patch('/api/expenses/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const approvedBy = req.user.claims.sub;
      const expense = await storage.approveExpense(id, approvedBy);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      console.error("Error approving expense:", error);
      res.status(500).json({ message: "Failed to approve expense" });
    }
  });

  app.delete('/api/expenses/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExpense(id);
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
