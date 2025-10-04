import { io } from "socket.io-client";

export const socket = io("http://localhost:5000");

export const connectSocket = () => {
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

// Socket event handlers
export const onTradeCreated = (callback: (data: any) => void) => {
  socket.on("trade:created", callback);
};

export const onTradeUpdated = (callback: (data: any) => void) => {
  socket.on("trade:updated", callback);
};

export const onTradeBulkImported = (callback: (data: any) => void) => {
  socket.on("trade:bulkImported", callback);
};

export const removeAllListeners = () => {
  socket.removeAllListeners();
};
