function scoreItem(item, query, parentMap) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const title = item.title.toLowerCase();
  const description = (item.description || "").toLowerCase();
  const language = (item.language || "").toLowerCase();

  let score = 0;
  if (title === q) score += 100;
  if (title.startsWith(q)) score += 55;
  if (title.includes(q)) score += 35;
  if (description.includes(q)) score += 18;
  if (language.includes(q)) score += 30;

  const ancestors = [];
  let parentId = item.parentId;
  while (parentId) {
    const parent = parentMap.get(parentId);
    if (!parent) break;
    ancestors.push(parent.title.toLowerCase());
    parentId = parent.parentId;
  }

  ancestors.forEach(name => {
    if (name === q) score += 40;
    else if (name.includes(q)) score += 20;
  });

  return score;
}

function searchAndSort(items, query, sort, parentMap) {
  let result = items.map(item => ({
    item,
    score: scoreItem(item, query, parentMap)
  }));

  if (query.trim()) result = result.filter(x => x.score > 0);

  result.sort((a, b) => {
    if (query.trim() && b.score !== a.score) return b.score - a.score;
    const at = new Date(a.item.createdAt).getTime();
    const bt = new Date(b.item.createdAt).getTime();
    switch (sort) {
      case "oldest": return at - bt;
      case "az": return a.item.title.localeCompare(b.item.title);
      case "za": return b.item.title.localeCompare(a.item.title);
      default: return bt - at;
    }
  });

  return result.map(x => x.item);
}
