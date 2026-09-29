function linesFor(code){ return String(code||'').split(/\r\n|\r|\n/); }
function indentOf(line){ const m=/^[\t ]*/.exec(line); return m ? m[0] : ''; }

function createCodeEditor(container, initialCode='', language=''){
  let value=String(initialCode||'');
  let lang=language;
  container.innerHTML=`
    <div class="code-editor-shell">
      <div class="editor-toolbar">
        <div class="editor-language"><span class="editor-dot"></span><strong class="editor-language-name"></strong><span class="editor-hint"></span></div>
        <button type="button" class="small-button" data-editor-copy></button>
      </div>
      <div class="editor-body">
        <div class="line-numbers" aria-hidden="true"><div class="line-numbers-inner"></div></div>
        <div class="editor-code-area">
          <pre class="highlight-layer" aria-hidden="true"><code></code></pre>
          <textarea class="editor-input" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>
        </div>
      </div>
    </div>`;
  const textarea=container.querySelector('.editor-input');
  const code=container.querySelector('.highlight-layer code');
  const numbers=container.querySelector('.line-numbers-inner');
  const name=container.querySelector('.editor-language-name');
  const hint=container.querySelector('.editor-hint');
  const copy=container.querySelector('[data-editor-copy]');
  name.textContent=lang||t('codeLabel');
  hint.textContent=t('tabHint');
  copy.textContent=t('copy');
  textarea.value=value;

  function render(){
    value=textarea.value;
    const ls=linesFor(value);
    numbers.innerHTML=ls.map((_,i)=>`<span>${i+1}</span>`).join('');
    code.innerHTML=(highlight(value,lang) || (value ? escapeHtml(value) : ''))+'\n';
    syncScroll();
  }
  function syncScroll(){
    numbers.style.transform=`translateY(${-textarea.scrollTop}px)`;
  }
  textarea.addEventListener('wheel', e=>{
    if(e.deltaY || e.deltaX){
      textarea.scrollTop += e.deltaY;
      textarea.scrollLeft += e.deltaX;
      syncScroll();
      e.preventDefault();
    }
  }, {passive:false});
  textarea.addEventListener('input',render);
  textarea.addEventListener('scroll',syncScroll);
  textarea.addEventListener('keydown',e=>{
    if(e.key==='Tab'){
      e.preventDefault(); const s=textarea.selectionStart, end=textarea.selectionEnd;
      textarea.setRangeText('    ',s,end,'end'); render();
    } else if(e.key==='Enter'){
      const s=textarea.selectionStart; const before=textarea.value.slice(0,s); const line=before.slice(before.lastIndexOf('\n')+1); const indent=indentOf(line);
      if(indent){ e.preventDefault(); textarea.setRangeText('\n'+indent,s,textarea.selectionEnd,'end'); render(); }
    }
  });
  copy.addEventListener('click',async()=>{
    if (await copyText(textarea.value)) showToast(t('copied'));
    else showToast(t('clipboardFailed'),'error');
  });
  render();
  return { getValue:()=>textarea.value, setLanguage:(next)=>{lang=next;name.textContent=next||t('codeLabel');render();}, focus:()=>textarea.focus(), textarea };
}

function highlightCode(code,language){return highlight(code,language);}
