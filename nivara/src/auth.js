// import axios from "axios";

// export const refreshToken = async () => {
//   const refresh = localStorage.getItem("refreshToken"); // ✅ Get refresh token

//   if (!refresh) {
//     console.error("No refresh token found!");
//     return null;
//   }

//   try {
//     const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
//       refresh: refresh, // ✅ Send refresh token in request
//     });

//     localStorage.setItem("accessToken", response.data.access); // ✅ Save new access token
//     return response.data.access;
//   } catch (error) {
//     console.error("Token refresh failed:", error.response);
//     return null;
//   }
// };





export const isAuthenticated = () => {
  return localStorage.getItem("accessToken") ? true : false;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};