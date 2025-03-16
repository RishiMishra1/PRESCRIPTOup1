import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL + "/api/gemini/chat";

export const getGeminiResponse = async (prompt) => {
  console.log("🚀 API Request to:", API_URL); // Debugging log
  console.log("📤 Sending payload:", { prompt });

  try {
    const response = await axios.post(API_URL, { prompt });
    console.log("✅ API Response:", response.data);
    return response.data.response;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    return "Error: Could not fetch response.";
  }
};
