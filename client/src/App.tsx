import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="App bg-dark-bg min-h-screen text-slate-200 font-sans">
      {/* Premium Toast Notifications */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#12121a',
            color: '#e2e8f0',
            border: '1px solid #262630',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#12121a',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#12121a',
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chats" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;