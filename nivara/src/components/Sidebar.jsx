// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const [isOpen, setIsOpen] = useState(true); // Sidebar is open by default

//   // Function to check if user is authenticated
//   const isAuthenticated = () => {
//     return !!localStorage.getItem("accessToken");
//   };

//   // Handle Dashboard Click
//   const handleDashboardClick = (e) => {
//     if (!isAuthenticated()) {
//       e.preventDefault(); // Prevent navigation
//       alert("You need to log in first!"); // Show a message
//       navigate("/login"); // Redirect to Login
//     }
//   };

//   // Handle Logout
//   const handleLogout = () => {
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     navigate("/login"); // Redirect to Login
//   };

//   // Toggle sidebar open/close
//   const toggleSidebar = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
//       {/* Sidebar Toggle Button */}
//       <button className="toggle-btn" onClick={toggleSidebar}>
//         {isOpen ? "◀" : "▶"}
//       </button>

//       {/* Sidebar Links */}
//       <ul>
//         <li><Link to="/">Home</Link></li>
//         <li><Link to="/dashboard" onClick={handleDashboardClick}>Dashboard</Link></li>
//         <li><Link to="/about">About</Link></li>
//         <li><Link to="/contact">Contact</Link></li>
//         {isAuthenticated() && (
//           <li>
//             <button className="logout-btn" onClick={handleLogout}>Logout</button>
//           </li>
//         )}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;




