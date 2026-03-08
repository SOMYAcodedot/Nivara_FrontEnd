import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
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

    console.log("Sending data:", formData);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login/",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Response:", response.data);

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMessage("Login Successful ✅");

      // Check if profile is complete before redirecting
      try {
        const profileRes = await axios.get(
          "http://127.0.0.1:8000/api/user/profile-status/",
          { headers: { Authorization: `Bearer ${response.data.access}` } }
        );
        
        if (profileRes.data.is_profile_complete) {
          navigate("/dashboard");
        } else {
          navigate("/profile-setup");
        }
      } catch {
        // If profile check fails, proceed to dashboard
        navigate("/dashboard");
      }

    } catch (error) {
      console.log("Error:", error.response);
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(`Login Failed ❌ - ${error.response.data.error}`);
      } else {
        setMessage("Login Failed ❌");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>

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
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>
        </form>

        <div className="switch-auth">
          Don't have an account? <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
