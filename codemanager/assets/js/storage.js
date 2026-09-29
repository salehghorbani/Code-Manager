function cloneDefault() { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }

function normalizeItem(item) {
  if (!item || typeof item !== "object") return null;
  if (!["code", "folder"].includes(item.type)) return null;
  if (typeof item.id !== "string" || !item.id.trim() || typeof item.title !== "string") return null;
  const base = {
    id: item.id.trim(), type: item.type, title: item.title.trim(),
    description: typeof item.description === "string" ? item.description : "",
    parentId: item.parentId === null || typeof item.parentId === "string" ? item.parentId : null,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString()
  };
  if (!base.title) return null;
  if (item.type === "code") {
    base.language = typeof item.language === "string" ? item.language : "";
    base.code = typeof item.code === "string" ? item.code : "";
  }
  return base;
}

function validateState(raw) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.items)) throw new Error("INVALID_STATE");
  const items = raw.items.map(normalizeItem);
  if (items.some(x => !x)) throw new Error("INVALID_ITEM");
  const ids = new Set();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error("DUPLICATE_ID");
    ids.add(item.id);
  }
  for (const item of items) {
    if (item.parentId !== null) {
      const parent = items.find(x => x.id === item.parentId);
      if (!parent || parent.type !== "folder") throw new Error("INVALID_PARENT");
      if (parent.id === item.id) throw new Error("SELF_PARENT");
    }
  }
  for (const item of items) {
    const seen = new Set([item.id]); let parentId = item.parentId;
    while (parentId !== null) {
      if (seen.has(parentId)) throw new Error("FOLDER_CYCLE");
      seen.add(parentId);
      const parent = items.find(x => x.id === parentId);
      parentId = parent?.parentId ?? null;
    }
  }
  return {
    version: DATA_VERSION,
    metadata: { app: "Code Manager", schemaVersion: DATA_VERSION,
      createdAt: raw.metadata?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() },
    items
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? validateState(JSON.parse(raw)) : cloneDefault();
  } catch { return cloneDefault(); }
}

function saveState(state) {
  const safe = validateState(state);
  safe.metadata.updatedAt = new Date().toISOString();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(safe)); return safe; }
  catch { throw new Error("STORAGE_UNAVAILABLE"); }
}

function exportState(state) { return JSON.stringify(validateState(state), null, 2); }
function createId(prefix) {
  try { if (crypto && typeof crypto.randomUUID === "function") return `${prefix}-${crypto.randomUUID()}`; } catch {}
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
