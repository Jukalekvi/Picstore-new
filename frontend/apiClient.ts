import { getToken } from "./lib/tokenStorage";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL as string;

/**
 * Types
 */
type ApiOptions = {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
};

/**
 * Safe JSON parser
 */
const safeParseJSON = (text: string) => {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
};

/**
 * Core API client
 */
export const apiRequest = async (
    endpoint: string,
    options: ApiOptions = {}
) => {
    try {
        const token = await getToken();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: options.method,
            headers,
            body: options.body,
        });

        const rawText = await response.text();
        const data = safeParseJSON(rawText);

        if (response.status === 401) {
            throw new Error("Unauthorized - invalid or expired token");
        }

        if (data !== null) {
            return data;
        }

        throw new Error(rawText || "Unknown API error");
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
};

/**
 * Helpers
 */
export const apiGet = (endpoint: string) =>
    apiRequest(endpoint, { method: "GET" });

export const apiPost = (endpoint: string, body: any) =>
    apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
    });

export const apiPut = (endpoint: string, body: any) =>
    apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
    });

export const apiDelete = (endpoint: string) =>
    apiRequest(endpoint, { method: "DELETE" });