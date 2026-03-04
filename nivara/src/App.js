// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import "./App.css";

// // Components
// import Sidebar from "./components/Sidebar";
// import Footer from "./components/Footer";
// import Carousel from "./components/Carousel";
// import Chatbot from "./components/Chatbot";

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
// import Chatbot from "./components/Chatbot";
// import TherapyBooking from "./pages/TherapyBooking"; // Uncomment if exists
// import StressRelief from "./components/StressRelief/StressRelief"; // Uncomment if exists

// Pages
import Home from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import MoodTracker from "./pages/MoodTracker/MoodTracker";
import CycleTracker from "./pages/CycleTracker/CycleTracker";

// Stress Relief Activities (Uncomment if these exist)
// import Games from "./components/StressRelief/Games/Games";
// import MemoryMatch from "./components/StressRelief/Games/MemoryMatch";
// import BubblePop from "./components/StressRelief/Games/BubblePop";
// import DoodleCanvas from "./components/StressRelief/Games/DoodleCanvas";
// import BalloonPopGame from "./components/StressRelief/Games/BalloonPopGame";
// import WordFlowPuzzle from "./components/StressRelief/Games/Wordflow";
// import MentalHealthEducation from "./components/StressRelief/Education/MentalHealthEducation";
// import CBTExercises from "./components/StressRelief/CBT/CBTExercises";
// import WordScrambleGame from "./components/StressRelief/Games/Wordscramble";

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navbar always visible */}
        <Navbar />
        {/* Main Content Area */}
        <div className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Now all routes are public */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mood-tracker" element={<MoodTracker />} />
            <Route path="/cycle-tracker" element={<CycleTracker />} />
            {/* Uncomment below if these components exist */}
            {/* <Route path="/chat" element={<Chatbot />} /> */}
            {/* <Route path="/therapy-booking" element={<TherapyBooking />} /> */}

            {/* Stress Relief */}
            {/* <Route path="/stress-relief" element={<StressRelief />} /> */}
            {/* <Route path="/stress-relief/games" element={<Games />} /> */}
            {/* <Route path="/stress-relief/games/memory" element={<MemoryMatch />} /> */}
            {/* <Route path="/stress-relief/games/bubblepop" element={<BubblePop />} /> */}
            {/* <Route path="/stress-relief/games/wordflowpuzzle" element={<WordFlowPuzzle />} /> */}
            {/* <Route path="/stress-relief/games/wordscramble" element={<WordScrambleGame />} /> */}
            {/* <Route path="/stress-relief/games/doodlecanvas" element={<DoodleCanvas />} /> */}
            {/* <Route path="/stress-relief/games/balloonpop" element={<BalloonPopGame />} /> */}
            {/* <Route path="/stress-relief/education" element={<MentalHealthEducation />} /> */}
            {/* <Route path="/stress-relief/cbt" element={<CBTExercises />} /> */}

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Footer always visible */}
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;