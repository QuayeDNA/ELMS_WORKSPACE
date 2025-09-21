import { Request, Response } from "express";
import { programPrefixService } from "../services/programPrefixService";

export const programPrefixController = {
  // Get all program prefixes
  async getProgramPrefixes(req: Request, res: Response) {
    try {
      const prefixes = await programPrefixService.getProgramPrefixes();
      res.json({
        success: true,
        data: prefixes,
      });
    } catch (error) {
      console.error("Error fetching program prefixes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch program prefixes",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Get prefix by program type
  async getProgramPrefix(req: Request, res: Response) {
    try {
      const { programType } = req.params;
      const prefix = await programPrefixService.getProgramPrefix(
        programType as any
      );

      if (!prefix) {
        return res.status(404).json({
          success: false,
          message: "Program prefix not found",
        });
      }

      res.json({
        success: true,
        data: prefix,
      });
    } catch (error) {
      console.error("Error fetching program prefix:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch program prefix",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Update program prefix
  async updateProgramPrefix(req: Request, res: Response) {
    try {
      const { programType } = req.params;
      const { prefix, description, isActive } = req.body;

      const updatedPrefix = await programPrefixService.updateProgramPrefix(
        programType as any,
        {
          prefix,
          description,
          isActive,
        }
      );

      res.json({
        success: true,
        message: "Program prefix updated successfully",
        data: updatedPrefix,
      });
    } catch (error) {
      console.error("Error updating program prefix:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update program prefix",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // Bulk update prefixes
  async bulkUpdatePrefixes(req: Request, res: Response) {
    try {
      const { prefixes } = req.body; // Array of { programType, prefix, description, isActive }

      const updatedPrefixes =
        await programPrefixService.bulkUpdatePrefixes(prefixes);

      res.json({
        success: true,
        message: "Program prefixes updated successfully",
        data: updatedPrefixes,
      });
    } catch (error) {
      console.error("Error bulk updating program prefixes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to bulk update program prefixes",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
