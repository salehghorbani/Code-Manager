function escapeHTML(value = '') {
  return String(value)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

function iconForLanguage(language) {
  const key = LANGUAGE_ICONS[language] || String(language||'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const label = escapeHTML(language || '?');
  return `<span class="language-icon language-${escapeHTML(key)}" title="${label}"><img src="assets/icons/languages/${escapeHTML(key)}.svg" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><span class="language-fallback">${escapeHTML((language||'?').slice(0,2).toUpperCase())}</span></span>`;
}

function showToast(message, type = 'success') {
  const root = document.getElementById('toastRoot');
  const toast = document.createElement('div'); toast.className = `toast ${type}`; toast.textContent = message; root.append(toast);
  setTimeout(() => toast.remove(), 2800);
}

function modal({ title, bodyHTML, onSubmit, submitText = t('save'), wide = false }) {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `<div class="modal-backdrop" data-modal-backdrop><div class="modal ${wide?'modal-wide':''}" role="dialog" aria-modal="true" aria-label="${escapeHTML(title)}"><div class="modal-head"><h2>${escapeHTML(title)}</h2><button class="small-button" type="button" data-close-modal aria-label="${escapeHTML(t('close'))}">×</button></div><div class="modal-body">${bodyHTML}<div class="modal-actions"><button class="button button-secondary" type="button" data-close-modal>${escapeHTML(t('cancel'))}</button><button class="button button-primary" type="button" data-modal-submit>${escapeHTML(submitText)}</button></div></div></div></div>`;
  const close=()=>{root.innerHTML='';};
  root.querySelectorAll('[data-close-modal]').forEach(btn=>btn.addEventListener('click',close));
  root.querySelector('[data-modal-backdrop]').addEventListener('click',e=>{if(e.target.matches('[data-modal-backdrop]'))close();});
  root.querySelector('[data-modal-submit]').addEventListener('click',()=>{if(onSubmit({close,root})!==false)close();});
  return {close,root};
}
function confirmAction(message){return window.confirm(message);}

async function copyText(text) {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(String(text ?? ""));
      return true;
    }
  } catch {}
  try {
    const area = document.createElement("textarea");
    area.value = String(text ?? "");
    area.style.position = "fixed"; area.style.opacity = "0";
    document.body.appendChild(area); area.focus(); area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch { return false; }
}
