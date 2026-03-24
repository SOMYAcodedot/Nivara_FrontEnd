import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaUserMd,
  FaArrowLeft,
  FaCalendarCheck,
  FaHospital,
  FaExclamationTriangle,
} from "react-icons/fa";
import { doctorApi } from "../doctorConsultationApi";
import "./DoctorDetail.css";

const DoctorDetail = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await doctorApi.getDoctor(doctorId);
        setDoctor(data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
        setError(
          err.response?.status === 401
            ? "Please log in to view doctor details."
            : err.response?.data?.detail || "Failed to load doctor."
        );
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchDoctor();
  }, [doctorId]);

  const handleBookConsultation = () => {
    navigate("/doctor-consultation/booking/new", {
      state: { doctorId: doctor?.id, doctor },
    });
  };

  if (loading) {
    return (
      <div className="doctor-detail-page">
        <div className="dd-loading">
          <div className="dd-spinner" />
          <p>Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="doctor-detail-page">
        <div className="dd-error">
          <FaExclamationTriangle className="dd-error-icon" />
          <p>{error || "Doctor not found."}</p>
          <Link to="/doctor-consultation" className="dd-back-link">
            <FaArrowLeft /> Back to doctors
          </Link>
        </div>
      </div>
    );
  }

  const availableDays = doctor.available_days;
  const daysDisplay = Array.isArray(availableDays)
    ? availableDays.join(", ")
    : typeof availableDays === "string"
    ? availableDays
    : "—";

  return (
    <div className="doctor-detail-page">
      <Link to="/doctor-consultation" className="dd-back-link top">
        <FaArrowLeft /> Back to doctors
      </Link>

      <div className="dd-card">
        <div className="dd-profile">
          <div className="dd-avatar" style={{ background: "#f093fb" }}>
            <FaUserMd />
          </div>
          <div className="dd-profile-info">
            <h1>{doctor.name}</h1>
            <span className="dd-spec">
              {typeof doctor.specialization === "object" && doctor.specialization !== null && "label" in doctor.specialization
                ? doctor.specialization.label
                : doctor.specialization}
            </span>
            <p className="dd-qual">{doctor.qualification}</p>
            <p className="dd-fee">₹{doctor.consultation_fee} per consultation</p>
          </div>
        </div>

        {doctor.hospital_name && (
          <div className="dd-section">
            <h3>
              <FaHospital /> Hospital
            </h3>
            <p className="dd-hospital-name">{doctor.hospital_name}</p>
          </div>
        )}

        {doctor.bio && (
          <div className="dd-section">
            <h3>About</h3>
            <p className="dd-bio">{doctor.bio}</p>
          </div>
        )}

        <div className="dd-section">
          <h3>Available days</h3>
          <p className="dd-days">{daysDisplay}</p>
        </div>

        <div className="dd-actions">
          <button
            type="button"
            className="dd-book-btn"
            onClick={handleBookConsultation}
          >
            <FaCalendarCheck /> Book Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
