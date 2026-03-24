import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaStethoscope,
  FaHospital,
  FaUserMd,
  FaArrowRight,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaFilter,
} from "react-icons/fa";
import { doctorApi } from "./doctorConsultationApi";
import "./DoctorConsultation.css";

const DoctorConsultation = () => {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [viewMode, setViewMode] = useState("doctors"); // "hospitals" | "doctors"

  const fetchHospitalsAndOptions = async () => {
    try {
      const [hospitalsRes, optionsRes] = await Promise.all([
        doctorApi.getHospitals(),
        doctorApi.getOptions(),
      ]);
      setHospitals(hospitalsRes?.hospitals || []);
      setOptions(optionsRes || {});
    } catch (err) {
      console.error("Error fetching hospitals/options:", err);
      setError(
        err.response?.status === 401
          ? "Please log in to browse doctors."
          : err.response?.data?.detail || "Failed to load hospitals."
      );
    }
  };

  useEffect(() => {
    fetchHospitalsAndOptions();
  }, []);

  // Refetch doctors whenever filters or options change (options loaded = we can filter)
  useEffect(() => {
    if (options === null) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    const params = {};
    if (hospitalId && String(hospitalId).trim()) {
      const id = Number(hospitalId);
      params.hospital_id = Number.isNaN(id) ? hospitalId : id;
    }
    if (specialization && String(specialization).trim()) {
      params.specialization = specialization.trim();
    }
    doctorApi
      .getDoctors(params)
      .then((res) => {
        if (!cancelled) setDoctors(res?.doctors || []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Error fetching doctors:", err);
        setError(
          err.response?.status === 401
            ? "Please log in to browse doctors."
            : err.response?.data?.detail || "Failed to load doctors."
        );
        setDoctors([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [options, hospitalId, specialization]);

  const specializations = options?.doctor_specializations || [];

  // API may return options as strings or as { value, label } objects
  const optionValue = (item) =>
    typeof item === "object" && item !== null && "value" in item ? item.value : item;
  const optionLabel = (item) =>
    typeof item === "object" && item !== null && "label" in item ? item.label : item;

  if (error && !doctors.length && !hospitals.length) {
    return (
      <div className="doctor-consultation-page">
        <div className="dc-page-header">
          <div className="dc-header-content">
            <h1>
              <FaStethoscope className="dc-header-icon" /> Doctor Consultation
            </h1>
            <p>Book consultations with women&apos;s health specialists</p>
          </div>
        </div>
        <div className="dc-error-container">
          <FaExclamationTriangle className="dc-error-icon" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-consultation-page">
      <div className="dc-page-header">
        <div className="dc-header-content">
          <h1>
            <FaStethoscope className="dc-header-icon" /> Doctor Consultation
          </h1>
          <p>Book consultations with women&apos;s health specialists</p>
        </div>
        <div className="dc-header-actions">
          <Link to="/doctor-consultation/bookings" className="dc-my-bookings-btn">
            <FaCalendarCheck /> My Bookings
          </Link>
        </div>
      </div>

      {/* Filters */}
      <section className="dc-filters">
        <FaFilter className="dc-filter-icon" />
        <div className="dc-filter-group">
          <label>Hospital</label>
          <select
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
            className="dc-select"
          >
            <option value="">All hospitals</option>
            {hospitals.map((h) => (
              <option key={h.id} value={String(h.id)}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <div className="dc-filter-group">
          <label>Specialization</label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="dc-select"
          >
            <option value="">All specializations</option>
            {specializations.map((s) => {
              const val = optionValue(s);
              return (
                <option key={val} value={val != null ? String(val) : ""}>
                  {optionLabel(s)}
                </option>
              );
            })}
          </select>
        </div>
      </section>

      {/* Toggle: Hospitals | Doctors */}
      <section className="dc-view-toggle-wrap">
        <div className="dc-view-toggle">
          <button
            type="button"
            className={`dc-toggle-btn ${viewMode === "hospitals" ? "active" : ""}`}
            onClick={() => setViewMode("hospitals")}
          >
            <FaHospital /> Hospitals
          </button>
          <button
            type="button"
            className={`dc-toggle-btn ${viewMode === "doctors" ? "active" : ""}`}
            onClick={() => setViewMode("doctors")}
          >
            <FaUserMd /> Doctors
          </button>
        </div>
      </section>

      {viewMode === "hospitals" && (
        <section className="dc-hospitals-section">
          <h2 className="dc-section-title">
            <FaHospital /> Hospitals
          </h2>
          {hospitals.length === 0 ? (
            <div className="dc-empty">
              <p>No hospitals found.</p>
            </div>
          ) : (
            <div className="dc-hospitals-grid">
              {hospitals.map((h) => (
                <div key={h.id} className="dc-hospital-card">
                  <h3>{h.name}</h3>
                  <p className="dc-hospital-address">
                    {h.address}, {h.city}, {h.state}
                  </p>
                  {h.phone && <p className="dc-hospital-meta">📞 {h.phone}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {viewMode === "doctors" && (
        <section className="dc-doctors-section">
          <h2 className="dc-section-title">
            <FaUserMd /> Doctors
          </h2>
          {loading ? (
            <div className="dc-loading">
              <div className="dc-spinner" />
              <p>Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="dc-empty">
              <p>No doctors found. Try changing filters.</p>
            </div>
          ) : (
            <div className="dc-doctors-grid">
              {doctors.map((d) => (
                <Link
                  to={`/doctor-consultation/doctor/${d.id}`}
                  key={d.id}
                  className="dc-doctor-card"
                >
                  <div className="dc-doctor-avatar" style={{ background: "#f093fb" }}>
                    <FaUserMd />
                  </div>
                  <div className="dc-doctor-info">
                    <h3>{d.name}</h3>
                    <span className="dc-doctor-spec">
                      {typeof d.specialization === "object" && d.specialization !== null && "label" in d.specialization
                        ? d.specialization.label
                        : d.specialization}
                    </span>
                    <p className="dc-doctor-qual">{d.qualification}</p>
                    <p className="dc-doctor-fee">₹{d.consultation_fee} consultation</p>
                  </div>
                  <FaArrowRight className="dc-doctor-arrow" />
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default DoctorConsultation;
