<div align="center">
  <img src="https://img.shields.io/badge/ChatPulse-Real--Time%20Messaging-6366f1?style=for-the-badge&logo=socket.io&logoColor=white" alt="ChatPulse Banner" />
  
  # 💬 ChatPulse
  
  **A Premium Real-Time Chat Application**
  
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
  [![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=flat-square&logo=socket.io)](https://socket.io/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
  
  [Live Demo](#) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started)
  
</div>

---

## ✨ Features

### 💬 Core Messaging
- **Real-time messaging** with instant delivery via Socket.IO
- **Image sharing** with Cloudinary integration
- **Group chats** - Create and manage group conversations
- **Typing indicators** - See when others are typing

### 🎯 Premium Features
- **Message Reactions** 👍❤️😂😮😢😡 - React to any message with emojis
- **Read Receipts** ✓✓ - Know when your messages are read
- **Online Status** 🟢 - See who's online in real-time
- **Live Search** - Find users instantly as you type

### 🎨 Modern UI/UX
- **Glassmorphism design** with premium dark theme
- **Smooth animations** and micro-interactions
- **Fully responsive** - Works beautifully on all devices
- **Custom scrollbars** and polished details

---

## 🖼️ Screenshots

<div align="center">
  <img src="https://via.placeholder.com/800x450/1e1e2e/6366f1?text=ChatPulse+Chat+Interface" alt="Chat Interface" width="80%" />
  <p><em>Premium chat interface with glassmorphism design</em></p>
</div>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| TailwindCSS | Styling |
| Zustand | State Management |
| Socket.IO Client | Real-time Communication |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | Web Framework |
| TypeScript | Type Safety |
| MongoDB | Database |
| Mongoose | ODM |
| Socket.IO | WebSocket Server |
| JWT | Authentication |
| Cloudinary | Image Storage |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kulpreetatwork-cloud/ChatPulse.git
cd ChatPulse
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Environment Setup**

Create `.env` file in `/server`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Run the application**
```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

5. **Open in browser**
```
http://localhost:5173
```

---

## 📁 Project Structure

```
ChatPulse/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── store/          # Zustand State
│   │   ├── config/         # Chat Logic Helpers
│   │   └── utils/          # Utility Functions
│   └── ...
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── controllers/    # Route Controllers
│   │   ├── models/         # MongoDB Models
│   │   ├── routes/         # API Routes
│   │   ├── middlewares/    # Auth Middleware
│   │   └── index.ts        # Server Entry
│   └── ...
│
└── README.md
```

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user` | Register new user |
| POST | `/api/user/login` | Login user |
| GET | `/api/user?search=` | Search users |

### Chats
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Create/access chat |
| GET | `/api/chat` | Get user's chats |
| POST | `/api/chat/group` | Create group chat |
| PUT | `/api/chat/rename` | Rename group |
| PUT | `/api/chat/groupadd` | Add to group |
| PUT | `/api/chat/groupremove` | Remove from group |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/message/:chatId` | Get chat messages |
| POST | `/api/message` | Send message |
| PUT | `/api/message/:id/react` | Toggle reaction |
| PUT | `/api/message/read/:chatId` | Mark as read |

---

## 🌐 Deployment

### Frontend (Vercel)
- Connect your GitHub repository
- Set root directory to `client`
- Framework preset: Vite

### Backend (Render)
- Connect your GitHub repository
- Set root directory to `server`
- Build command: `npm install && npm run build`
- Start command: `npm start`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  
  **Built with ❤️ by [Kulpreet](https://github.com/kulpreetatwork-cloud)**
  
  ⭐ Star this repository if you found it helpful!
  
</div>
