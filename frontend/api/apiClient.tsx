const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
import AsyncStorage from "@react-native-async-storage/async-storage";

let authToken: string | null = null;

export const loadAuthToken = async () => {
    const stored = await AsyncStorage.getItem("accessToken");
    authToken = stored;
};

export const setAuthToken = async (token: string | null) => {
    authToken = token;

    if (token) {
        await AsyncStorage.setItem("accessToken", token);
    } else {
        await AsyncStorage.removeItem("accessToken");
    }
};

async function request(
    endpoint: string,
    options: {
        method?: string;
        body?: any;
        headers?: Record<string, string>;
    } = {}
) {
    const url = `${BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let data: any = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!response.ok) {
        if (typeof data === "string") {
            throw new Error(data || `HTTP ${response.status}`);
        }

        throw new Error(data?.message || `HTTP ${response.status}`);
    }

    return data;
}

export const apiGet = (endpoint: string) => request(endpoint);
export const apiPost = (endpoint: string, body: any) =>
    request(endpoint, { method: "POST", body });
export const apiPut = (endpoint: string, body: any) =>
    request(endpoint, { method: "PUT", body });
export const apiDelete = (endpoint: string) =>
    request(endpoint, { method: "DELETE" });
