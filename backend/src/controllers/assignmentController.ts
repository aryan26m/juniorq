import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Assignment, { IAssignment, ISubmission, ICodeExecutionResult } from '../models/assignmentModel';
import { executeCode } from '../utils/codeExecutor';

// Define the TestCaseResult type since it's used in the controller
interface TestCaseResult {
  testCaseId?: number;
  input: any;
  expectedOutput: any;
  actualOutput?: any;
  passed: boolean;
  executionTime?: number;
  error?: string;
}

interface ICodeExecutionResultExtended extends ICodeExecutionResult {
  testResults?: TestCaseResult[];
}

// Extend the Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        name: string;
        email: string;
      };
      file?: Express.Multer.File;
      files?: {
        [fieldname: string]: Express.Multer.File[];
      };
    }
  }
}

interface PaginationResult<T> {
  success: boolean;
  count: number;
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
  data: T[];
}

// Single type definition for ControllerResponse
type ControllerResponse = Response<any, Record<string, any>> | void;

interface SubmissionResult {
  success: boolean;
  message: string;
  submission?: ISubmission;
  results?: TestCaseResult[];
  error?: string;
}

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ControllerResponse> => {
  try {
    const query = req.user?.role === 'student' 
    ? { isActive: true } 
    : req.user ? { createdBy: req.user.id } : {};

    const assignments = await Assignment.find(query)
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    const result: PaginationResult<IAssignment> = {
      success: true,
      count: assignments.length,
      data: assignments,
    };
  
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ControllerResponse> => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('submissions.student', 'name email');

    if (!assignment) {
      return next({
        message: `Assignment not found with id of ${req.params.id}`,
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Teacher/Admin)
export const createAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ControllerResponse> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to create assignments',
      });
    }

    req.body.createdBy = req.user.id;

    const assignment = await Assignment.create(req.body) as IAssignment;

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teacher/Admin)
export const updateAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ControllerResponse> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return next({
        message: `Assignment not found with id of ${req.params.id}`,
        statusCode: 404,
      });
    }

    // Make sure user is assignment owner or admin
    if (!req.user || 
        (assignment.createdBy.toString() !== req.user.id && req.user.role !== 'admin')) {
      return next({
        message: `User is not authorized to update this assignment`,
        statusCode: 401,
      });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher/Admin)
export const deleteAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ControllerResponse> => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return next({
        message: `Assignment not found with id of ${req.params.id}`,
        statusCode: 404,
      });
    }

    // Make sure user is assignment owner or admin
    if (!req.user || 
        (assignment.createdBy.toString() !== req.user.id && req.user.role !== 'admin')) {
      return next({
        message: `User is not authorized to delete this assignment`,
        statusCode: 401,
      });
    }

    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
export const submitAssignment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ControllerResponse> => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit assignments',
      });
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return next({
        message: `Assignment not found with id of ${req.params.id}`,
        statusCode: 404,
      });
    }

    if (!assignment.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'This assignment is not published yet',
      });
    }

    if (new Date() > assignment.dueDate) {
      return res.status(400).json({
        success: false,
        message: 'The due date for this assignment has passed',
      });
    }

    const existingSubmissionIndex = assignment.submissions.findIndex(
      (sub: ISubmission) => req.user && sub.student.toString() === req.user.id
    );

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to submit assignments',
      });
    }

    const submission: ISubmission = {
      student: new Types.ObjectId(req.user.id),
      submissionType: req.body.submissionType,
      submission: req.body.submission || (req.file ? req.file.path : ''),
      submittedAt: new Date(),
      status: 'submitted',
      graded: false,
    };

    // Handle different submission types
    if (assignment.submissionType === 'file') {
      if (!(req as any).files || !(req as any).files.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a file',
        });
      }

      const file = (req as any).files.file;
      const fileExt = file.name.split('.').pop().toLowerCase();

      if (!assignment.allowedFileTypes?.includes(fileExt)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${assignment.allowedFileTypes?.join(', ')}`,
        });
      }

      if (file.size > (assignment.maxFileSize || 10) * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: `File size exceeds the limit of ${assignment.maxFileSize || 10}MB`,
        });
      }

      const fileName = `${assignment._id}-${req.user.id}-${Date.now()}.${fileExt}`;
      const uploadPath = path.join(__dirname, `../../public/submissions/${fileName}`);
      
      if (!fs.existsSync(path.dirname(uploadPath))) {
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
      }

      await file.mv(uploadPath);
      submission.submission = fileName;

    } else if (assignment.submissionType === 'code') {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Please provide code',
        });
      }

      const executionResults: TestCaseResult[] = [];
      let passed = 0;
      let failed = 0;

      if (assignment.testCases && assignment.testCases.length > 0) {
        try {
          const testCaseResults: TestCaseResult[] = [];
          let testCaseIndex = 0;
          
          for (const testCase of assignment.testCases) {
            const result = await executeCode({
              code,
              language: 'javascript',
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              timeout: 5000,
            });

            const testResult: TestCaseResult = {
              testCaseId: testCaseIndex++,
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              actualOutput: result.output || null,
              passed: result.passed || false,
              executionTime: result.executionTime,
              error: result.error || undefined,
            };

            if (testResult.passed) passed++;
            else failed++;

            executionResults.push(testResult);
          }
        } catch (error) {
          console.error(`Error executing test cases:`, error);
          failed++;
          executionResults.push({
            testCaseId: -1,
            input: 'N/A',
            expectedOutput: 'N/A',
            actualOutput: 'N/A',
            passed: false,
            error: 'Error executing test cases',
          });
        }
      }

      const grade = (passed / (passed + failed)) * assignment.points;
      
      submission.graded = true;
      submission.grade = Math.round(grade * 100) / 100;
      submission.gradedBy = new Types.ObjectId('000000000000000000000000'); // Dummy ObjectId for auto-grader
      submission.gradedAt = new Date();
      const executionResult: ICodeExecutionResultExtended = {
        passed,
        failed,
        total: passed + failed,
        details: executionResults.map((result, index) => ({
          testCaseId: index,
          input: result.input,
          expectedOutput: result.expectedOutput,
          actualOutput: result.actualOutput,
          passed: result.passed,
          executionTime: result.executionTime,
          error: result.error
        })),
        testResults: executionResults // Keeping this for backward compatibility
      };
      submission.executionResult = executionResult;

    } else {
      const { submission } = req.body;

      if (!submission) {
        return res.status(400).json({
          success: false,
          message: `Please provide ${assignment.submissionType} submission`,
        });
      }

      submission.submission = submission;
    }

    if (existingSubmissionIndex >= 0) {
      assignment.submissions[existingSubmissionIndex] = submission;
    } else {
      assignment.submissions.push(submission);
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade assignment submission
// @route   PUT /api/assignments/:id/grade/:submissionId
// @access  Private (Teacher/Admin)
export const gradeSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<ControllerResponse> => {
  try {
    const { submissionId, grade, feedback } = req.body as {
      submissionId: string;
      grade: string; // Changed from number to string since we parse it later
      feedback?: string;
    };
  
    const assignment = await Assignment.findOne({ 'submissions._id': new Types.ObjectId(submissionId) }) as IAssignment | null;

    if (!assignment) {
      return next({
        message: `Assignment not found with submission id of ${submissionId}`,
        statusCode: 404,
      });
    }

    // Find the submission and update it
    const submissionIndex = assignment.submissions.findIndex(
      (sub: ISubmission) => sub._id?.toString() === submissionId
    );

    if (submissionIndex === -1) {
      return next({
        message: `Submission not found with id of ${submissionId}`,
        statusCode: 404,
      });
    }

    // Update the submission with grade and feedback
    const submissionToUpdate = assignment.submissions[submissionIndex];
    if (submissionToUpdate) {
      submissionToUpdate.graded = true;
      submissionToUpdate.grade = parseFloat(grade);
      submissionToUpdate.feedback = feedback;
      if (req.user) {
        submissionToUpdate.gradedBy = new Types.ObjectId(req.user.id);
      }
      submissionToUpdate.gradedAt = new Date();
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      data: submissionToUpdate,
    });
  } catch (error) {
    next(error);
  }
};
