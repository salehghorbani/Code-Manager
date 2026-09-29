const ALIASES = {
  Bash:'shell', Shell:'shell', '.env':'shell',
  HTML:'markup', XML:'markup', Vue:'markup', Svelte:'markup', JSX:'jsx', TSX:'tsx',
  CSS:'css', JSON:'json', YAML:'yaml', INI:'ini', TOML:'toml', Markdown:'markdown',
  SQL:'sql', GraphQL:'graphql', Dockerfile:'docker', PowerShell:'powershell',
  JavaScript:'javascript', TypeScript:'typescript', C:'c', 'C#':'csharp', 'C++':'cpp',
  Dart:'dart', Go:'go', Java:'java', Kotlin:'kotlin', Lua:'lua', MATLAB:'matlab',
  'Objective-C':'objective-c', Perl:'perl', PHP:'php', Python:'python', R:'r', Ruby:'ruby',
  Rust:'rust', Scala:'scala', Swift:'swift'
};

const KEYWORDS = {
  shell: 'if then else elif fi for while in do done case esac function select until time coproc local export readonly declare typeset set unset shift source alias unalias return exit trap test true false',
  javascript: 'as async await break case catch class const continue debugger default delete do else export extends finally for from function get if import in instanceof let new of return set static super switch this throw try typeof var void while with yield',
  typescript: 'as async await break case catch class const continue debugger declare default delete do else export extends finally for from function get if implements import in infer instanceof interface is keyof let module namespace never new of private protected public readonly return set static super switch this throw try type typeof var void while with yield',
  python: 'and as assert async await break case class continue def del elif else except finally for from global if import in is lambda match nonlocal not or pass raise return try while with yield True False None',
  ruby: 'BEGIN END alias and begin break case class def defined do else elsif end ensure false for if in module next nil not or redo rescue retry return self super then true undef unless until when while yield require attr_reader attr_writer',
  rust: 'as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while',
  go: 'break default func interface select case defer go map struct chan else goto package switch const fallthrough if range type continue for import return var',
  java: 'abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while true false null',
  csharp: 'abstract as base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual void volatile while async await var dynamic get set',
  cpp: 'alignas alignof and and_eq asm auto bitand bitor bool break case catch char class compl concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept not nullptr operator or private protected public register reinterpret_cast requires return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while xor',
  c: 'auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while _Bool _Complex _Imaginary',
  dart: 'abstract as assert async await break case catch class const continue covariant default deferred do dynamic else enum export extends extension external factory false final finally for Function get hide if implements import in interface is late library mixin new null on operator part required rethrow return set show static super switch sync this throw true try typedef var void while with yield',
  kotlin: 'as break class continue do else false for fun if in interface is null object package return super this throw true try typealias typeof val var when while by catch constructor delegate dynamic field file finally get import init param property receiver set setparam where actual abstract annotation companion const crossinline data enum expect external final infix inline inner internal lateinit noinline open operator out override private protected public reified sealed suspend tailrec vararg',
  lua: 'and break do else elseif end false for function goto if in local nil not or repeat return then true until while',
  php: 'and or xor __FILE__ __LINE__ array as break case class const continue declare default die do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile eval exit extends final finally fn for foreach function global goto if implements include include_once instanceof insteadof interface isset list match namespace new print private protected public readonly require require_once return static switch throw trait try unset use var while yield true false null',
  perl: 'use my our local state sub package if elsif else unless while until for foreach continue last next redo given when default return die eval require use undef',
  powershell: 'begin break catch class continue data define do dynamicparam else elseif end enum exit filter finally for foreach from function if in inline hidden param process return switch throw trap try until using var while workflow true false null',
  swift: 'associatedtype class deinit enum extension fileprivate func import init inout internal let open operator private protocol public rethrows static struct subscript typealias var break case continue default defer do else fallthrough for guard if in repeat return switch where while as Any catch false is nil super self Self throw throws try true async await actor nonisolated isolated',
  scala: 'abstract case catch class def do else extends false final finally for forSome if implicit import lazy match new null object override package private protected return sealed super this throw trait try true type val var while with yield',
  r: 'if else repeat while function for in next break TRUE FALSE NULL Inf NaN NA NA_integer_ NA_real_ NA_complex_ NA_character_',
  sql: 'select from where and or not insert into values update set delete create alter drop table view index join inner left right full outer on as distinct group by having order asc desc limit offset union all case when then else end exists null is like between in primary key foreign references constraint database schema',
  graphql: 'query mutation subscription fragment on type input interface union enum scalar schema directive extend implements repeatable',
  json: 'true false null',
  yaml: 'true false null yes no on off',
  ini: 'true false yes no on off',
  toml: 'true false',
  docker: 'FROM RUN CMD LABEL MAINTAINER EXPOSE ENV ADD COPY ENTRYPOINT VOLUME USER WORKDIR ARG ONBUILD STOPSIGNAL HEALTHCHECK SHELL',
  markdown: 'true false'
};

const sets = Object.fromEntries(Object.entries(KEYWORDS).map(([k,v]) => [k, new Set(v.split(/\s+/).filter(Boolean))]));

function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
function token(type, text){return `<span class="tok-${type}">${escapeHtml(text)}</span>`;}

function generic(source, lang){
  const set=sets[lang]||new Set();
  const re=/(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|===|!==|=>|==|!=|<=|>=|&&|\|\||\+\+|--|\*\*|[{}()[\].,;:+\-*\/%=<>!?&|])/g;
  let out='', last=0, m;
  while((m=re.exec(source))){out+=escapeHtml(source.slice(last,m.index)); const x=m[0];
    if(/^\/\//.test(x)||/^#/.test(x)||/^\/\*/.test(x)) out+=token('comment',x);
    else if(/^['"`]/.test(x)) out+=token('string',x);
    else if(/^\d/.test(x)) out+=token('number',x);
    else if(/^[A-Za-z_$]/.test(x) && set.has(x)) out+=token('keyword',x);
    else if(/^[A-Za-z_$]/.test(x) && /\s*\(/.test(source.slice(m.index+m[0].length))) out+=token('function',x);
    else if(/^[{}()[\].,;:+\-*\/%=<>!?&|]/.test(x)) out+=token('operator',x);
    else out+=escapeHtml(x);
    last=m.index+x.length;
  }
  return out+escapeHtml(source.slice(last));
}

function markup(source){
  const re=/(<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>)/g; let out='',last=0,m;
  while((m=re.exec(source))){out+=escapeHtml(source.slice(last,m.index)); const x=m[0];
    if(x.startsWith('<!--')) out+=token('comment',x);
    else {
      const inner=x.replace(/</g,'').replace(/>$/,'');
      const match=/^(\/?)([A-Za-z][\w:-]*)/.exec(inner);
      let rendered='&lt;'+(match?.[1]||'')+token('tag',match?.[2]||'');
      let rest=inner.slice((match?.[0]||'').length);
      rest=rest.replace(/([\w:-]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s]+)/g,(_,a,b,c)=>token('attr',a)+escapeHtml(b)+token('string',c));
      rendered+=escapeHtml(rest)+'&gt;'; out+=rendered;
    }
    last=m.index+x.length;
  }
  return out+escapeHtml(source.slice(last));
}
function css(source){
  let out=generic(source,'css');
  return out.replace(/(#[0-9a-fA-F]{3,8})/g, token('number','$1'));
}
function json(source){
  const re=/("(?:\\.|[^"\\])*"\s*:|"(?:\\.|[^"\\])*"|\b\d+(?:\.\d+)?\b|\b(?:true|false|null)\b)/g; let out='',last=0,m;
  while((m=re.exec(source))){out+=escapeHtml(source.slice(last,m.index));const x=m[0]; if(/:$/.test(x)) out+=token('property',x); else if(/^"/.test(x)) out+=token('string',x); else if(/^\d/.test(x)) out+=token('number',x); else out+=token('boolean',x);last=m.index+x.length;} return out+escapeHtml(source.slice(last));
}
function yaml(source){
  return source.split('\n').map(line=>{const m=/^(\s*)([-?]?\s*)([^:#]+?)(\s*:\s*)(.*)$/.exec(line); if(!m)return generic(line,'yaml'); return escapeHtml(m[1])+escapeHtml(m[2])+token('property',m[3])+escapeHtml(m[4])+generic(m[5],'yaml');}).join('\n');
}
function ini(source){return source.split('\n').map(line=>{if(/^\s*[;#]/.test(line))return token('comment',line); if(/^\s*\[.*\]\s*$/.test(line))return token('tag',line); const m=/^(\s*)([^=:#]+)(\s*[=:]\s*)(.*)$/.exec(line); return m?escapeHtml(m[1])+token('property',m[2])+escapeHtml(m[3])+generic(m[4],'ini'):generic(line,'ini');}).join('\n');}
function markdown(source){return source.split('\n').map(line=>{if(/^\s*#{1,6}\s/.test(line))return token('heading',line); if(/^\s*```/.test(line))return token('keyword',line); return generic(line,'markdown').replace(/(\*\*[^*]+\*\*)/g,token('strong','$1'));}).join('\n');}

function highlight(source='', language=''){
  const prismAliases = {
    Bash:'bash', Shell:'bash', '.env':'bash',
    HTML:'markup', XML:'markup', Vue:'markup', Svelte:'javascript', JSX:'jsx', TSX:'tsx',
    CSS:'css', JSON:'json', YAML:'yaml', INI:'ini', TOML:'toml', Markdown:'markdown',
    SQL:'sql', GraphQL:'graphql', Dockerfile:'docker', PowerShell:'powershell',
    JavaScript:'javascript', TypeScript:'typescript', C:'c', 'C#':'csharp', 'C++':'cpp',
    Dart:'dart', Go:'go', Java:'java', Kotlin:'kotlin', Lua:'lua', MATLAB:'matlab',
    'Objective-C':'objectivec', Perl:'perl', PHP:'php', Python:'python', R:'r', Ruby:'ruby',
    Rust:'rust', Scala:'scala', Swift:'swift'
  };
  const prismLang=prismAliases[language]||String(language||'').toLowerCase();
  if(window.Prism && Prism.languages[prismLang]){
    try{return Prism.highlight(String(source||''),Prism.languages[prismLang],prismLang);}catch(_){}
  }
  const lang=ALIASES[language]||String(language||'').toLowerCase();
  if(lang==='markup'||lang==='jsx'||lang==='tsx'||lang==='vue'||lang==='svelte') return markup(source);
  if(lang==='json') return json(source);
  if(lang==='yaml') return yaml(source);
  if(lang==='ini'||lang==='toml') return ini(source);
  if(lang==='css') return css(source);
  if(lang==='markdown') return markdown(source);
  return generic(source,lang);
}

function languageKey(language){ return ALIASES[language]||language.toLowerCase(); }
