// Order history without registration: the browser gets a random id once and sends it
// to the backend in the X-Client-Id header. Orders placed with the same id form "My orders".
const STORAGE_KEY = 'cc_client_id';
const VALID_ID = /^[A-Za-z0-9-]{16,64}$/;

let memoryId: string | null = null;

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getClientId(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_ID.test(saved)) return saved;

    const created = generateId();
    localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    // localStorage can be blocked (private mode): keep the id for this session only.
    if (!memoryId) memoryId = generateId();
    return memoryId;
  }
}
