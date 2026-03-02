import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaTachometerAlt, FaInfoCircle, FaEnvelope, FaSignOutAlt, FaTimes, FaBrain } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = () => {
    return !!localStorage.getItem("access_token");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { path: "/", icon: <FaHome />, label: "Home" },
    { path: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard", protected: true },
    { path: "/about", icon: <FaInfoCircle />, label: "About" },
    { path: "/contact", icon: <FaEnvelope />, label: "Contact" },
  ];

  const handleProtectedClick = (e, item) => {
    if (item.protected && !isAuthenticated()) {
      e.preventDefault();
      alert("Please login to access this page");
      navigate("/login");
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaBrain className="logo-icon" />
            <span>Nivara</span>
          </div>
          <button className="sidebar-close" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                  onClick={(e) => handleProtectedClick(e, item)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {isAuthenticated() && (
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
