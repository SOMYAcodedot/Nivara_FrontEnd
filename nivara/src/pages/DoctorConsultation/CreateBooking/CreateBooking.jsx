import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarCheck,
  FaFileAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { doctorApi } from "../doctorConsultationApi";
import "./CreateBooking.css";

const CreateBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateDoctorId = location.state?.doctorId;
  const stateDoctor = location.state?.doctor;

  const [doctor, setDoctor] = useState(stateDoctor || null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(!!stateDoctorId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [scheduledAt, setScheduledAt] = useState("");
  const [consultationType, setConsultationType] = useState("virtual");
  const [reportShared, setReportShared] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!stateDoctorId) {
      setError("Please select a doctor first.");
      setLoading(false);
      return;
    }
    const fetchDoctorAndOptions = async () => {
      setLoading(true);
      setError("");
      try {
        const [doctorData, optionsData] = await Promise.all([
          doctorApi.getDoctor(stateDoctorId),
          doctorApi.getOptions(),
        ]);
        setDoctor(doctorData);
        setOptions(optionsData);
        const types = optionsData?.consultation_types || [];
        const firstType = types[0];
        const typeVal = typeof firstType === "object" && firstType != null && "value" in firstType ? firstType.value : firstType;
        if (types.length && typeVal && typeVal !== consultationType) {
          setConsultationType(typeVal);
        }
      } catch (err) {
        console.error("Error loading doctor/options:", err);
        setError(
          err.response?.data?.detail || "Failed to load. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorAndOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- set default consultation type only when options load
  }, [stateDoctorId]);

  const consultationTypes = options?.consultation_types || ["virtual", "in_person"];
  const optVal = (t) => (typeof t === "object" && t != null && "value" in t ? t.value : t);
  const optLabel = (t) => (typeof t === "object" && t != null && "label" in t ? t.label : String(t).replace(/_/g, " "));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctor?.id || !scheduledAt) {
      setError("Please select date and time.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        doctor: doctor.id,
        scheduled_at: new Date(scheduledAt).toISOString(),
        consultation_type: consultationType,
        report_shared: reportShared,
        notes: notes.trim() || undefined,
      };
      const res = await doctorApi.createBooking(payload);
      const bookingId = res?.booking?.id;
      if (bookingId) {
        navigate(`/doctor-consultation/booking/${bookingId}/pay`);
      } else {
        setError(res?.message || "Booking created but could not redirect.");
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to create booking."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!stateDoctorId) {
    return (
      <div className="create-booking-page">
        <div className="cb-error-box">
          <FaExclamationTriangle className="cb-error-icon" />
          <p>Please select a doctor from the list first.</p>
          <Link to="/doctor-consultation" className="cb-back-link">
            <FaArrowLeft /> Browse doctors
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="create-booking-page">
        <div className="cb-loading">
          <div className="cb-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="create-booking-page">
        <div className="cb-error-box">
          <FaExclamationTriangle className="cb-error-icon" />
          <p>{error || "Doctor not found."}</p>
          <Link to="/doctor-consultation" className="cb-back-link">
            <FaArrowLeft /> Browse doctors
          </Link>
        </div>
      </div>
    );
  }

  const minDateTime = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  return (
    <div className="create-booking-page">
      <Link to={`/doctor-consultation/doctor/${doctor.id}`} className="cb-back-link">
        <FaArrowLeft /> Back to doctor
      </Link>

      <div className="cb-card">
        <h1 className="cb-title">
          <FaCalendarCheck /> Book Consultation
        </h1>
        <p className="cb-doctor-name">
          Dr. {doctor.name} · {doctor.specialization} · ₹{doctor.consultation_fee}
        </p>

        <form onSubmit={handleSubmit} className="cb-form">
          <div className="cb-field">
            <label>Date & time *</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minDateTime()}
              required
              className="cb-input"
            />
          </div>

          <div className="cb-field">
            <label>Consultation type</label>
            <select
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value)}
              className="cb-select"
            >
              {consultationTypes.map((t) => (
                <option key={optVal(t)} value={optVal(t)}>
                  {optLabel(t)}
                </option>
              ))}
            </select>
          </div>

          <div className="cb-field cb-checkbox-field">
            <label className="cb-checkbox-label">
              <input
                type="checkbox"
                checked={reportShared}
                onChange={(e) => setReportShared(e.target.checked)}
              />
              <span>
                <FaFileAlt /> Share my AI health report with the doctor
              </span>
            </label>
            <p className="cb-hint">
              Your wellness summary will be attached to this booking for the doctor to review.
            </p>
          </div>

          <div className="cb-field">
            <label>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any symptoms or questions for the doctor..."
              className="cb-textarea"
              rows={3}
            />
          </div>

          {error && (
            <div className="cb-form-error">
              <FaExclamationTriangle /> {error}
            </div>
          )}

          <button
            type="submit"
            className="cb-submit-btn"
            disabled={submitting || !scheduledAt}
          >
            {submitting ? "Creating..." : "Continue to payment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBooking;
