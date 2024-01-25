export function getLocalStorage(key: string) {
  if (!key) return '';
  return JSON.parse(localStorage.getItem(key) || '{}');
}
