// ============================================================
// EditKit — SVG Icon System (Zero Dependencies)
// Exact match for the EditKit-inspired premium interface
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
  math: svg('<path d="M4 13h2.5l3 7 4.5-16h6"></path><line x1="14" y1="18" x2="20" y2="18"></line>'),
  mathBlock: svg('<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M6 13h2l2 4 3-10h5"></path><line x1="13" y1="15" x2="18" y2="15"></line>'),
  mathInline: svg('<line x1="2" y1="12" x2="5" y2="12"></line><path d="M5 12h1.5l2 5 3-11h4"></path><line x1="17" y1="12" x2="22" y2="12"></line>'),
  link: svg('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>'),
  emoji: svg('<circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>'),
  omega: svg('<path d="M3 20h4.5a3.5 3.5 0 0 1 3.5-3.5c0-.83.42-1.6 1.1-2.03a6 6 0 1 1 7.8 0c.68.43 1.1 1.2 1.1 2.03a3.5 3.5 0 0 1 3.5 3.5H21"></path>'),
  specialCharacters: svg('<path d="M3 20h4.5a3.5 3.5 0 0 1 3.5-3.5c0-.83.42-1.6 1.1-2.03a6 6 0 1 1 7.8 0c.68.43 1.1 1.2 1.1 2.03a3.5 3.5 0 0 1 3.5 3.5H21"></path>'),
  symbol: svg('<path d="M3 20h4.5a3.5 3.5 0 0 1 3.5-3.5c0-.83.42-1.6 1.1-2.03a6 6 0 1 1 7.8 0c.68.43 1.1 1.2 1.1 2.03a3.5 3.5 0 0 1 3.5 3.5H21"></path>'),
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

  chevronDown: svg('<path d="m6 9 6 6 6-6"></path>'),
  chevronRight: svg('<path d="m9 18 6-6-6-6"></path>'),
  check: svg('<polyline points="20 6 9 17 4 12"></polyline>'),
  close: svg('<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'),
  more: svg('<circle cx="12" cy="12" r="1.5" fill="currentColor"></circle><circle cx="19" cy="12" r="1.5" fill="currentColor"></circle><circle cx="5" cy="12" r="1.5" fill="currentColor"></circle>'),
  grip: svg('<circle cx="8" cy="6" r="1.5" fill="currentColor"></circle><circle cx="16" cy="6" r="1.5" fill="currentColor"></circle><circle cx="8" cy="12" r="1.5" fill="currentColor"></circle><circle cx="16" cy="12" r="1.5" fill="currentColor"></circle><circle cx="8" cy="18" r="1.5" fill="currentColor"></circle><circle cx="16" cy="18" r="1.5" fill="currentColor"></circle>'),
  alignTop: svg('<line x1="4" y1="4" x2="20" y2="4"></line><line x1="12" y1="20" x2="12" y2="8"></line><polyline points="8 12 12 8 16 12"></polyline>'),
  alignMiddle: svg('<line x1="4" y1="12" x2="20" y2="12"></line><polyline points="8 8 12 4 16 8"></polyline><polyline points="8 16 12 20 16 16"></polyline>'),
  alignBottom: svg('<line x1="4" y1="20" x2="20" y2="20"></line><line x1="12" y1="4" x2="12" y2="16"></line><polyline points="8 12 12 16 16 12"></polyline>'),

  // ── Image Manipulation & Upload ──
  upload: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>'),
  trash: svg('<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>'),
  rotate: svg('<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><polyline points="21 3 21 8 16 8"></polyline>'),
  crop: svg('<path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path>'),
  externalLink: svg('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>'),
  caption: svg('<rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="7" y1="8" x2="17" y2="8"></line><line x1="12" y1="8" x2="12" y2="16"></line>'),
  alignImageLeft: svg('<rect x="3" y="6" width="7" height="7" rx="1"></rect><line x1="13" y1="6" x2="21" y2="6"></line><line x1="13" y1="10" x2="21" y2="10"></line><line x1="3" y1="17" x2="21" y2="17"></line>'),
  alignImageCenter: svg('<rect x="8" y="5" width="8" height="8" rx="1"></rect><line x1="3" y1="17" x2="21" y2="17"></line><line x1="6" y1="19" x2="18" y2="19"></line>'),
  alignImageRight: svg('<rect x="14" y="6" width="7" height="7" rx="1"></rect><line x1="3" y1="6" x2="11" y2="6"></line><line x1="3" y1="10" x2="11" y2="10"></line><line x1="3" y1="17" x2="21" y2="17"></line>'),
  inlineWrap: svg('<line x1="3" y1="6" x2="21" y2="6"></line><rect x="6" y="9" width="12" height="6" rx="1"></rect><line x1="3" y1="18" x2="21" y2="18"></line>'),
  breakText: svg('<path d="M4 14h10a4 4 0 0 0 0-8H4"></path><polyline points="7 17 4 14 7 11"></polyline>'),
  frame: svg('<rect x="3" y="3" width="18" height="18" rx="3" stroke-width="2.5"></rect>'),
  edit: svg('<path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>'),
  unlink: svg('<path d="M18.84 12.25l1.72-1.71a4.5 4.5 0 0 0-6.36-6.36l-1.72 1.71"></path><path d="M5.16 11.75l-1.72 1.71a4.5 4.5 0 0 0 6.36 6.36l1.72-1.71"></path><line x1="2" y1="2" x2="22" y2="22"></line>'),
  alertTriangle: svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'),
  panelInfo: svg('<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'),
  panelWarning: svg('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'),
  panelError: svg('<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'),
  panelSuccess: svg('<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>'),
  panelNote: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>'),
  paperclip: svg('<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>'),
  signature: svg('<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path><path d="M3 21h18"></path>'),
  blocks: svg('<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect>'),
  patterns: svg('<rect width="18" height="18" x="3" y="3" rx="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line><line x1="12" y1="12" x2="12" y2="21"></line>'),
  horizontalLine: svg('<line x1="4" y1="12" x2="20" y2="12" stroke-width="2.5"></line>'),
  decDivider: svg('<line x1="3" y1="12" x2="7" y2="12" stroke-width="2.5" stroke-linecap="round"></line><line x1="10" y1="12" x2="14" y2="12" stroke-width="2.5" stroke-linecap="round"></line><line x1="17" y1="12" x2="21" y2="12" stroke-width="2.5" stroke-linecap="round"></line>'),
  sectionHeading: svg('<text x="1" y="16" font-size="14" font-weight="700" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" stroke="none">H</text><text x="13" y="19" font-size="9" font-weight="700" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" stroke="none">2</text>'),
  pullQuote: svg('<line x1="3" y1="7" x2="13" y2="7" stroke-width="2" stroke-linecap="round"></line><line x1="3" y1="12" x2="21" y2="12" stroke-width="2" stroke-linecap="round"></line><line x1="3" y1="17" x2="13" y2="17" stroke-width="2" stroke-linecap="round"></line><polyline points="17 5 17 9 21 9" stroke-width="1.8"></polyline>'),
  columns: svg('<rect x="3" y="4" width="7.5" height="16" rx="2" stroke-width="1.8"></rect><rect x="13.5" y="4" width="7.5" height="16" rx="2" stroke-width="1.8"></rect>'),
  buttonPointer: svg('<path d="m4 4 6.5 15.5 2.5-6.5 6.5-2.5L4 4z" stroke-width="1.8" stroke-linejoin="round"></path><path d="M15 4l2 2" stroke-linecap="round"></path><path d="M19 8l2 2" stroke-linecap="round"></path>'),
  faq: svg('<rect x="3" y="4" width="18" height="16" rx="3" stroke-width="1.8"></rect><line x1="7" y1="8.5" x2="17" y2="8.5" stroke-width="1.8" stroke-linecap="round"></line><line x1="7" y1="12" x2="17" y2="12" stroke-width="1.8" stroke-linecap="round"></line><line x1="7" y1="15.5" x2="13" y2="15.5" stroke-width="1.8" stroke-linecap="round"></line>'),
  hero: svg('<rect x="3" y="4" width="18" height="9" rx="2.5" stroke-width="1.8"></rect><line x1="5" y1="16.5" x2="19" y2="16.5" stroke-width="1.8" stroke-linecap="round"></line><line x1="8" y1="20" x2="16" y2="20" stroke-width="1.8" stroke-linecap="round"></line>'),
  featureRow: svg('<rect x="3" y="6" width="7.5" height="12" rx="2" stroke-width="1.8"></rect><line x1="14" y1="9.5" x2="21" y2="9.5" stroke-width="1.8" stroke-linecap="round"></line><line x1="14" y1="14.5" x2="19" y2="14.5" stroke-width="1.8" stroke-linecap="round"></line>'),
  threeUp: svg('<rect x="3" y="4" width="4.5" height="16" rx="1.5" stroke-width="1.8"></rect><rect x="9.75" y="4" width="4.5" height="16" rx="1.5" stroke-width="1.8"></rect><rect x="16.5" y="4" width="4.5" height="16" rx="1.5" stroke-width="1.8"></rect>'),
  ctaBand: svg('<rect x="3" y="5" width="18" height="14" rx="3" stroke-width="1.8"></rect><circle cx="8" cy="12" r="2.2" stroke-width="1.5"></circle><line x1="13" y1="12" x2="18" y2="12" stroke-width="1.8" stroke-linecap="round"></line>'),
  printer: svg('<polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect>'),
  copy: svg('<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>'),
  monitor: svg('<rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>'),
  tablet: svg('<rect width="16" height="20" x="4" y="2" rx="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>'),
  smartphone: svg('<rect width="14" height="20" x="5" y="2" rx="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line>'),
};
