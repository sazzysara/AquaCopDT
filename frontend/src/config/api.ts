/**
 * AquaCop API Configuration
 * Supports Local FastAPI backend (http://localhost:8001), Remote Backend via NEXT_PUBLIC_API_URL,
 * or Built-in Vercel Serverless API Routes when deployed.
 */

export const getApiBaseUrl = (): string => {
  // If explicitly configured in environment variables (e.g. deployed backend URL)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // Client-side detection
  if (typeof window !== "undefined") {
    // When developing locally on localhost or 127.0.0.1, check for local FastAPI backend
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8001";
    }
    // In production on Vercel (*.vercel.app), use relative path to hit built-in Next.js serverless API routes!
    return "";
  }

  // Server-side default
  return process.env.NODE_ENV === "production" ? "" : "http://localhost:8001";
};

export const API_BASE = getApiBaseUrl();
