export function getOS() {
  const ua = navigator.userAgent;

  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Macintosh/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";

  return "Unknown";
}

export function setSessionID() {
  const sessionId = window.crypto.randomUUID();
  localStorage.setItem("session_id", sessionId);
  return sessionId;
}

export function getSessionID() {
  return localStorage.getItem("session_id");
}
