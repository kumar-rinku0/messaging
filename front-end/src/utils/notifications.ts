// utils/notifications.js
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
    return false;
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  return permission === "granted";
};

export const showNotification = (
  title: string,
  options: NotificationOptions
) => {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};
