// ============================================================
// Vellora — SVG Icon System (Zero Dependencies)
// Exact match for the Eddyter-inspired premium interface
// ============================================================

const svg = (d: string, opts?: { viewBox?: string; fill?: string; strokeWidth?: string }) => {
  const viewBox = opts?.viewBox || '0 0 24 24';
  const fill = opts?.fill || 'none';
  const sw = opts?.strokeWidth || '2';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="${viewBox}" fill="${fill}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
};

export const icons: Record<string, string> = {
  // ── History ──
  undo: svg('<path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"></path>'),
  redo: svg('<path d="m15 14 5-5-5-5"></path><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"></path>'),

  // ── Block / Typography ──
  pilcrow: svg('<path d="M13 4v16"></path><path d="M17 4v16"></path><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"></path>'),
  paragraph: svg('<path d="M13 4v16"></path><path d="M17 4v16"></path><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"></path>'),
  heading1: svg('<path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M17 12l3-2v8"></path>'),
  heading2: svg('<path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M21 18h-4c0-2 4-3.5 4-6 0-1-1-2-2-2s-2 1-2 2"></path>'),
  heading3: svg('<path d="M4 12h8"></path><path d="M4 18V6"></path><path d="M12 18V6"></path><path d="M17.5 10.5c1-1 2.5-.5 2.5 1 0 1-1 1.5-2 1.5 1 0 2 .5 2 1.5 0 1.5-1.5 2-2.5 1"></path>'),

  // ── Font Size Stepper ──
  minus: svg('<line x1="5" y1="12" x2="19" y2="12"></line>'),
  plus: svg('<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'),

  // ── Inline Marks ──
  bold: svg('<path d="M6 12h8a4 4 0 0 0 0-8H6v8Z"></path><path d="M6 12h9a4 4 0 0 1 0 8H6v-8Z"></path>'),
  italic: svg('<line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line>'),
  underline: svg('<path d="M6 4v6a6 6 0 0 0 12 0V4"></path><line x1="4" y1="20" x2="20" y2="20"></line>'),
  strikethrough: svg('<path d="M16 4c-.5-1.5-2.5-3-5-3-3 0-5 2-5 4 0 1.5.5 2.5 2 3.5"></path><path d="M8 20c.5 1.5 2.5 3 5 3 3 0 5-2 5-4 0-1.5-.5-2.5-2-3.5"></path><line x1="4" y1="12" x2="20" y2="12"></line>'),
  code: svg('<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>'),
  keyboard: svg('<rect x="3" y="4" width="18" height="16" rx="4"></rect><path d="M7 8h10"></path><path d="M7 12h10"></path><path d="M9 16h6"></path>'),
  subscript: svg('<path d="M4 19h6l5-9 5 9h-6"></path><path d="M20 22h-4c0-1.5 4-2 4-4 0-.5-.5-1-1-1s-1 .5-1 1"></path>', { strokeWidth: '1.5' }),
  superscript: svg('<path d="M4 19h6l5-9 5 9h-6"></path><path d="M20 8h-4c0-1.5 4-2 4-4 0-.5-.5-1-1-1s-1 .5-1 1"></path>', { strokeWidth: '1.5' }),

  // ── Color & Styling ──
  textColor: svg('<path d="m4 20 7-14h2l7 14h-2.5l-2-4H8.5l-2 4H4Zm5.5-6.5h5L12 8.5l-2.5 5Z"></path>', { fill: 'currentColor', strokeWidth: '0' }),
  highlightColor: svg('<path d="m14 12-8.5 8.5a2.12 2.12 0 0 1-3-3L11 9"></path><path d="M18 11l-4-4"></path><path d="m15 2 7 7-3 3-7-7 3-3Z"></path>'),

  // ── Alignment ──
  alignLeft: svg('<line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line>'),
  alignCenter: svg('<line x1="21" y1="6" x2="3" y2="6"></line><line x1="18" y1="12" x2="6" y2="12"></line><line x1="18" y1="18" x2="6" y2="18"></line>'),
  alignRight: svg('<line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="9" y2="12"></line><line x1="21" y1="18" x2="7" y2="18"></line>'),
  alignJustify: svg('<line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="3" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line>'),

  // ── Lists & Structures ──
  bulletList: svg('<line x1="9" y1="6" x2="20" y2="6"></line><line x1="9" y1="12" x2="20" y2="12"></line><line x1="9" y1="18" x2="20" y2="18"></line><circle cx="4" cy="6" r="2" fill="currentColor"></circle><circle cx="4" cy="12" r="2" fill="currentColor"></circle><circle cx="4" cy="18" r="2" fill="currentColor"></circle>'),
  orderedList: svg('<line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>'),
  taskList: svg('<rect x="3" y="5" width="6" height="6" rx="1.5"></rect><path d="m4 8 1.5 1.5L8 6.5"></path><line x1="13" y1="8" x2="21" y2="8"></line><rect x="3" y="13" width="6" height="6" rx="1.5"></rect><line x1="13" y1="16" x2="21" y2="16"></line>'),
  blockquote: svg('<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"></path>', { fill: 'currentColor', strokeWidth: '0' }),
  codeBlock: svg('<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="m10 9-3 3 3 3"></path><path d="m14 9 3 3-3 3"></path>'),
  horizontalRule: svg('<line x1="3" y1="12" x2="21" y2="12"></line>'),

  // ── Media / Insert Toolbar Items ──
  image: svg('<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>'),
  table: svg('<path d="M3 3h18v18H3z"></path><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M9 3v18"></path><path d="M15 3v18"></path>'),
  chart: svg('<path d="M3 3v18h18"></path><rect width="4" height="7" x="7" y="10" rx="1"></rect><rect width="4" height="12" x="15" y="5" rx="1"></rect>'),
  math: svg('<path d="M4 12h2l3 9 4-18h7"></path><path d="M17 12h4"></path>'),
  link: svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>'),
  emoji: svg('<circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>'),
  omega: svg('<path d="M3 20h4.5a3.5 3.5 0 0 1 3.5-3.5 1 1 0 0 0 1-1v-2a6 6 0 1 1 12 0v2a1 1 0 0 0 1 1 3.5 3.5 0 0 1 3.5 3.5H21"></path>'),
  pin: svg('<line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>'),

  // ── AI & Right Side ──
  sparkles: svg('<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"></path>', { fill: 'currentColor' }),
  typography: svg('<polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line><circle cx="18" cy="19" r="1.5" fill="currentColor"></circle>'),
  clearFormat: svg('<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'),
  comment: svg('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>'),
  clock: svg('<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>'),

  // ── Table Contextual Controls ──
  addRowAbove: svg('<path d="M3 5h18v14H3z"></path><path d="M3 10h18"></path><path d="M12 2v6"></path><path d="M9 5h6"></path>'),
  addRowBelow: svg('<path d="M3 5h18v14H3z"></path><path d="M3 14h18"></path><path d="M12 16v6"></path><path d="M9 19h6"></path>'),
  addColLeft: svg('<path d="M5 3h14v18H5z"></path><path d="M10 3v18"></path><path d="M2 12h6"></path><path d="M5 9v6"></path>'),
  addColRight: svg('<path d="M5 3h14v18H5z"></path><path d="M14 3v18"></path><path d="M16 12h6"></path><path d="M19 9v6"></path>'),
  deleteRow: svg('<path d="M3 5h18v14H3z"></path><path d="M3 12h18"></path><line x1="9" y1="12" x2="15" y2="12" stroke="red"></line>'),
  deleteCol: svg('<path d="M5 3h14v18H5z"></path><path d="M12 3v18"></path><line x1="12" y1="9" x2="12" y2="15" stroke="red"></line>'),
  deleteTable: svg('<path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>'),
  tableHeader: svg('<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18" stroke-width="3"></path>'),

  // ── Chevrons & Controls ──
  chevronDown: svg('<path d="m6 9 6 6 6-6"></path>'),
  chevronRight: svg('<path d="m9 18 6-6-6-6"></path>'),
  check: svg('<polyline points="20 6 9 17 4 12"></polyline>'),
  more: svg('<circle cx="12" cy="12" r="1.5" fill="currentColor"></circle><circle cx="19" cy="12" r="1.5" fill="currentColor"></circle><circle cx="5" cy="12" r="1.5" fill="currentColor"></circle>'),
};
