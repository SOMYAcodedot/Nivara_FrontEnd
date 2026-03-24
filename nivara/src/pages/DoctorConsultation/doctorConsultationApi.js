/**
 * Doctor Consultation API (Phase 7)
 * Base URL: http://localhost:8000/api
 * All endpoints require JWT: Authorization: Bearer <access_token>
 */

import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const doctorApi = {
  getHospitals: () => api.get("/doctor/hospitals/").then((r) => r.data),

  getDoctors: (params = {}) => {
    const query = {};
    if (params.hospital_id != null && params.hospital_id !== "") {
      query.hospital_id = params.hospital_id;
    }
    if (params.specialization != null && params.specialization !== "") {
      query.specialization = params.specialization;
    }
    return api.get("/doctor/doctors/", { params: query }).then((r) => r.data);
  },

  getDoctor: (doctorId) =>
    api.get(`/doctor/doctors/${doctorId}/`).then((r) => r.data),

  getOptions: () => api.get("/doctor/options/").then((r) => r.data),

  getReportForBooking: (days = 30) =>
    api.get("/doctor/report-for-booking/", { params: { days } }).then((r) => r.data),

  createBooking: (body) =>
    api.post("/doctor/booking/", body).then((r) => r.data),

  getBookings: () => api.get("/doctor/bookings/").then((r) => r.data),

  getBooking: (bookingId) =>
    api.get(`/doctor/booking/${bookingId}/`).then((r) => r.data),

  initiatePayment: (bookingId, body) =>
    api.post(`/doctor/booking/${bookingId}/payment/initiate/`, body).then((r) => r.data),

  confirmPayment: (bookingId, body) =>
    api.post(`/doctor/booking/${bookingId}/payment/confirm/`, body).then((r) => r.data),
};

export default doctorApi;
