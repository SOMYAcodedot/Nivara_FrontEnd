// import React from "react";
// import "../App.css";

// // Replace these image URLs with real doctor photos
// const therapists = [
//   {
//     id: 1,
//     name: "Dr. Somya",
//     specialization: "Cognitive Behavioral Therapy",
//     image: "https://via.placeholder.com/150",
//     rating: 4.5,
//     description:
//       "Dr. Somya helps individuals overcome negative thought patterns using CBT techniques. With over 8 years of experience, she specializes in emotional regulation and thought restructuring.",
//   },
//   {
//     id: 2,
//     name: "Dr. Prajwal",
//     specialization: "Mindfulness Therapy",
//     image: "https://via.placeholder.com/150",
//     rating: 4.8,
//     description:
//       "Dr. Prajwal guides clients through mindful awareness to reduce stress and anxiety. He blends meditation with cognitive strategies to improve daily mental clarity.",
//   },
//   {
//     id: 3,
//     name: "Dr. Archin",
//     specialization: "Depression & Anxiety",
//     image: "https://via.placeholder.com/150",
//     rating: 4.2,
//     description:
//       "Dr. Archin offers compassionate support for individuals facing depression and anxiety. His approach includes personalized therapy plans and behavioral techniques.",
//   },
//   {
//     id: 4,
//     name: "Dr. Vivek",
//     specialization: "Stress Management",
//     image: "https://via.placeholder.com/150",
//     rating: 4.7,
//     description:
//       "With a calm demeanor and practical strategies, Dr. Vivek empowers people to manage stress and build resilience. He’s known for his motivational sessions and lifestyle tips.",
//   },
// ];

// const TherapistList = ({ onSelectTherapist }) => {
//   const getStars = (rating) => {
//     const fullStars = Math.floor(rating);
//     const halfStar = rating % 1 >= 0.5;
//     const stars = [];
//     for (let i = 0; i < fullStars; i++) stars.push("★");
//     if (halfStar) stars.push("☆");
//     while (stars.length < 5) stars.push("☆");
//     return stars.join(" ");
//   };

//   const cardStyle = {
//     backgroundColor: "#fce4ec",
//     borderRadius: "15px",
//     padding: "20px",
//     width: "100%",
//     maxWidth: "280px",
//     textAlign: "center",
//     boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//     transition: "transform 0.3s, box-shadow 0.3s",
//   };

//   const imageStyle = {
//     width: "100%",
//     height: "180px",
//     objectFit: "cover",
//     borderRadius: "15px",
//     marginBottom: "15px",
//   };

//   const buttonStyle = {
//     backgroundColor: "#ba68c8",
//     color: "white",
//     border: "none",
//     padding: "12px 20px",
//     borderRadius: "5px",
//     cursor: "pointer",
//     fontSize: "16px",
//     transition: "background-color 0.3s",
//   };

//   const buttonHoverStyle = {
//     backgroundColor: "#ab47bc",
//   };

//   const handleMouseEnter = (e) => {
//     e.currentTarget.style.transform = "scale(1.05)";
//     e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
//   };

//   const handleMouseLeave = (e) => {
//     e.currentTarget.style.transform = "scale(1)";
//     e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
//   };

//   return (
//     <div className="therapist-list-container" style={{ padding: "20px", textAlign: "center" }}>
//       <h2 style={{ fontSize: "2.5em", marginBottom: "30px", color: "#ad1457" }}>
//         Meet Our Experts
//       </h2>
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(2, 1fr)",
//           gap: "20px",
//           justifyItems: "center",
//           marginTop: "30px",
//         }}
//       >
//         {therapists.map((therapist) => (
//           <div
//             key={therapist.id}
//             style={cardStyle}
//             onMouseEnter={handleMouseEnter}
//             onMouseLeave={handleMouseLeave}
//           >
//             <img
//               src={therapist.image}
//               alt={therapist.name}
//               style={imageStyle}
//             />
//             <h3 style={{ color: "#8e24aa" }}>{therapist.name}</h3>
//             <p style={{ fontStyle: "italic", color: "#8e24aa", margin: "10px 0" }}>
//               {therapist.specialization}
//             </p>
//             <p style={{ fontSize: "18px", color: "#f06292", margin: "5px 0" }}>
//               {getStars(therapist.rating)} ({therapist.rating})
//             </p>
//             <p style={{ color: "#555", marginBottom: "15px" }}>
//               {therapist.description}
//             </p>
//             <button
//               onClick={() => onSelectTherapist(therapist)}
//               style={buttonStyle}
//               onMouseOver={(e) => (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)}
//               onMouseOut={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
//             >
//               Book Now
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default TherapistList;