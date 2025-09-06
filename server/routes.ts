import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Crime dashboard API routes
  
  // Get dashboard overview data
  app.get("/api/dashboard", async (_req, res) => {
    try {
      const data = await storage.getDashboardData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Get crime statistics
  app.get("/api/crime-stats", async (_req, res) => {
    try {
      const stats = await storage.getCrimeStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching crime stats:", error);
      res.status(500).json({ message: "Failed to fetch crime statistics" });
    }
  });

  // Get crime categories
  app.get("/api/crime-categories", async (_req, res) => {
    try {
      const categories = await storage.getCrimeCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching crime categories:", error);
      res.status(500).json({ message: "Failed to fetch crime categories" });
    }
  });

  // Get districts
  app.get("/api/districts", async (_req, res) => {
    try {
      const districts = await storage.getDistricts();
      res.json(districts);
    } catch (error) {
      console.error("Error fetching districts:", error);
      res.status(500).json({ message: "Failed to fetch districts" });
    }
  });

  // Get crime incidents with optional filtering
  app.get("/api/crime-incidents", async (req, res) => {
    try {
      const { categoryId, districtId } = req.query;
      const incidents = await storage.getCrimeIncidents(
        categoryId as string, 
        districtId as string
      );
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching crime incidents:", error);
      res.status(500).json({ message: "Failed to fetch crime incidents" });
    }
  });

  // Get active alerts
  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getCrimeAlerts(true);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Get AI insights
  app.get("/api/insights", async (_req, res) => {
    try {
      const insights = await storage.getAiInsights();
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
