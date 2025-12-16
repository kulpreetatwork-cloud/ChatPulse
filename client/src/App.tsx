import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import { Toaster } from "react-hot-toast"; // <--- Import this

function App() {
  return (
    <div className="App bg-slate-900 min-h-screen text-slate-200 font-sans">
      {/* This component renders the notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;