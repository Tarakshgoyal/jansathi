export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const showNotification = (title: string, body: string, url?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });

    notification.onclick = () => {
      window.focus();
      if (url) {
        window.location.href = url;
      }
      notification.close();
    };
  }
};

export const subscribeToStatusUpdates = (reportId: string, onUpdate: (status: string) => void) => {
  // This will be used to listen for real-time updates from Supabase
  // Implementation will depend on your backend setup
  console.log('Subscribed to updates for report:', reportId);
};
