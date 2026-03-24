import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaCreditCard,
  FaWallet,
  FaUniversity,
  FaMobileAlt,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { doctorApi } from "../doctorConsultationApi";
import "./Payment.css";

const PAYMENT_METHOD_LABELS = {
  upi: "UPI",
  debit_card: "Debit Card",
  credit_card: "Credit Card",
  net_banking: "Net Banking",
  wallet: "Wallet",
};

// Indian payment validations
const UPI_ID_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
const validateUpiId = (value) => {
  if (!value || !value.trim()) return "UPI ID is required";
  const trimmed = value.trim();
  if (trimmed.length < 5) return "Enter a valid UPI ID (e.g. name@paytm)";
  if (!UPI_ID_REGEX.test(trimmed)) return "Invalid UPI ID format (e.g. yourname@paytm, yourname@ybl)";
  return "";
};
const validateCardLast4 = (value) => {
  if (!value || value.length !== 4) return "Enter last 4 digits of your card";
  if (!/^\d{4}$/.test(value)) return "Only 4 digits allowed";
  return "";
};
const validateTransactionId = (value) => {
  if (!value || !value.trim()) return "Transaction ID is required";
  if (value.trim().length < 6) return "Transaction ID must be at least 6 characters";
  return "";
};

const Payment = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [walletType, setWalletType] = useState("");

  const [initiated, setInitiated] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [initiating, setInitiating] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchBookingAndOptions = async () => {
      setLoading(true);
      setError("");
      try {
        const [bookingRes, optionsRes] = await Promise.all([
          doctorApi.getBooking(bookingId),
          doctorApi.getOptions(),
        ]);
        setBooking(bookingRes);
        setPaymentDetail(bookingRes?.payment_detail);
        setOptions(optionsRes);
        const methods = optionsRes?.payment_methods || [];
        const firstMethod = methods[0];
        const methodVal = typeof firstMethod === "object" && firstMethod != null && "value" in firstMethod ? firstMethod.value : firstMethod;
        if (methods.length && methodVal && methodVal !== paymentMethod) {
          setPaymentMethod(methodVal);
        }
      } catch (err) {
        console.error("Error loading booking:", err);
        setError(
          err.response?.data?.detail || "Failed to load booking. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) fetchBookingAndOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-fetch when bookingId changes
  }, [bookingId]);

  const paymentMethods = options?.payment_methods || [
    "upi",
    "debit_card",
    "credit_card",
    "net_banking",
    "wallet",
  ];
  const pmVal = (m) => (typeof m === "object" && m != null && "value" in m ? m.value : m);
  const pmLabel = (m) => (typeof m === "object" && m != null && "label" in m ? m.label : (PAYMENT_METHOD_LABELS[m] || m));

  const buildInitiateBody = () => {
    const body = { payment_method: paymentMethod };
    if (paymentMethod === "upi" && upiId) body.upi_id = upiId;
    if ((paymentMethod === "debit_card" || paymentMethod === "credit_card") && cardLast4) {
      body.card_last4 = cardLast4;
    }
    if (paymentMethod === "net_banking" && bankCode) body.bank_code = bankCode;
    if (paymentMethod === "wallet" && walletType) body.wallet_type = walletType;
    return body;
  };

  const validateInitiateForm = () => {
    const errors = {};
    if (paymentMethod === "upi") {
      const msg = validateUpiId(upiId);
      if (msg) errors.upiId = msg;
    }
    if (paymentMethod === "debit_card" || paymentMethod === "credit_card") {
      const msg = validateCardLast4(cardLast4);
      if (msg) errors.cardLast4 = msg;
    }
    if (paymentMethod === "net_banking") {
      if (!bankCode || !bankCode.trim()) errors.bankCode = "Please select your bank";
    }
    if (paymentMethod === "wallet") {
      if (!walletType || !walletType.trim()) errors.walletType = "Please select your wallet";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInitiate = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (!validateInitiateForm()) return;
    setInitiating(true);
    try {
      const res = await doctorApi.initiatePayment(bookingId, buildInitiateBody());
      setOrderId(res?.order_id || "");
      setTransactionId(res?.order_id || "");
      setInitiated(true);
    } catch (err) {
      console.error("Error initiating payment:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to initiate payment."
      );
    } finally {
      setInitiating(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const txError = validateTransactionId(transactionId);
    if (txError) {
      setFieldErrors({ transactionId: txError });
      return;
    }
    setConfirming(true);
    try {
      const body = { transaction_id: transactionId.trim() };
      if (paymentMethod === "upi" && upiId) body.upi_id = upiId;
      if ((paymentMethod === "debit_card" || paymentMethod === "credit_card") && cardLast4) {
        body.card_last4 = cardLast4;
      }
      if (paymentMethod === "net_banking" && bankCode) {
        body.bank_name = bankCode + " Bank";
      }
      await doctorApi.confirmPayment(bookingId, body);
      setSuccess(true);
    } catch (err) {
      console.error("Error confirming payment:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Payment confirmation failed."
      );
    } finally {
      setConfirming(false);
    }
  };

  const amount = booking?.payment_detail?.amount ?? paymentDetail?.amount ?? booking?.consultation_fee ?? 0;
  const currency = booking?.payment_detail?.currency ?? paymentDetail?.currency ?? "INR";
  const status = booking?.status;

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">
          <div className="payment-spinner" />
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="payment-page">
        <div className="payment-error-box">
          <FaExclamationTriangle className="payment-error-icon" />
          <p>{error}</p>
          <Link to="/doctor-consultation/bookings" className="payment-back-link">
            <FaArrowLeft /> My bookings
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="payment-page">
        <div className="payment-success-card">
          <FaCheckCircle className="payment-success-icon" />
          <h1>Payment successful</h1>
          <p>Your consultation is confirmed. You can view it in My Bookings.</p>
          <Link to="/doctor-consultation/bookings" className="payment-success-btn">
            View my bookings
          </Link>
        </div>
      </div>
    );
  }

  const alreadyPaid = status === "confirmed" || booking?.payment_detail?.payment_status === "completed";
  if (alreadyPaid) {
    return (
      <div className="payment-page">
        <div className="payment-success-card">
          <FaCheckCircle className="payment-success-icon" />
          <h1>Already paid</h1>
          <p>This booking has been paid and confirmed.</p>
          <Link to="/doctor-consultation/bookings" className="payment-success-btn">
            View my bookings
          </Link>
        </div>
      </div>
    );
  }

  const doctorDetail = booking?.doctor_detail || {};
  const doctorName = doctorDetail?.name || "Doctor";
  const scheduledAt = booking?.scheduled_at
    ? new Date(booking.scheduled_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <div className="payment-page">
      <Link to="/doctor-consultation/bookings" className="payment-back-link">
        <FaArrowLeft /> My bookings
      </Link>

      <div className="payment-card">
        <div className="payment-summary">
          <h1>Complete payment</h1>
          <div className="payment-summary-row">
            <span>Doctor</span>
            <strong>Dr. {doctorName}</strong>
          </div>
          <div className="payment-summary-row">
            <span>Date & time</span>
            <strong>{scheduledAt}</strong>
          </div>
          <div className="payment-summary-row total">
            <span>Amount</span>
            <strong>₹{amount} {currency !== "INR" ? currency : ""}</strong>
          </div>
        </div>

        {!initiated ? (
          <form onSubmit={handleInitiate} className="payment-form">
            <h2>Select payment method</h2>
            <div className="payment-methods">
              {paymentMethods.map((method) => {
                const mVal = pmVal(method);
                return (
                  <label
                    key={mVal}
                    className={`payment-method-option ${
                      paymentMethod === mVal ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={mVal}
                      checked={paymentMethod === mVal}
                      onChange={() => setPaymentMethod(mVal)}
                    />
                    <span className="payment-method-icon">
                      {mVal === "upi" && <FaMobileAlt />}
                      {mVal === "debit_card" && <FaCreditCard />}
                      {mVal === "credit_card" && <FaCreditCard />}
                      {mVal === "net_banking" && <FaUniversity />}
                      {mVal === "wallet" && <FaWallet />}
                    </span>
                    <span>{pmLabel(method)}</span>
                  </label>
                );
              })}
            </div>

            {paymentMethod === "upi" && (
              <div className="payment-extra-field">
                <label>UPI ID <span className="payment-required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. yourname@paytm, yourname@ybl"
                  value={upiId}
                  onChange={(e) => { setUpiId(e.target.value); setFieldErrors((prev) => ({ ...prev, upiId: "" })); }}
                  className={`payment-input ${fieldErrors.upiId ? "payment-input-error" : ""}`}
                  maxLength={50}
                />
                {fieldErrors.upiId && <span className="payment-field-error">{fieldErrors.upiId}</span>}
              </div>
            )}
            {(paymentMethod === "debit_card" || paymentMethod === "credit_card") && (
              <div className="payment-extra-field">
                <label>Card last 4 digits <span className="payment-required">*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 4242"
                  maxLength={4}
                  value={cardLast4}
                  onChange={(e) => { setCardLast4(e.target.value.replace(/\D/g, "")); setFieldErrors((prev) => ({ ...prev, cardLast4: "" })); }}
                  className={`payment-input ${fieldErrors.cardLast4 ? "payment-input-error" : ""}`}
                />
                {fieldErrors.cardLast4 && <span className="payment-field-error">{fieldErrors.cardLast4}</span>}
              </div>
            )}
            {paymentMethod === "net_banking" && (
              <div className="payment-extra-field">
                <label>Bank <span className="payment-required">*</span></label>
                <select
                  value={bankCode}
                  onChange={(e) => { setBankCode(e.target.value); setFieldErrors((prev) => ({ ...prev, bankCode: "" })); }}
                  className={`payment-select ${fieldErrors.bankCode ? "payment-input-error" : ""}`}
                >
                  <option value="">Select bank</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="KOTAK">Kotak Mahindra</option>
                </select>
                {fieldErrors.bankCode && <span className="payment-field-error">{fieldErrors.bankCode}</span>}
              </div>
            )}
            {paymentMethod === "wallet" && (
              <div className="payment-extra-field">
                <label>Wallet <span className="payment-required">*</span></label>
                <select
                  value={walletType}
                  onChange={(e) => { setWalletType(e.target.value); setFieldErrors((prev) => ({ ...prev, walletType: "" })); }}
                  className={`payment-select ${fieldErrors.walletType ? "payment-input-error" : ""}`}
                >
                  <option value="">Select wallet</option>
                  <option value="Paytm">Paytm</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Google Pay">Google Pay</option>
                  <option value="Amazon Pay">Amazon Pay</option>
                </select>
                {fieldErrors.walletType && <span className="payment-field-error">{fieldErrors.walletType}</span>}
              </div>
            )}

            {error && (
              <div className="payment-form-error">
                <FaExclamationTriangle /> {error}
              </div>
            )}

            <button
              type="submit"
              className="payment-btn payment-initiate-btn"
              disabled={initiating || (paymentMethod === "upi" && !upiId.trim()) || ((paymentMethod === "debit_card" || paymentMethod === "credit_card") && cardLast4.length !== 4) || (paymentMethod === "net_banking" && !bankCode) || (paymentMethod === "wallet" && !walletType)}
            >
              {initiating ? "Initiating..." : "Proceed to pay"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="payment-form">
            <h2>Confirm payment</h2>
            <p className="payment-order-info">
              Order ID: <strong>{orderId}</strong>
            </p>
            <div className="payment-extra-field">
              <label>Transaction ID <span className="payment-required">*</span></label>
              <input
                type="text"
                placeholder="Enter transaction ID from your payment app"
                value={transactionId}
                onChange={(e) => { setTransactionId(e.target.value); setFieldErrors((prev) => ({ ...prev, transactionId: "" })); }}
                className={`payment-input ${fieldErrors.transactionId ? "payment-input-error" : ""}`}
                minLength={6}
              />
              {fieldErrors.transactionId && <span className="payment-field-error">{fieldErrors.transactionId}</span>}
            </div>
            {error && (
              <div className="payment-form-error">
                <FaExclamationTriangle /> {error}
              </div>
            )}
            <button
              type="submit"
              className="payment-btn payment-confirm-btn"
              disabled={confirming || !transactionId.trim()}
            >
              {confirming ? "Confirming..." : "Confirm payment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Payment;
