import React, { useState } from "react";
import { getGeminiResponse } from "../context/chatService";

const Chat = ({ closeChat }) => { // Accept closeChat as a prop
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const botResponse = await getGeminiResponse(input);
      setMessages((prevMessages) => [...prevMessages, { text: botResponse, sender: "bot" }]);
    } catch (error) {
      setMessages((prevMessages) => [...prevMessages, { text: "Error getting response.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }

    setInput(""); // Reset input field
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage(); // Send message when Enter is pressed
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-4 border-2 border-gray-300 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-lg">Chatbot</span>
        <button onClick={closeChat} className="text-xl text-gray-500 hover:text-gray-800">
          &times;
        </button>
      </div>
      <div
        style={{ height: "300px", overflowY: "scroll" }}
        className="border-2 border-gray-300 rounded-t-lg p-2 mb-4"
      >
        {messages.map((msg, index) => (
          <div key={index} className={`py-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block max-w-xs p-3 rounded-lg ${msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
            >
              <strong>{msg.sender === "user" ? "You: " : "Bot: "}</strong>{msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress} // Listen for Enter key press
          placeholder="Type a message..."
          className="border-2 border-gray-300 p-2 w-full rounded-md"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chat;
