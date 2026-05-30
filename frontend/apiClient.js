import { getToken } from "./auth/tokenStorage";

const BASE_URL = "http://YOUR_IP:8080";

/* Core API client that automatically attaches JWT token to every request */
export const apiRequest = async (endpoint, options = {}) => {
    try {
        const token = await getToken();

        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Handle expired/invalid token
        if (response.status === 401) {
            console.warn("Unauthorized - token may be expired");
            // myöhemmin: deleteToken + redirect login
        }

        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }

        return await response.text();
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
};

/* Convenience helpers */
export const apiGet = (endpoint) =>
    apiRequest(endpoint, { method: "GET" });

export const apiPost = (endpoint, body) =>
    apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
    });

export const apiPut = (endpoint, body) =>
    apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
    });

export const apiDelete = (endpoint) =>
    apiRequest(endpoint, { method: "DELETE" });