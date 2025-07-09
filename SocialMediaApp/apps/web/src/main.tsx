// File: apps/web/src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthContextProvider } from "./Context/AuthContext";
import { SocketContextProvider } from "./Context/SocketContext";
import { ChatProvider } from "./Context/ChatContext";
import { NotificationProvider } from "./contexts/NotificationContext"; // 1. Import NotificationProvider

import "./index.css";
import "../styles/_colors.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Cấu trúc bọc đúng: Context nào cần bởi context khác thì phải được bọc ở ngoài */}
      <AuthContextProvider>
        <SocketContextProvider>
          <NotificationProvider> {/* 2. Bọc App và ChatProvider bên trong */}
            <ChatProvider>
              <App />
            </ChatProvider>
          </NotificationProvider>
        </SocketContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
