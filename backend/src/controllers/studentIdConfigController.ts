import { Request, Response } from 'express';
import { studentIdConfigService } from '../services/studentIdConfigService';

/**
 * Student ID Configuration Controller
 */

/**
 * Get configuration by institution
 * GET /api/student-id-config/institution/:institutionId
 */
export const getConfigByInstitution = async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.params;

    const config = await studentIdConfigService.getConfigByInstitution(parseInt(institutionId));

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Student ID configuration not found',
      });
    }

    return res.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error('Error fetching student ID config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch configuration',
      error: error.message,
    });
  }
};

/**
 * Create configuration
 * POST /api/student-id-config
 */
export const createConfig = async (req: Request, res: Response) => {
  try {
    const config = await studentIdConfigService.createConfig(req.body);

    return res.status(201).json({
      success: true,
      message: 'Student ID configuration created successfully',
      data: config,
    });
  } catch (error: any) {
    console.error('Error creating student ID config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create configuration',
      error: error.message,
    });
  }
};

/**
 * Update configuration
 * PUT /api/student-id-config/institution/:institutionId
 */
export const updateConfig = async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.params;

    const config = await studentIdConfigService.updateConfig(parseInt(institutionId), req.body);

    return res.json({
      success: true,
      message: 'Student ID configuration updated successfully',
      data: config,
    });
  } catch (error: any) {
    console.error('Error updating student ID config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update configuration',
      error: error.message,
    });
  }
};

/**
 * Preview configuration
 * POST /api/student-id-config/preview
 */
export const previewConfig = async (req: Request, res: Response) => {
  try {
    const preview = await studentIdConfigService.previewConfig(req.body);

    return res.json({
      success: true,
      data: preview,
    });
  } catch (error: any) {
    console.error('Error previewing student ID config:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to preview configuration',
      error: error.message,
    });
  }
};
