// import React, { useEffect, useRef } from 'react';
// import individual from '../Images/Home/individual.png';
// import healthcare from '../Images/Home/healthcare.png';
// import organizations from '../Images/Home/organizations.png';
// import caregivers from '../Images/Home/caregivers.png';

// const carouselImages = [
//   { img: individual, label: 'Individuals with Mental Health Issues' },
//   { img: healthcare, label: 'Healthcare Providers' },
//   { img: organizations, label: 'Organizations' },
//   { img: caregivers, label: 'Caregivers' },
// ];

// const Carousel = () => {
//   const carouselRef = useRef(null);

//   useEffect(() => {
//     const scroll = () => {
//       if (carouselRef.current) {
//         carouselRef.current.scrollLeft += 2;
//         if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 2) {
//           carouselRef.current.scrollLeft = 0;
//         }
//       }
//     };

//     const interval = setInterval(scroll, 15); // Adjust speed here
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="carousel-section">
//     <h2 className="carousel-heading">Who We Are Helping</h2>
//     <div className="carousel-container">
//       <div className="carousel" ref={carouselRef}>
//         {[...carouselImages, ...carouselImages].map((item, index) => (
//           <div key={index} className="carousel-item">
//             <img src={item.img} alt={item.label} className="carousel-img" />
//             <p className="carousel-label">{item.label}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );
// };

// export default Carousel;
