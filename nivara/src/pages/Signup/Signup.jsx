import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Sending signup data:", formData);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/signup/",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Signup Response:", response.data);

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMessage("Signup Successful ✅");

      // Redirect to profile setup for new users
      setTimeout(() => {
        navigate("/profile-setup");
      }, 1000);

    } catch (error) {
      console.log("Signup Error:", error.response);
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(`Signup Failed ❌ - ${error.response.data.error}`);
      } else {
        setMessage("Signup Failed ❌");
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Sign Up</h2>

        {message && <p className={message.includes('✅') ? 'success-message' : 'error-message'}>{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button type="submit">Sign Up</button>
        </form>

        <div className="switch-auth">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
