const BASE_URL = "http://192.168.0.121:8080";
import AsyncStorage from "@react-native-async-storage/async-storage";

let authToken: string | null = null;

/**
 * Lataa token AsyncStoragesta appin käynnistyessä
 */
export const loadAuthToken = async () => {
    const stored = await AsyncStorage.getItem("accessToken");
    authToken = stored;
};

/**
 * Asettaa tokenin muistiin + AsyncStorageen
 */
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
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
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