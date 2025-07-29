import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Assignment } from '../models/assignmentModel';
import * as assignmentController from '../controllers/assignmentController';

// Tell Jest to mock the Assignment model
jest.mock('../models/assignmentModel');

// Mock Express request/response objects
const mockRequest = (body = {}, params = {}, user = {}) => ({
  body,
  params,
  user,
  file: { path: '/uploads/test.txt' },
});

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = jest.fn();

describe('Assignment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAssignment', () => {
    it('should create a new assignment', async () => {
      const req = mockRequest(
        {
          title: 'Test Assignment',
          description: 'Test Description',
          dueDate: '2023-12-31',
          points: 100,
          submissionType: 'text',
        },
        {},
        { id: 'user123', role: 'teacher' }
      );

      const res = mockResponse();
      const mockSave = jest.fn().mockResolvedValue({
        _id: 'assignment123',
        ...req.body,
        createdBy: 'user123',
      });

      (Assignment as jest.Mocked<any>).mockImplementation(() => ({
        save: mockSave,
      }));

      await assignmentController.createAssignment(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            title: 'Test Assignment',
          }),
        })
      );
    });
  });

  describe('submitAssignment', () => {
    it('should submit an assignment', async () => {
      const req = mockRequest(
        {
          submissionType: 'text',
          submission: 'Test submission',
        },
        { id: 'assignment123' },
        { id: 'student123', role: 'student' }
      );

      const res = mockResponse();
      const mockAssignment = {
        _id: 'assignment123',
        submissions: [],
        save: jest.fn().mockResolvedValue(true),
      };

      (Assignment.findById as jest.Mock).mockResolvedValueOnce(mockAssignment);

      await assignmentController.submitAssignment(
        req as Request,
        res as Response,
        mockNext as NextFunction
      );

      expect(Assignment.findById).toHaveBeenCalledWith('assignment123');
      expect(mockAssignment.submissions).toHaveLength(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });
});
