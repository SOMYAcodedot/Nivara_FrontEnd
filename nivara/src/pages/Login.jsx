// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   // ✅ Handle input changes
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // ✅ Handle login submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     console.log("Login Data:", formData); // ✅ Debugging Step

//     try {
//       const response = await axios.post("http://127.0.0.1:8000/api/login/", formData, {
//         headers: { "Content-Type": "application/json" },
//       });

//       console.log("Login Response:", response.data); // ✅ Debugging Step

//       if (response.status === 200 && response.data.access) {
//         // ✅ Store tokens
//         localStorage.setItem("accessToken", response.data.access);
//         localStorage.setItem("refreshToken", response.data.refresh);
//         console.log("Access Token Saved:", localStorage.getItem("accessToken"));

//         // ✅ Delay to ensure localStorage is updated
//         setTimeout(() => {
//           console.log("Redirecting to Dashboard...");
//           navigate("/dashboard");
//         }, 1000);  // 1-second delay to ensure storage updates
//       } else {
//         setError("Login failed. Please try again.");
//       }
//     } catch (error) {
//       console.error("Login Error:", error.response);

//       if (error.response && error.response.status === 401) {
//         setError("Invalid email or password.");
//       } else {
//         setError("Login failed. Please try again.");
//       }
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>Login</h2>
//       {error && <p className="error-message">{error}</p>}

//       <form onSubmit={handleSubmit} className="auth-form">
//         <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
//         <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// };

// export default Login;



import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "", // changed from email
    password: ""
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // for redirect after login

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Sending data:", formData);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Response:", response.data);

      // Save tokens in localStorage
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);

      setMessage("Login Successful ✅");

      // Redirect to dashboard
      navigate("/dashboard");

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
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username" // changed from email
          placeholder="Username"
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;