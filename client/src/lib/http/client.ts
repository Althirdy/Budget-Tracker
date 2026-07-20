import axios from "axios"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1"

export const httpClient = axios.create({
  baseURL: new URL(apiBaseUrl).origin,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
  withXSRFToken: true,
})
