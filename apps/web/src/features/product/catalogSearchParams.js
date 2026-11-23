export function updateCatalogSearchParams(current, changes) {
  const next = new URLSearchParams(current);
  for (const [name, value] of Object.entries(changes)) {
    if (value == null || value === "") next.delete(name);
    else next.set(name, String(value));
  }
  return next;
}
