let state = loadState();
let currentFolderId = null;
let searchQuery = "";
let sortMode = "newest";
let filterLanguages = new Set();
let selectedIds = new Set();

const settings = loadSettings();
if (settings.sortMode) sortMode = settings.sortMode;
if (Array.isArray(settings.filterLanguages)) filterLanguages = new Set(settings.filterLanguages);
if (typeof settings.currentFolderId === "string") currentFolderId = settings.currentFolderId;
if (typeof settings.searchQuery === "string") searchQuery = settings.searchQuery;

function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
  catch { return {}; }
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* settings are non-critical */ }
}

function persistUIState() { settings.sortMode=sortMode; settings.filterLanguages=[...filterLanguages]; settings.currentFolderId=currentFolderId; settings.searchQuery=searchQuery; saveSettings(); }

function initialize() {
  setLanguage(getLanguage());
  if (settings.theme === "dark") document.documentElement.dataset.theme = "dark";
  renderLanguageMenu();
  document.getElementById("searchInput").value = searchQuery;
  persistUIState();
  applyI18n();
  bindEvents();
  render();
}

function bindEvents() {
  document.getElementById("homeButton").addEventListener("click", () => {
    currentFolderId = null;
    searchQuery = "";
    persistUIState();
    document.getElementById("searchInput").value = "";
    render();
  });

  document.getElementById("newFolderButton").addEventListener("click", () => openFolderModal());
  document.getElementById("newCodeButton").addEventListener("click", () => openCodeModal());
  document.getElementById("searchInput").addEventListener("input", e => {
    searchQuery = e.target.value;
    persistUIState();
    renderExplorer();
  });

  document.getElementById("themeButton").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme === "dark";
    if (dark) delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = "dark";
    settings.theme = dark ? "light" : "dark";
    saveSettings();
  });

  document.getElementById("languageButton").addEventListener("click", () => {
    document.getElementById("languageMenu").classList.toggle("hidden");
  });

  document.getElementById("backupButton").addEventListener("click", backupAll);
  document.getElementById("importButton").addEventListener("click", () => document.getElementById("importFileInput").click());
  document.getElementById("importFileInput").addEventListener("change", handleImport);

  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      document.getElementById("searchInput").focus();
    }
    if (e.key === "Escape") document.getElementById("languageMenu").classList.add("hidden");
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") { e.preventDefault(); openCodeModal(); }
  });

  document.getElementById("sortButton").addEventListener("click", cycleSort);
  document.getElementById("filterButton").addEventListener("click", openFilterModal);
  document.getElementById("selectVisibleButton")?.addEventListener("click", toggleSelectVisible);
  document.getElementById("bulkDeleteButton")?.addEventListener("click", bulkDelete);
  document.getElementById("bulkMoveButton")?.addEventListener("click", openBulkMoveModal);
  document.getElementById("bulkClearButton")?.addEventListener("click", () => { selectedIds.clear(); renderExplorer(); });
}

function render() {
  applyI18n();
  renderStats();
  renderBreadcrumb();
  renderExplorer();
}

function childrenOf(parentId) {
  return state.items.filter(item => item.parentId === parentId);
}

function renderStats() {
  const codes = state.items.filter(x => x.type === "code");
  const folders = state.items.filter(x => x.type === "folder");
  const languages = new Set(codes.map(x => x.language).filter(Boolean));

  document.getElementById("statsGrid").innerHTML = [
    [t("totalCodes"), codes.length],
    [t("folders"), folders.length],
    [t("languages"), languages.size]
  ].map(([label, value]) => `
    <div class="stat-card">
      <div class="stat-label">${escapeHTML(label)}</div>
      <div class="stat-value">${value}</div>
    </div>`).join("");
}

function getPath(folderId) {
  const path = [];
  let id = folderId;
  while (id) {
    const folder = state.items.find(x => x.id === id && x.type === "folder");
    if (!folder) break;
    path.unshift(folder);
    id = folder.parentId;
  }
  return path;
}

function renderBreadcrumb() {
  const root = document.getElementById("breadcrumb");
  const path = getPath(currentFolderId);
  root.innerHTML = `
    <button type="button" data-breadcrumb-id="">${escapeHTML(t("root"))}</button>
    ${path.map(folder => `
      <span>/</span>
      <button type="button" data-breadcrumb-id="${escapeHTML(folder.id)}">${escapeHTML(folder.title)}</button>
    `).join("")}`;
  root.querySelectorAll("[data-breadcrumb-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentFolderId = btn.dataset.breadcrumbId || null;
      persistUIState();
      render();
    });
  });
}

function renderExplorer() {
  const grid = document.getElementById("explorerGrid");
  const parentMap = new Map(state.items.map(x => [x.id, x]));

  let visible = currentFolderId
    ? childrenOf(currentFolderId)
    : childrenOf(null);

  if (searchQuery.trim()) {
    visible = searchAndSort(state.items, searchQuery, sortMode, parentMap);
  } else {
    visible = searchAndSort(visible, "", sortMode, parentMap);
  }

  if (filterLanguages.size) {
    visible = visible.filter(item =>
      item.type === "folder" ? folderContainsLanguage(item.id) :
      filterLanguages.has(item.language)
    );
  }

  selectedIds = new Set([...selectedIds].filter(id => state.items.some(x => x.id === id)));
  document.getElementById("resultCount").textContent = `${visible.length} ${t("items")}`;
  renderBulkBar(visible);

  if (!visible.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div>
          <div class="empty-icon">⌁</div>
          <strong>${escapeHTML(searchQuery ? t("noResults") : (currentFolderId ? t("emptyFolder") : t("empty")))}</strong>
        </div>
      </div>`;
    return;
  }

  grid.innerHTML = visible.map(item => item.type === "folder"
    ? folderCard(item)
    : codeCard(item)).join("");

  bindCardActions();
}

function folderContainsLanguage(folderId) {
  const stack = [folderId];
  while (stack.length) {
    const id = stack.pop();
    for (const child of childrenOf(id)) {
      if (child.type === "code" && filterLanguages.has(child.language)) return true;
      if (child.type === "folder") stack.push(child.id);
    }
  }
  return false;
}

function folderCard(folder) {
  const count = countDescendants(folder.id);
  return `
    <article class="item-card folder" data-open-folder="${escapeHTML(folder.id)}">
      <label class="select-box" title="${escapeHTML(t("select"))}"><input type="checkbox" data-select-item="${escapeHTML(folder.id)}" ${selectedIds.has(folder.id)?"checked":""}><span></span></label>
      <div class="card-top">
        <span class="item-icon"><img src="assets/icons/folder.png" width="35px" height="35px" alt="folder"></span>
        <span class="language-pill">${count} ${escapeHTML(t("items"))}</span>
      </div>
      <div class="item-title">${escapeHTML(folder.title)}</div>
      <div class="item-description">${escapeHTML(folder.description || "")}</div>
      <div class="card-footer">
        <span class="card-meta">${escapeHTML(t("folder"))}</span>
        <div class="card-actions">
          <button class="small-button" type="button" data-edit="${escapeHTML(folder.id)}">${escapeHTML(t("edit"))}</button>
          <button class="small-button danger" type="button" data-delete="${escapeHTML(folder.id)}">${escapeHTML(t("delete"))}</button>
        </div>
      </div>
    </article>`;
}

function codeCard(code) {
  const lines = code.code ? code.code.split(/\r\n|\r|\n/).length : 0;
  return `
    <article class="item-card">
      <label class="select-box" title="${escapeHTML(t("select"))}"><input type="checkbox" data-select-item="${escapeHTML(code.id)}" ${selectedIds.has(code.id)?"checked":""}><span></span></label>
      <div class="card-top">
        ${iconForLanguage(code.language)}
        <span class="language-pill">${escapeHTML(code.language)}</span>
      </div>
      <div class="item-title">${escapeHTML(code.title)}</div>
      <div class="item-description">${escapeHTML(code.description || "")}</div>
      <div class="card-footer">
        <span class="card-meta">${lines} ${escapeHTML(t("lines"))}</span>
        <div class="card-actions">
          <button class="small-button" type="button" data-view="${escapeHTML(code.id)}">${escapeHTML(t("view"))}</button>
          <button class="small-button" type="button" data-edit="${escapeHTML(code.id)}">${escapeHTML(t("edit"))}</button>
          <button class="small-button danger" type="button" data-delete="${escapeHTML(code.id)}">${escapeHTML(t("delete"))}</button>
        </div>
      </div>
    </article>`;
}

function countDescendants(folderId) {
  let count = 0;
  const stack = [folderId];
  while (stack.length) {
    const id = stack.pop();
    const children = childrenOf(id);
    count += children.length;
    children.filter(x => x.type === "folder").forEach(x => stack.push(x.id));
  }
  return count;
}

function renderBulkBar(visible) {
  const bar=document.getElementById('bulkBar'); if(!bar) return;
  bar.classList.toggle('hidden', selectedIds.size===0);
  const count=bar.querySelector('[data-selected-count]'); if(count) count.textContent=`${selectedIds.size} ${t('selected')}`;
}
function toggleSelectVisible(){
  const visibleIds=[...document.querySelectorAll('[data-select-item]')].map(x=>x.dataset.selectItem);
  const all=visibleIds.length && visibleIds.every(id=>selectedIds.has(id));
  visibleIds.forEach(id=>all?selectedIds.delete(id):selectedIds.add(id)); renderExplorer();
}
function bulkDelete(){
  if(!selectedIds.size) return;
  if(!confirmAction(t('bulkDeleteConfirm'))) return;
  const removeIds=new Set(selectedIds); let changed=true;
  while(changed){ changed=false; for(const child of state.items){ if(child.parentId && removeIds.has(child.parentId) && !removeIds.has(child.id)){ removeIds.add(child.id); changed=true; } } }
  state.items=state.items.filter(x=>!removeIds.has(x.id));
  if(currentFolderId && removeIds.has(currentFolderId)) currentFolderId=null;
  selectedIds.clear(); persist(); render(); showToast(t('deleted'));
}
function openBulkMoveModal(){
  if(!selectedIds.size) return;
  const folders=state.items.filter(x=>x.type==='folder' && !selectedIds.has(x.id));
  const html=`<div class="field"><label>${escapeHTML(t('moveTo'))}</label><select id="bulkMoveTarget"><option value="">${escapeHTML(t('home'))}</option>${folders.map(f=>`<option value="${escapeHTML(f.id)}">${escapeHTML(getPath(f.id).map(x=>x.title).join(' / '))}</option>`).join('')}</select></div>`;
  modal({title:t('moveSelected'),bodyHTML:html,submitText:t('move'),onSubmit:({root})=>{
    const target=root.querySelector('#bulkMoveTarget').value||null;
    for(const id of selectedIds){ const item=state.items.find(x=>x.id===id); if(!item) continue; if(target && (id===target || (item.type==='folder' && isDescendant(target,id)))) { showToast(t('moveInvalid'),'error'); return false; } item.parentId=target; item.updatedAt=new Date().toISOString(); }
    selectedIds.clear(); persist(); render(); showToast(t('moved')); return true;
  }});
}

function bindCardActions() {
  document.querySelectorAll('[data-select-item]').forEach(input => input.addEventListener('click', e => { e.stopPropagation(); const id=input.dataset.selectItem; input.checked ? selectedIds.add(id) : selectedIds.delete(id); renderExplorer(); }));

  document.querySelectorAll("[data-open-folder]").forEach(el => el.addEventListener("click", e => {
    if (e.target.closest("button")) return;
    currentFolderId = el.dataset.openFolder;
    render();
  }));

  document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => {
    const item = state.items.find(x => x.id === btn.dataset.view);
    if (item) openCodeViewer(item);
  }));

  document.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => {
    const item = state.items.find(x => x.id === btn.dataset.edit);
    if (!item) return;
    item.type === "folder" ? openFolderModal(item) : openCodeModal(item);
  }));

  document.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => {
    deleteItem(btn.dataset.delete);
  }));
  document.querySelectorAll(".item-card").forEach(card => {
    const id = card.dataset.openFolder || card.querySelector('[data-view]')?.dataset.view;
    if (!id) return;
    card.draggable = true;
    card.addEventListener("dragstart", e => { e.dataTransfer.setData("text/plain", id); e.dataTransfer.effectAllowed = "move"; card.classList.add("dragging"); });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
  });
  document.querySelectorAll("[data-open-folder]").forEach(card => {
    card.addEventListener("dragover", e => { e.preventDefault(); card.classList.add("drag-over"); });
    card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
    card.addEventListener("drop", e => { e.preventDefault(); card.classList.remove("drag-over"); moveItem(e.dataTransfer.getData("text/plain"), card.dataset.openFolder); });
  });
}

function openFolderModal(existing = null) {
  const isEdit = Boolean(existing);
  const { root } = modal({
    title: isEdit ? t("editFolder") : t("createFolder"),
    submitText: isEdit ? t("save") : t("create"),
    bodyHTML: `
      <div class="form-grid">
        <div class="field">
          <label for="folderTitle">${escapeHTML(t("title"))}</label>
          <input id="folderTitle" maxlength="160" value="${escapeHTML(existing?.title || "")}">
          <div class="field-error" id="folderTitleError"></div>
        </div>
        <div class="field">
          <label for="folderDescription">${escapeHTML(t("description"))}</label>
          <textarea id="folderDescription" maxlength="2000">${escapeHTML(existing?.description || "")}</textarea>
        </div>
      </div>`,
    onSubmit: ({ close }) => {
      const titleEl = root.querySelector("#folderTitle");
      const title = titleEl.value.trim();
      const error = root.querySelector("#folderTitleError");
      if (!title) { error.textContent = t("requiredTitle"); return false; }

      if (existing) {
        existing.title = title;
        existing.description = root.querySelector("#folderDescription").value;
        existing.updatedAt = new Date().toISOString();
        persist();
        showToast(t("folderUpdated"));
      } else {
        state.items.push({
          id: createId("folder"), type: "folder", title,
          description: root.querySelector("#folderDescription").value,
          parentId: currentFolderId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        persist();
        showToast(t("folderCreated"));
      }
      render();
      return true;
    }
  });
  root.querySelector("#folderTitle").focus();
}

function openCodeModal(existing = null) {
  const isEdit = Boolean(existing);
  const options = LANGUAGES.map(lang => `<option value="${escapeHTML(lang)}" ${existing?.language === lang ? "selected" : ""}>${escapeHTML(lang)}</option>`).join("");
  let editor;
  const { root } = modal({
    title: isEdit ? t("editCode") : t("createCode"), submitText: isEdit ? t("save") : t("create"), wide:true,
    bodyHTML:`<div class="form-grid code-form-grid">
      <div class="field"><label for="codeTitle">${escapeHTML(t("title"))}</label><input id="codeTitle" maxlength="160" value="${escapeHTML(existing?.title || "")}"><div class="field-error" id="codeTitleError"></div></div>
      <div class="field"><label for="codeDescription">${escapeHTML(t("description"))}</label><textarea id="codeDescription" maxlength="4000">${escapeHTML(existing?.description || "")}</textarea></div>
      <div class="field"><label for="codeLanguage">${escapeHTML(t("language"))}</label><select id="codeLanguage"><option value="">—</option>${options}</select><div class="field-error" id="codeLanguageError"></div></div>
      <div class="field editor-field"><label>${escapeHTML(t("code"))}</label><div id="codeEditorMount"></div></div>
    </div>`,
    onSubmit:({root})=>{
      const title=root.querySelector('#codeTitle').value.trim(), language=root.querySelector('#codeLanguage').value;
      root.querySelector('#codeTitleError').textContent=title?'':t('requiredTitle');
      root.querySelector('#codeLanguageError').textContent=language?'':t('requiredLanguage');
      if(!title||!language)return false;
      const now=new Date().toISOString();
      if(existing){Object.assign(existing,{title,description:root.querySelector('#codeDescription').value,language,code:editor?.getValue()||'',updatedAt:now}); showToast(t('codeUpdated'));}
      else {state.items.push({id:createId('code'),type:'code',title,description:root.querySelector('#codeDescription').value,language,code:editor?.getValue()||'',parentId:currentFolderId,createdAt:now,updatedAt:now});showToast(t('codeCreated'));}
      persist(); render(); return true;
    }
  });
  const mount=root.querySelector('#codeEditorMount');
  editor=createCodeEditor(mount,existing?.code||'',existing?.language||'Python');
  root.querySelector('#codeLanguage').addEventListener('change',e=>editor.setLanguage(e.target.value||'Code'));
  root.querySelector('#codeTitle').focus();
}

function openCodeViewer(item) {
  const lines=String(item.code||'').split(/\r\n|\r|\n/);
  const highlighted=highlightCode(item.code||'',item.language);
  const numbers=lines.map((_,i)=>`<span>${i+1}</span>`).join('');
  const {root}=modal({title:item.title,submitText:t('edit'),wide:true,bodyHTML:`
    <div class="viewer-meta"><div>${iconForLanguage(item.language)}<strong>${escapeHTML(item.language)}</strong><span class="card-meta">${lines.length} lines</span></div><p class="muted">${escapeHTML(item.description||'')}</p></div>
    <div class="viewer-code-wrap"><div class="viewer-lines">${numbers}</div><pre class="viewer-code"><code>${highlighted}</code></pre></div>
    <div class="viewer-actions"><button class="button button-secondary" id="copyCodeButton" type="button">${escapeHTML(t('copy'))}</button></div>`,onSubmit:({close})=>{close(); openCodeModal(item); return false;}});
  root.querySelector('#copyCodeButton')?.addEventListener('click',async()=>{if(await copyText(item.code||''))showToast(t('copied'));else showToast(t('clipboardFailed'),'error');});
}

function renameItem(id) {
  const item = state.items.find(x => x.id === id);
  if (!item) return;
  const value = window.prompt(t("renamePrompt"), item.title);
  if (value === null) return;
  const title = value.trim();
  if (!title) { showToast(t("requiredTitle"), "error"); return; }
  item.title = title;
  item.updatedAt = new Date().toISOString();
  persist(); render(); showToast(t("renamed"));
}

function isDescendant(candidateId, ancestorId) {
  let current = candidateId;
  while (current) {
    if (current === ancestorId) return true;
    current = state.items.find(x => x.id === current)?.parentId || null;
  }
  return false;
}

function moveItem(itemId, folderId) {
  const item = state.items.find(x => x.id === itemId);
  const folder = state.items.find(x => x.id === folderId && x.type === "folder");
  if (!item || !folder || item.id === folder.id || isDescendant(folder.id, item.id)) { showToast(t("moveInvalid"), "error"); return; }
  item.parentId = folder.id; item.updatedAt = new Date().toISOString();
  persist(); render(); showToast(t("moved"));
}

function deleteItem(id) {
  const item = state.items.find(x => x.id === id);
  if (!item) return;
  if (!confirmAction(t("deleteConfirm"))) return;

  const removeIds = new Set([id]);
  if (item.type === "folder") {
    let changed = true;
    while (changed) {
      changed = false;
      for (const child of state.items) {
        if (child.parentId && removeIds.has(child.parentId) && !removeIds.has(child.id)) {
          removeIds.add(child.id);
          changed = true;
        }
      }
    }
  }
  state.items = state.items.filter(x => !removeIds.has(x.id));
  if (currentFolderId && removeIds.has(currentFolderId)) currentFolderId = null;
  persist();
  render();
  showToast(t("deleted"));
}

function persist() {
  try {
    state = saveState(state);
  } catch {
    showToast(t("storageUnavailable"), "error");
  }
}

function cycleSort() {
  const order = ["newest","oldest","az","za"];
  sortMode = order[(order.indexOf(sortMode) + 1) % order.length];
  persistUIState();
  renderExplorer();
  showToast({newest:t("newest"),oldest:t("oldest"),az:t("az"),za:t("za")}[sortMode]);
}

function openFilterModal() {
  const selected = new Set(filterLanguages);
  const html = `
    <div class="field">
      <label>${escapeHTML(t("language"))}</label>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:7px;max-height:360px;overflow:auto;">
        ${LANGUAGES.map(lang => `
          <label style="display:flex;gap:7px;align-items:center;padding:8px;border:1px solid var(--border);border-radius:9px;">
            <input type="checkbox" data-filter-language value="${escapeHTML(lang)}" ${selected.has(lang) ? "checked" : ""}>
            <span>${escapeHTML(lang)}</span>
          </label>`).join("")}
      </div>
    </div>`;

  modal({
    title: t("filter"),
    bodyHTML: html,
    submitText: t("save"),
    onSubmit: ({ root }) => {
      filterLanguages = new Set([...root.querySelectorAll("[data-filter-language]:checked")].map(x => x.value));
      persistUIState();
      renderExplorer();
      return true;
    }
  });
}

function renderLanguageMenu() {
  const menu = document.getElementById("languageMenu");
  menu.innerHTML = [
    ["en","English (EN)"],["fa","فارسی (FA)"],["ar","العربية (AR)"]
  ].map(([id,label]) => `<button type="button" data-lang="${id}">${label}</button>`).join("");
  menu.querySelectorAll("[data-lang]").forEach(btn => btn.addEventListener("click", () => {
    setLanguage(btn.dataset.lang);
    document.getElementById("languageButton").textContent = btn.dataset.lang.toUpperCase();
    document.getElementById("languageMenu").classList.add("hidden");
    render();
  }));
  document.getElementById("languageButton").textContent = getLanguage().toUpperCase();
}

function backupAll() {
  const roots = state.items.filter(x => !x.parentId);
  const languages = [...new Set(state.items.filter(x => x.type === "code").map(x => x.language))].sort((a,b)=>a.localeCompare(b));
  const html = `<div class="backup-picker">
    <div class="backup-toolbar">
      <button class="small-button" type="button" id="backupSelectAll">${escapeHTML(t("selectAll"))}</button>
      <button class="small-button" type="button" id="backupClearAll">${escapeHTML(t("clearAll"))}</button>
    </div>
    <div class="backup-language-filter"><strong>${escapeHTML(t("backupLanguages"))}</strong><div class="backup-language-grid">
      ${languages.map(lang=>`<label><input type="checkbox" data-backup-language value="${escapeHTML(lang)}"><span>${escapeHTML(lang)}</span></label>`).join("") || `<span class="muted">${escapeHTML(t("noLanguages"))}</span>`}
    </div></div>
    <div class="backup-tree">${roots.map(item=>backupNode(item)).join("") || `<div class="empty-state small"><strong>${escapeHTML(t("empty"))}</strong></div>`}</div>
    <p class="muted backup-note">${escapeHTML(t("backupRecursive"))}</p>
  </div>`;
  const {root}=modal({title:t("backup"),bodyHTML:html,submitText:t("download"),wide:true,onSubmit:({root})=>{
    const ids=new Set([...root.querySelectorAll('[data-backup-id]:checked')].map(x=>x.value));
    if(!ids.size){showToast(t('selectSomething'),'error');return false;}
    const included=new Set(); ids.forEach(id=>{const item=state.items.find(x=>x.id===id); if(item?.type==='folder')collectDescendants(id,included); else if(item)included.add(item.id);});
    downloadBackup(state.items.filter(x=>included.has(x.id))); return true;
  }});
  root.querySelector('#backupSelectAll').onclick=()=>root.querySelectorAll('[data-backup-id]').forEach(x=>x.checked=true);
  root.querySelector('#backupClearAll').onclick=()=>root.querySelectorAll('[data-backup-id]').forEach(x=>x.checked=false);
  root.querySelectorAll('[data-backup-language]').forEach(input=>input.addEventListener('change',()=>{
    const lang=input.value; root.querySelectorAll('[data-backup-id]').forEach(cb=>{ const item=state.items.find(x=>x.id===cb.value); if(item?.type==='code' && item.language===lang) cb.checked=input.checked; });
  }));
}
function backupNode(item){const children=childrenOf(item.id);return `<label class="backup-node"><input type="checkbox" data-backup-id value="${escapeHTML(item.id)}"><span>${item.type==='folder'?'▰':iconForLanguage(item.language)}</span><span class="backup-node-title">${escapeHTML(item.title)}</span></label>${children.length?`<div class="backup-children">${children.map(backupNode).join('')}</div>`:''}`;}
function collectDescendants(folderId,set){set.add(folderId);childrenOf(folderId).forEach(x=>x.type==='folder'?collectDescendants(x.id,set):set.add(x.id));}
function downloadBackup(items){
  const included=new Set(items.map(x=>x.id));
  const data={version:2,metadata:{app:'Code Manager',schemaVersion:2,exportedAt:new Date().toISOString(),itemCount:items.length},items:items.map(x=>({...x,parentId:x.parentId&&included.has(x.parentId)?x.parentId:null}))};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`code-manager-backup-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); showToast(t('backupSuccess'));
}

async function handleImport(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  try {
    const text = await file.text();
    const imported = validateState(JSON.parse(text));

    const idMap = new Map();
    const importedItems = imported.items.map(item => {
      const newId = createId(item.type);
      idMap.set(item.id, newId);
      return { ...item, id: newId };
    }).map(item => ({
      ...item,
      parentId: item.parentId && idMap.has(item.parentId) ? idMap.get(item.parentId) : null
    }));

    const committed = saveState({
      ...state,
      items: [...state.items, ...importedItems]
    });
    state = committed;
    selectedIds.clear();
    searchQuery = "";
    filterLanguages.clear();
    persistUIState();
    document.getElementById("searchInput").value = "";
    render();
    showToast(t("importSuccess"));
  } catch {
    showToast(t("importFailed"), "error");
  }
}

initialize();
