import axios from "axios"
import { API_BASE_URL, ENDPOINTS } from "../config/api"

const authApi = axios.create({
  baseURL: API_BASE_URL,
})

export const register = async (userData) => {
  try {
    const response = await authApi.post(ENDPOINTS.AUTH.REGISTER, userData)
    return response.data
  } catch (error) {
    throw error
  }
}

export const login = async (credentials) => {
  try {
    const response = await authApi.post(ENDPOINTS.AUTH.LOGIN, credentials)
    return response.data
  } catch (error) {
    throw error
  }
} 