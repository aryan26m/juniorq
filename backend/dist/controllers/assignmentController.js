"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeSubmission = exports.submitAssignment = exports.deleteAssignment = exports.updateAssignment = exports.createAssignment = exports.getAssignment = exports.getAssignments = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = require("mongoose");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const assignmentModel_1 = __importDefault(require("../models/assignmentModel"));
const codeExecutor_1 = require("../utils/codeExecutor");
// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res, next) => {
    var _a;
    try {
        const query = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'student'
            ? { isActive: true }
            : req.user ? { createdBy: req.user.id } : {};
        const assignments = await assignmentModel_1.default.find(query)
            .populate('createdBy', 'name email')
            .sort('-createdAt');
        const result = {
            success: true,
            count: assignments.length,
            data: assignments,
        };
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getAssignments = getAssignments;
// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = async (req, res, next) => {
    try {
        const assignment = await assignmentModel_1.default.findById(req.params.id)
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAssignment = getAssignment;
// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Teacher/Admin)
const createAssignment = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
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
        const assignment = await assignmentModel_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: assignment,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAssignment = createAssignment;
// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teacher/Admin)
const updateAssignment = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let assignment = await assignmentModel_1.default.findById(req.params.id);
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
        const updatedAssignment = await assignmentModel_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            success: true,
            data: assignment,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAssignment = updateAssignment;
// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher/Admin)
const deleteAssignment = async (req, res, next) => {
    try {
        const assignment = await assignmentModel_1.default.findById(req.params.id);
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
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAssignment = deleteAssignment;
// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = async (req, res, next) => {
    var _a, _b;
    try {
        if (!req.user || req.user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Only students can submit assignments',
            });
        }
        const assignment = await assignmentModel_1.default.findById(req.params.id);
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
        const existingSubmissionIndex = assignment.submissions.findIndex((sub) => sub.student.toString() === req.user.id);
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to submit assignments',
            });
        }
        const submission = {
            student: new mongoose_1.Types.ObjectId(req.user.id),
            submissionType: req.body.submissionType,
            submission: req.body.submission || (req.file ? req.file.path : ''),
            submittedAt: new Date(),
            status: 'submitted',
            graded: false,
        };
        // Handle different submission types
        if (assignment.submissionType === 'file') {
            if (!req.files || !req.files.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload a file',
                });
            }
            const file = req.files.file;
            const fileExt = file.name.split('.').pop().toLowerCase();
            if (!((_a = assignment.allowedFileTypes) === null || _a === void 0 ? void 0 : _a.includes(fileExt))) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid file type. Allowed types: ${(_b = assignment.allowedFileTypes) === null || _b === void 0 ? void 0 : _b.join(', ')}`,
                });
            }
            if (file.size > (assignment.maxFileSize || 10) * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: `File size exceeds the limit of ${assignment.maxFileSize || 10}MB`,
                });
            }
            const fileName = `${assignment._id}-${req.user.id}-${Date.now()}.${fileExt}`;
            const uploadPath = path_1.default.join(__dirname, `../../public/submissions/${fileName}`);
            if (!fs_1.default.existsSync(path_1.default.dirname(uploadPath))) {
                fs_1.default.mkdirSync(path_1.default.dirname(uploadPath), { recursive: true });
            }
            await file.mv(uploadPath);
            submission.submission = fileName;
        }
        else if (assignment.submissionType === 'code') {
            const { code } = req.body;
            if (!code) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide code',
                });
            }
            const executionResults = [];
            let passed = 0;
            let failed = 0;
            if (assignment.testCases && assignment.testCases.length > 0) {
                try {
                    const testCaseResults = [];
                    let testCaseIndex = 0;
                    for (const testCase of assignment.testCases) {
                        const result = await (0, codeExecutor_1.executeCode)({
                            code,
                            language: 'javascript',
                            input: testCase.input,
                            expectedOutput: testCase.expectedOutput,
                            timeout: 5000,
                        });
                        const testResult = {
                            testCaseId: testCaseIndex++,
                            input: testCase.input,
                            expectedOutput: testCase.expectedOutput,
                            actualOutput: result.output || null,
                            passed: result.passed || false,
                            executionTime: result.executionTime,
                            error: result.error || undefined,
                        };
                        if (testResult.passed)
                            passed++;
                        else
                            failed++;
                        executionResults.push(testResult);
                    }
                }
                catch (error) {
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
            submission.gradedBy = 'auto-grader';
            submission.gradedAt = new Date();
            submission.executionResult = {
                passed,
                failed,
                total: passed + failed,
                testResults: executionResults, // Type assertion to handle the test case result structure
            };
        }
        else {
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
        }
        else {
            assignment.submissions.push(submission);
        }
        await assignment.save();
        res.status(200).json({
            success: true,
            data: assignment,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitAssignment = submitAssignment;
// @desc    Grade assignment submission
// @route   PUT /api/assignments/:id/grade/:submissionId
// @access  Private (Teacher/Admin)
const gradeSubmission = async (req, res, next) => {
    try {
        const { submissionId, grade, feedback } = req.body;
        const assignment = await assignmentModel_1.default.findOne({ 'submissions._id': new mongoose_1.Types.ObjectId(submissionId) });
        if (!assignment) {
            return next({
                message: `Assignment not found with submission id of ${submissionId}`,
                statusCode: 404,
            });
        }
        // Find the submission and update it
        const submissionIndex = assignment.submissions.findIndex((sub) => { var _a; return ((_a = sub._id) === null || _a === void 0 ? void 0 : _a.toString()) === submissionId; });
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
                submissionToUpdate.gradedBy = new mongoose_1.Types.ObjectId(req.user.id);
            }
            submissionToUpdate.gradedAt = new Date();
        }
        await assignment.save();
        res.status(200).json({
            success: true,
            data: submissionToUpdate,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.gradeSubmission = gradeSubmission;
