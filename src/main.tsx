import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, requestNotificationPermission } from "./utils/notifications";

// Register service worker for push notifications
registerServiceWorker();

// Request notification permission on load
if ('Notification' in window) {
  requestNotificationPermission();
}

createRoot(document.getElementById("root")!).render(<App />);
