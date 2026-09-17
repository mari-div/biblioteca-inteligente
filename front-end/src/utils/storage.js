export function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    // localStorage puede no estar disponible (modo privado, etc.)
  }
  return fallback;
}

export function writeLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    // silenciamos: la app debe seguir funcionando aunque no persista
  }
}
