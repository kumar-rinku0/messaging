export function getOS() {
  return (navigator as any).userAgentData?.platform || "Unknown";
}

export function setSessionID() {
  const sessionId = window.crypto.randomUUID();
  localStorage.setItem("session_id", sessionId);
  return sessionId;
}

export function getSessionID() {
  return localStorage.getItem("session_id");
}
