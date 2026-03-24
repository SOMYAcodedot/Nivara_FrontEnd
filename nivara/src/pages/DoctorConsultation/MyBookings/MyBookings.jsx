import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarCheck,
  FaArrowLeft,
  FaExclamationTriangle,
  FaMoneyBillWave,
} from "react-icons/fa";
import { doctorApi } from "../doctorConsultationApi";
import "./MyBookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await doctorApi.getBookings();
        setBookings(res?.bookings || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(
          err.response?.status === 401
            ? "Please log in to view your bookings."
            : err.response?.data?.detail || "Failed to load bookings."
        );
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "mb-status-confirmed";
      case "payment_pending":
        return "mb-status-pending";
      case "cancelled":
        return "mb-status-cancelled";
      default:
        return "mb-status-other";
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="mb-loading">
          <div className="mb-spinner" />
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <Link to="/doctor-consultation" className="mb-back-link">
        <FaArrowLeft /> Back to Doctor Consultation
      </Link>

      <div className="mb-header">
        <h1>
          <FaCalendarCheck className="mb-header-icon" /> My Bookings
        </h1>
        <p>View and manage your consultation bookings</p>
      </div>

      {error && (
        <div className="mb-error">
          <FaExclamationTriangle className="mb-error-icon" />
          <p>{error}</p>
        </div>
      )}

      {!error && bookings.length === 0 && (
        <div className="mb-empty">
          <FaCalendarCheck className="mb-empty-icon" />
          <h2>No bookings yet</h2>
          <p>Book a consultation with a women&apos;s health specialist to get started.</p>
          <Link to="/doctor-consultation" className="mb-empty-btn">
            Browse doctors
          </Link>
        </div>
      )}

      {!error && bookings.length > 0 && (
        <div className="mb-list">
          {bookings.map((b) => {
            const doctorName = b.doctor_detail?.name || b.doctor_name || "Doctor";
            const status = b.status || "—";
            const isPaymentPending = status === "payment_pending";
            return (
              <div key={b.id} className="mb-card">
                <div className="mb-card-main">
                  <div className="mb-card-info">
                    <h3>Dr. {doctorName}</h3>
                    <p className="mb-card-date">
                      <FaCalendarCheck /> {formatDate(b.scheduled_at)}
                    </p>
                    <p className="mb-card-type">
                      {(b.consultation_type || "").replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="mb-card-meta">
                    <span className={`mb-status ${getStatusBadgeClass(status)}`}>
                      {status.replace(/_/g, " ")}
                    </span>
                    {b.payment_detail?.amount != null && (
                      <span className="mb-amount">₹{b.payment_detail.amount}</span>
                    )}
                  </div>
                </div>
                {isPaymentPending && (
                  <Link
                    to={`/doctor-consultation/booking/${b.id}/pay`}
                    className="mb-pay-btn"
                  >
                    <FaMoneyBillWave /> Pay now
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
