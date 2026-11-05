// Tiny syntax highlighter for the code snippets on the site (JS, JSX, C++, Python, YAML, Dart).

const KW = new Set((
  'const let var function return import from export default class extends new if else for while in of ' +
  'async await try catch throw def print elif lambda yield with as pass True False None true false null ' +
  'undefined this self public private static void int char bool auto using namespace struct final override super'
).split(' '));

const RE = /(\/\/[^\n]*|#(?!include)[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(#include|[A-Za-z_$][\w$]*)|(\s+)|([\s\S])/g;

export function highlight(code) {
  const out = [];
  let m;
  let prev = '';
  RE.lastIndex = 0;
  while ((m = RE.exec(code))) {
    const [t, com, str, num, word, ws] = m;
    let c = 'pun';
    if (com) c = 'com';
    else if (str) c = 'str';
    else if (num) c = 'num';
    else if (ws) c = '';
    else if (word) {
      const next = code.slice(RE.lastIndex).match(/^[ \t]*(\S)/);
      const nc = next ? next[1] : '';
      const lineStart = /(^|\n)[ \t]*$/.test(code.slice(0, m.index));
      if (KW.has(word) || word === '#include') c = 'kw';
      else if (nc === '(') c = 'fn';
      else if (prev === '.') c = 'prop';
      else if (nc === ':' && lineStart) c = 'prop';
      else if (/^[A-Z]/.test(word)) c = 'type';
      else c = 'var';
    }
    out.push({ t, c });
    if (!ws) prev = t;
  }
  return out;
}

// Render tokens, optionally only the first `n` characters (for typing effects)
export function renderTokens(tokens, n = Infinity) {
  const out = [];
  let used = 0;
  for (let i = 0; i < tokens.length && used < n; i++) {
    const { t, c } = tokens[i];
    const part = used + t.length <= n ? t : t.slice(0, n - used);
    used += part.length;
    out.push(c ? <span key={i} className={'tk-' + c}>{part}</span> : part);
  }
  return out;
}

// Inline token helper for hand-written code lines: <T k="kw">const</T>
export const T = ({ k, children }) => <span className={'tk-' + k}>{children}</span>;
