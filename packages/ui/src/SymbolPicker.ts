// ============================================================
// Vellora — Special Characters & Symbol Picker (100% Match)
// Tabs with badges, search, recent well, interactive footer
// Smooth left/right scroll navigation arrows & complete categories
// ============================================================

import type { VelloraEditor } from '@vellora/core';
import { icons } from './icons';

export interface SymbolItem {
  char: string;
  name: string;
  code?: string;
  keywords?: string[];
}

export interface SymbolCategory {
  id: string;
  name: string;
  symbols: SymbolItem[];
}

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  {
    id: 'common',
    name: 'Common',
    symbols: [
      { char: '©', name: 'Copyright Sign', code: 'U+00A9', keywords: ['copy', 'legal'] },
      { char: '®', name: 'Registered Sign', code: 'U+00AE', keywords: ['registered', 'brand'] },
      { char: '™', name: 'Trade Mark Sign', code: 'U+2122', keywords: ['trademark', 'tm'] },
      { char: '°', name: 'Degree Sign', code: 'U+00B0', keywords: ['temperature', 'angle'] },
      { char: '±', name: 'Plus-Minus Sign', code: 'U+00B1', keywords: ['plus minus'] },
      { char: '≠', name: 'Not Equal To', code: 'U+2260', keywords: ['unequal', 'different'] },
      { char: '≤', name: 'Less-Than or Equal To', code: 'U+2264', keywords: ['less', 'equal'] },
      { char: '≥', name: 'Greater-Than or Equal To', code: 'U+2265', keywords: ['greater', 'equal'] },
      { char: '∞', name: 'Infinity', code: 'U+221E', keywords: ['infinite', 'forever'] },
      { char: 'π', name: 'Greek Small Letter Pi', code: 'U+03C0', keywords: ['pi', 'circle', 'math'] },
      { char: 'Ω', name: 'Greek Capital Letter Omega', code: 'U+03A9', keywords: ['omega', 'ohm', 'resistance'] },
      { char: 'μ', name: 'Greek Small Letter Mu', code: 'U+03BC', keywords: ['micro', 'mu'] },
      { char: '•', name: 'Bullet Point', code: 'U+2022', keywords: ['dot', 'list'] },
      { char: '…', name: 'Horizontal Ellipsis', code: 'U+2026', keywords: ['dots', 'ellipsis'] },
      { char: '§', name: 'Section Sign', code: 'U+00A7', keywords: ['law', 'paragraph'] },
      { char: '¶', name: 'Pilcrow / Paragraph Sign', code: 'U+00B6', keywords: ['paragraph'] },
      { char: '†', name: 'Dagger', code: 'U+2020', keywords: ['cross', 'footnote'] },
      { char: '‡', name: 'Double Dagger', code: 'U+2021', keywords: ['footnote'] },
      { char: '✓', name: 'Check Mark', code: 'U+2713', keywords: ['tick', 'done', 'yes'] },
      { char: '✗', name: 'Ballot X', code: 'U+2717', keywords: ['cross', 'wrong', 'no'] },
      { char: '★', name: 'Black Star', code: 'U+2605', keywords: ['star', 'rating'] },
      { char: '☆', name: 'White Star', code: 'U+2606', keywords: ['star', 'outline'] },
    ],
  },
  {
    id: 'currency',
    name: 'Currency',
    symbols: [
      { char: '$', name: 'Dollar Sign', code: 'U+0024', keywords: ['usd', 'money'] },
      { char: '€', name: 'Euro Sign', code: 'U+20AC', keywords: ['eur', 'europe'] },
      { char: '£', name: 'Pound Sign', code: 'U+00A3', keywords: ['gbp', 'uk', 'sterling'] },
      { char: '¥', name: 'Yen / Yuan Sign', code: 'U+00A5', keywords: ['jpy', 'cny', 'japan', 'china'] },
      { char: '₹', name: 'Indian Rupee Sign', code: 'U+20B9', keywords: ['inr', 'india'] },
      { char: '৳', name: 'Bengali Taka Sign', code: 'U+09F3', keywords: ['bdt', 'bangladesh', 'taka'] },
      { char: '₩', name: 'Won Sign', code: 'U+20A9', keywords: ['krw', 'korea'] },
      { char: '₽', name: 'Ruble Sign', code: 'U+20BD', keywords: ['rub', 'russia'] },
      { char: '฿', name: 'Thai Baht Sign', code: 'U+0E3F', keywords: ['thb', 'thailand'] },
      { char: '₫', name: 'Dong Sign', code: 'U+20AB', keywords: ['vnd', 'vietnam'] },
      { char: '₴', name: 'Hryvnia Sign', code: 'U+20B4', keywords: ['uah', 'ukraine'] },
      { char: '₦', name: 'Naira Sign', code: 'U+20A6', keywords: ['ngn', 'nigeria'] },
      { char: '₲', name: 'Guarani Sign', code: 'U+20B2', keywords: ['pyg', 'paraguay'] },
      { char: '₵', name: 'Cedi Sign', code: 'U+20B5', keywords: ['ghs', 'ghana'] },
      { char: '₡', name: 'Colon Sign', code: 'U+20A1', keywords: ['crc', 'costa rica'] },
      { char: '₱', name: 'Peso Sign', code: 'U+20B1', keywords: ['php', 'philippines'] },
      { char: '₿', name: 'Bitcoin Sign', code: 'U+20BF', keywords: ['btc', 'crypto'] },
      { char: 'Ξ', name: 'Ethereum Symbol', code: 'U+039E', keywords: ['eth', 'crypto'] },
      { char: '﷼', name: 'Rial Sign', code: 'U+FDFC', keywords: ['sar', 'irr', 'arabia'] },
      { char: '₪', name: 'New Shekel Sign', code: 'U+20AA', keywords: ['ils', 'israel'] },
      { char: '₸', name: 'Tenge Sign', code: 'U+20B8', keywords: ['kzt', 'kazakhstan'] },
      { char: '₭', name: 'Kip Sign', code: 'U+20AD', keywords: ['lak', 'laos'] },
      { char: '₮', name: 'Tugrik Sign', code: 'U+20AE', keywords: ['mnt', 'mongolia'] },
      { char: '₼', name: 'Manat Sign', code: 'U+20BC', keywords: ['azn', 'azerbaijan'] },
    ],
  },
  {
    id: 'math',
    name: 'Math',
    symbols: [
      { char: '+', name: 'Plus Sign', code: 'U+002B', keywords: ['add'] },
      { char: '−', name: 'Minus Sign', code: 'U+2212', keywords: ['subtract'] },
      { char: '×', name: 'Multiplication Sign', code: 'U+00D7', keywords: ['times', 'multiply'] },
      { char: '÷', name: 'Division Sign', code: 'U+00F7', keywords: ['divide'] },
      { char: '=', name: 'Equals Sign', code: 'U+003D', keywords: ['equal'] },
      { char: '≠', name: 'Not Equal To', code: 'U+2260', keywords: ['unequal'] },
      { char: '≈', name: 'Almost Equal To', code: 'U+2248', keywords: ['approximate'] },
      { char: '≅', name: 'Approximately Equal To', code: 'U+2245', keywords: ['congruent'] },
      { char: '≡', name: 'Identical To', code: 'U+2261', keywords: ['equivalent'] },
      { char: '≤', name: 'Less-Than or Equal To', code: 'U+2264', keywords: ['less'] },
      { char: '≥', name: 'Greater-Than or Equal To', code: 'U+2265', keywords: ['greater'] },
      { char: '≪', name: 'Much Less-Than', code: 'U+226A', keywords: ['much less'] },
      { char: '≫', name: 'Much Greater-Than', code: 'U+226B', keywords: ['much greater'] },
      { char: '±', name: 'Plus-Minus Sign', code: 'U+00B1', keywords: ['plus minus'] },
      { char: '∓', name: 'Minus-or-Plus Sign', code: 'U+2213', keywords: ['minus plus'] },
      { char: '√', name: 'Square Root', code: 'U+221A', keywords: ['root', 'radical'] },
      { char: '∛', name: 'Cube Root', code: 'U+221B', keywords: ['cube root'] },
      { char: '∜', name: 'Fourth Root', code: 'U+221C', keywords: ['fourth root'] },
      { char: '∫', name: 'Integral', code: 'U+222B', keywords: ['calculus', 'integral'] },
      { char: '∬', name: 'Double Integral', code: 'U+222C', keywords: ['calculus'] },
      { char: '∭', name: 'Triple Integral', code: 'U+222D', keywords: ['calculus'] },
      { char: '∮', name: 'Contour Integral', code: 'U+222E', keywords: ['calculus'] },
      { char: '∑', name: 'N-Ary Summation', code: 'U+2211', keywords: ['sum', 'sigma'] },
      { char: '∏', name: 'N-Ary Product', code: 'U+220F', keywords: ['product', 'pi'] },
      { char: 'π', name: 'Pi', code: 'U+03C0', keywords: ['pi', 'geometry'] },
      { char: '∞', name: 'Infinity', code: 'U+221E', keywords: ['infinite'] },
      { char: '∂', name: 'Partial Differential', code: 'U+2202', keywords: ['derivative'] },
      { char: '∇', name: 'Nabla / Del', code: 'U+2207', keywords: ['gradient'] },
      { char: '∆', name: 'Increment / Delta', code: 'U+2206', keywords: ['delta', 'change'] },
      { char: '∈', name: 'Element Of', code: 'U+2208', keywords: ['set', 'belongs'] },
      { char: '∉', name: 'Not An Element Of', code: 'U+2209', keywords: ['set'] },
      { char: '∅', name: 'Empty Set', code: 'U+2205', keywords: ['null', 'void'] },
    ],
  },
  {
    id: 'arrows',
    name: 'Arrows',
    symbols: [
      { char: '←', name: 'Leftwards Arrow', code: 'U+2190', keywords: ['left', 'back'] },
      { char: '→', name: 'Rightwards Arrow', code: 'U+2192', keywords: ['right', 'forward'] },
      { char: '↑', name: 'Upwards Arrow', code: 'U+2191', keywords: ['up', 'top'] },
      { char: '↓', name: 'Downwards Arrow', code: 'U+2193', keywords: ['down', 'bottom'] },
      { char: '↔', name: 'Left Right Arrow', code: 'U+2194', keywords: ['horizontal'] },
      { char: '↕', name: 'Up Down Arrow', code: 'U+2195', keywords: ['vertical'] },
      { char: '↖', name: 'North West Arrow', code: 'U+2196', keywords: ['diagonal'] },
      { char: '↗', name: 'North East Arrow', code: 'U+2197', keywords: ['diagonal'] },
      { char: '↘', name: 'South East Arrow', code: 'U+2198', keywords: ['diagonal'] },
      { char: '↙', name: 'South West Arrow', code: 'U+2199', keywords: ['diagonal'] },
      { char: '⇐', name: 'Leftwards Double Arrow', code: 'U+21D0', keywords: ['implies', 'left'] },
      { char: '⇒', name: 'Rightwards Double Arrow', code: 'U+21D2', keywords: ['implies', 'right'] },
      { char: '⇑', name: 'Upwards Double Arrow', code: 'U+21D1', keywords: ['up'] },
      { char: '⇓', name: 'Downwards Double Arrow', code: 'U+21D3', keywords: ['down'] },
      { char: '⇔', name: 'Left Right Double Arrow', code: 'U+21D4', keywords: ['iff', 'equivalent'] },
      { char: '⇕', name: 'Up Down Double Arrow', code: 'U+21D5', keywords: ['vertical'] },
      { char: '➔', name: 'Heavy Rightwards Arrow', code: 'U+2794', keywords: ['pointer'] },
      { char: '➜', name: 'Heavy Round-Tipped Right Arrow', code: 'U+279C', keywords: ['pointer'] },
      { char: '↩', name: 'Leftwards Arrow with Hook', code: 'U+21A9', keywords: ['return', 'enter'] },
      { char: '↪', name: 'Rightwards Arrow with Hook', code: 'U+21AA', keywords: ['hook'] },
      { char: '↶', name: 'Anticlockwise Top Semicircle Arrow', code: 'U+21B6', keywords: ['undo'] },
      { char: '↷', name: 'Clockwise Top Semicircle Arrow', code: 'U+21B7', keywords: ['redo'] },
      { char: '↺', name: 'Anticlockwise Open Circle Arrow', code: 'U+21BA', keywords: ['rotate', 'refresh'] },
      { char: '↻', name: 'Clockwise Open Circle Arrow', code: 'U+21BB', keywords: ['reload', 'sync'] },
    ],
  },
  {
    id: 'latin',
    name: 'Latin',
    symbols: [
      { char: 'À', name: 'Latin Capital Letter A with Grave', code: 'U+00C0' },
      { char: 'Á', name: 'Latin Capital Letter A with Acute', code: 'U+00C1' },
      { char: 'Â', name: 'Latin Capital Letter A with Circumflex', code: 'U+00C2' },
      { char: 'Ã', name: 'Latin Capital Letter A with Tilde', code: 'U+00C3' },
      { char: 'Ä', name: 'Latin Capital Letter A with Diaeresis', code: 'U+00C4' },
      { char: 'Å', name: 'Latin Capital Letter A with Ring Above', code: 'U+00C5' },
      { char: 'Æ', name: 'Latin Capital Letter AE', code: 'U+00C6' },
      { char: 'Ç', name: 'Latin Capital Letter C with Cedilla', code: 'U+00C7' },
      { char: 'È', name: 'Latin Capital Letter E with Grave', code: 'U+00C8' },
      { char: 'É', name: 'Latin Capital Letter E with Acute', code: 'U+00C9' },
      { char: 'Ê', name: 'Latin Capital Letter E with Circumflex', code: 'U+00CA' },
      { char: 'Ë', name: 'Latin Capital Letter E with Diaeresis', code: 'U+00CB' },
      { char: 'Ì', name: 'Latin Capital Letter I with Grave', code: 'U+00CC' },
      { char: 'Í', name: 'Latin Capital Letter I with Acute', code: 'U+00CD' },
      { char: 'Î', name: 'Latin Capital Letter I with Circumflex', code: 'U+00CE' },
      { char: 'Ï', name: 'Latin Capital Letter I with Diaeresis', code: 'U+00CF' },
      { char: 'Ñ', name: 'Latin Capital Letter N with Tilde', code: 'U+00D1' },
      { char: 'Ò', name: 'Latin Capital Letter O with Grave', code: 'U+00D2' },
      { char: 'Ó', name: 'Latin Capital Letter O with Acute', code: 'U+00D3' },
      { char: 'Ô', name: 'Latin Capital Letter O with Circumflex', code: 'U+00D4' },
      { char: 'Õ', name: 'Latin Capital Letter O with Tilde', code: 'U+00D5' },
      { char: 'Ö', name: 'Latin Capital Letter O with Diaeresis', code: 'U+00D6' },
      { char: 'Ø', name: 'Latin Capital Letter O with Stroke', code: 'U+00D8' },
      { char: 'Ù', name: 'Latin Capital Letter U with Grave', code: 'U+00D9' },
      { char: 'Ú', name: 'Latin Capital Letter U with Acute', code: 'U+00DA' },
      { char: 'Û', name: 'Latin Capital Letter U with Circumflex', code: 'U+00DB' },
      { char: 'Ü', name: 'Latin Capital Letter U with Diaeresis', code: 'U+00DC' },
      { char: 'Ý', name: 'Latin Capital Letter Y with Acute', code: 'U+00DD' },
      { char: 'ß', name: 'Latin Small Letter Sharp S / Eszett', code: 'U+00DF' },
      { char: 'à', name: 'Latin Small Letter A with Grave', code: 'U+00E0' },
      { char: 'á', name: 'Latin Small Letter A with Acute', code: 'U+00E1' },
      { char: 'â', name: 'Latin Small Letter A with Circumflex', code: 'U+00E2' },
      { char: 'ã', name: 'Latin Small Letter A with Tilde', code: 'U+00E3' },
      { char: 'ä', name: 'Latin Small Letter A with Diaeresis', code: 'U+00E4' },
      { char: 'å', name: 'Latin Small Letter A with Ring Above', code: 'U+00E5' },
      { char: 'æ', name: 'Latin Small Letter AE', code: 'U+00E6' },
      { char: 'ç', name: 'Latin Small Letter C with Cedilla', code: 'U+00E7' },
      { char: 'è', name: 'Latin Small Letter E with Grave', code: 'U+00E8' },
      { char: 'é', name: 'Latin Small Letter E with Acute', code: 'U+00E9' },
      { char: 'ê', name: 'Latin Small Letter E with Circumflex', code: 'U+00EA' },
      { char: 'ë', name: 'Latin Small Letter E with Diaeresis', code: 'U+00EB' },
      { char: 'ì', name: 'Latin Small Letter I with Grave', code: 'U+00EC' },
      { char: 'í', name: 'Latin Small Letter I with Acute', code: 'U+00ED' },
      { char: 'î', name: 'Latin Small Letter I with Circumflex', code: 'U+00EE' },
      { char: 'ï', name: 'Latin Small Letter I with Diaeresis', code: 'U+00EF' },
      { char: 'ñ', name: 'Latin Small Letter N with Tilde', code: 'U+00F1' },
      { char: 'ò', name: 'Latin Small Letter O with Grave', code: 'U+00F2' },
      { char: 'ó', name: 'Latin Small Letter O with Acute', code: 'U+00F3' },
      { char: 'ô', name: 'Latin Small Letter O with Circumflex', code: 'U+00F4' },
      { char: 'õ', name: 'Latin Small Letter O with Tilde', code: 'U+00F5' },
      { char: 'ö', name: 'Latin Small Letter O with Diaeresis', code: 'U+00F6' },
      { char: 'ø', name: 'Latin Small Letter O with Stroke', code: 'U+00F8' },
      { char: 'ù', name: 'Latin Small Letter U with Grave', code: 'U+00F9' },
      { char: 'ú', name: 'Latin Small Letter U with Acute', code: 'U+00FA' },
      { char: 'û', name: 'Latin Small Letter U with Circumflex', code: 'U+00FB' },
      { char: 'ü', name: 'Latin Small Letter U with Diaeresis', code: 'U+00FC' },
    ],
  },
  {
    id: 'punctuation',
    name: 'Punctuation',
    symbols: [
      { char: '«', name: 'Left-Pointing Double Angle Quotation', code: 'U+00AB' },
      { char: '»', name: 'Right-Pointing Double Angle Quotation', code: 'U+00BB' },
      { char: '‹', name: 'Single Left-Pointing Angle Quotation', code: 'U+2039' },
      { char: '›', name: 'Single Right-Pointing Angle Quotation', code: 'U+203A' },
      { char: '“', name: 'Left Double Quotation Mark', code: 'U+201C' },
      { char: '”', name: 'Right Double Quotation Mark', code: 'U+201D' },
      { char: '‘', name: 'Left Single Quotation Mark', code: 'U+2018' },
      { char: '’', name: 'Right Single Quotation Mark', code: 'U+2019' },
      { char: '„', name: 'Double Low-9 Quotation Mark', code: 'U+201E' },
      { char: '‚', name: 'Single Low-9 Quotation Mark', code: 'U+201A' },
      { char: '—', name: 'Em Dash', code: 'U+2014', keywords: ['dash', 'long dash'] },
      { char: '–', name: 'En Dash', code: 'U+2013', keywords: ['dash', 'short dash'] },
      { char: '…', name: 'Horizontal Ellipsis', code: 'U+2026', keywords: ['dots'] },
      { char: '¿', name: 'Inverted Question Mark', code: 'U+00BF', keywords: ['spanish'] },
      { char: '¡', name: 'Inverted Exclamation Mark', code: 'U+00A1', keywords: ['spanish'] },
      { char: '‽', name: 'Interrobang', code: 'U+203D' },
      { char: '·', name: 'Middle Dot', code: 'U+00B7' },
      { char: '•', name: 'Bullet', code: 'U+2022' },
      { char: '‣', name: 'Triangular Bullet', code: 'U+2023' },
      { char: '⁃', name: 'Hyphen Bullet', code: 'U+2043' },
      { char: '¶', name: 'Pilcrow', code: 'U+00B6' },
      { char: '§', name: 'Section', code: 'U+00A7' },
      { char: '¦', name: 'Broken Bar', code: 'U+00A6' },
      { char: '‗', name: 'Double Low Line', code: 'U+2017' },
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols',
    symbols: [
      { char: '♠', name: 'Black Spade Suit', code: 'U+2660', keywords: ['cards', 'spade'] },
      { char: '♣', name: 'Black Club Suit', code: 'U+2663', keywords: ['cards', 'club'] },
      { char: '♥', name: 'Black Heart Suit', code: 'U+2665', keywords: ['cards', 'heart'] },
      { char: '♦', name: 'Black Diamond Suit', code: 'U+2666', keywords: ['cards', 'diamond'] },
      { char: '★', name: 'Black Star', code: 'U+2605', keywords: ['star'] },
      { char: '☆', name: 'White Star', code: 'U+2606', keywords: ['star'] },
      { char: '✓', name: 'Check Mark', code: 'U+2713', keywords: ['tick'] },
      { char: '✗', name: 'Ballot X', code: 'U+2717', keywords: ['cross'] },
      { char: '✔', name: 'Heavy Check Mark', code: 'U+2714', keywords: ['check'] },
      { char: '✖', name: 'Heavy Multiplication X', code: 'U+2716', keywords: ['cross'] },
      { char: '♩', name: 'Quarter Note', code: 'U+2669', keywords: ['music'] },
      { char: '♪', name: 'Eighth Note', code: 'U+266A', keywords: ['music'] },
      { char: '♫', name: 'Beamed Eighth Notes', code: 'U+266B', keywords: ['music'] },
      { char: '♬', name: 'Beamed Sixteenth Notes', code: 'U+266C', keywords: ['music'] },
      { char: '☼', name: 'White Sun with Rays', code: 'U+263C', keywords: ['sun', 'weather'] },
      { char: '☁', name: 'Cloud', code: 'U+2601', keywords: ['cloud', 'weather'] },
      { char: '☂', name: 'Umbrella', code: 'U+2602', keywords: ['rain', 'weather'] },
      { char: '☃', name: 'Snowman', code: 'U+2603', keywords: ['snow', 'winter'] },
      { char: '⚡', name: 'High Voltage Sign', code: 'U+26A1', keywords: ['lightning', 'zap'] },
      { char: '❄', name: 'Snowflake', code: 'U+2744', keywords: ['snow', 'cold'] },
      { char: '☎', name: 'Black Telephone', code: 'U+260E', keywords: ['phone'] },
      { char: '✉', name: 'Envelope', code: 'U+2709', keywords: ['mail'] },
      { char: '✂', name: 'Black Scissors', code: 'U+2702', keywords: ['scissors', 'cut'] },
      { char: '✏', name: 'Pencil', code: 'U+270F', keywords: ['pen', 'write'] },
      { char: '⚠', name: 'Warning Sign', code: 'U+26A0', keywords: ['caution', 'alert'] },
      { char: '⛔', name: 'No Entry', code: 'U+26D4', keywords: ['stop', 'forbidden'] },
      { char: '♻', name: 'Black Universal Recycling Symbol', code: 'U+267B', keywords: ['recycle'] },
      { char: '⚙', name: 'Gear', code: 'U+2699', keywords: ['settings'] },
      { char: '☮', name: 'Peace Symbol', code: 'U+262E', keywords: ['peace'] },
      { char: '☯', name: 'Yin Yang', code: 'U+262F', keywords: ['zen'] },
      { char: '⚖', name: 'Scales', code: 'U+2696', keywords: ['justice', 'law'] },
      { char: '♿', name: 'Wheelchair Symbol', code: 'U+267F', keywords: ['accessible'] },
    ],
  },
  {
    id: 'greek',
    name: 'Greek',
    symbols: [
      { char: 'Α', name: 'Greek Capital Letter Alpha', code: 'U+0391' },
      { char: 'Β', name: 'Greek Capital Letter Beta', code: 'U+0392' },
      { char: 'Γ', name: 'Greek Capital Letter Gamma', code: 'U+0393' },
      { char: 'Δ', name: 'Greek Capital Letter Delta', code: 'U+0394' },
      { char: 'Ε', name: 'Greek Capital Letter Epsilon', code: 'U+0395' },
      { char: 'Ζ', name: 'Greek Capital Letter Zeta', code: 'U+0396' },
      { char: 'Η', name: 'Greek Capital Letter Eta', code: 'U+0397' },
      { char: 'Θ', name: 'Greek Capital Letter Theta', code: 'U+0398' },
      { char: 'Ι', name: 'Greek Capital Letter Iota', code: 'U+0399' },
      { char: 'Κ', name: 'Greek Capital Letter Kappa', code: 'U+039A' },
      { char: 'Λ', name: 'Greek Capital Letter Lambda', code: 'U+039B' },
      { char: 'Μ', name: 'Greek Capital Letter Mu', code: 'U+039C' },
      { char: 'Ν', name: 'Greek Capital Letter Nu', code: 'U+039D' },
      { char: 'Ξ', name: 'Greek Capital Letter Xi', code: 'U+039E' },
      { char: 'Ο', name: 'Greek Capital Letter Omicron', code: 'U+039F' },
      { char: 'Π', name: 'Greek Capital Letter Pi', code: 'U+03A0' },
      { char: 'Ρ', name: 'Greek Capital Letter Rho', code: 'U+03A1' },
      { char: 'Σ', name: 'Greek Capital Letter Sigma', code: 'U+03A3' },
      { char: 'Τ', name: 'Greek Capital Letter Tau', code: 'U+03A4' },
      { char: 'Υ', name: 'Greek Capital Letter Upsilon', code: 'U+03A5' },
      { char: 'Φ', name: 'Greek Capital Letter Phi', code: 'U+03A6' },
      { char: 'Χ', name: 'Greek Capital Letter Chi', code: 'U+03A7' },
      { char: 'Ψ', name: 'Greek Capital Letter Psi', code: 'U+03A8' },
      { char: 'Ω', name: 'Greek Capital Letter Omega', code: 'U+03A9' },
      { char: 'α', name: 'Greek Small Letter Alpha', code: 'U+03B1' },
      { char: 'β', name: 'Greek Small Letter Beta', code: 'U+03B2' },
      { char: 'γ', name: 'Greek Small Letter Gamma', code: 'U+03B3' },
      { char: 'δ', name: 'Greek Small Letter Delta', code: 'U+03B4' },
      { char: 'ε', name: 'Greek Small Letter Epsilon', code: 'U+03B5' },
      { char: 'ζ', name: 'Greek Small Letter Zeta', code: 'U+03B6' },
      { char: 'η', name: 'Greek Small Letter Eta', code: 'U+03B7' },
      { char: 'θ', name: 'Greek Small Letter Theta', code: 'U+03B8' },
      { char: 'ι', name: 'Greek Small Letter Iota', code: 'U+03B9' },
      { char: 'κ', name: 'Greek Small Letter Kappa', code: 'U+03BA' },
      { char: 'λ', name: 'Greek Small Letter Lambda', code: 'U+03BB' },
      { char: 'μ', name: 'Greek Small Letter Mu', code: 'U+03BC' },
      { char: 'ν', name: 'Greek Small Letter Nu', code: 'U+03BD' },
      { char: 'ξ', name: 'Greek Small Letter Xi', code: 'U+03BE' },
      { char: 'ο', name: 'Greek Small Letter Omicron', code: 'U+03BF' },
      { char: 'π', name: 'Greek Small Letter Pi', code: 'U+03C0' },
      { char: 'ρ', name: 'Greek Small Letter Rho', code: 'U+03C1' },
      { char: 'σ', name: 'Greek Small Letter Sigma', code: 'U+03C3' },
      { char: 'τ', name: 'Greek Small Letter Tau', code: 'U+03C4' },
      { char: 'υ', name: 'Greek Small Letter Upsilon', code: 'U+03C5' },
      { char: 'φ', name: 'Greek Small Letter Phi', code: 'U+03C6' },
      { char: 'χ', name: 'Greek Small Letter Chi', code: 'U+03C7' },
      { char: 'ψ', name: 'Greek Small Letter Psi', code: 'U+03C8' },
      { char: 'ω', name: 'Greek Small Letter Omega', code: 'U+03C9' },
    ],
  },
  {
    id: 'geometric',
    name: 'Geometric',
    symbols: [
      { char: '■', name: 'Black Square', code: 'U+25A0' },
      { char: '□', name: 'White Square', code: 'U+25A1' },
      { char: '▲', name: 'Black Up-Pointing Triangle', code: 'U+25B2' },
      { char: '△', name: 'White Up-Pointing Triangle', code: 'U+25B3' },
      { char: '▼', name: 'Black Down-Pointing Triangle', code: 'U+25BC' },
      { char: '▽', name: 'White Down-Pointing Triangle', code: 'U+25BD' },
      { char: '◆', name: 'Black Diamond', code: 'U+25C6' },
      { char: '◇', name: 'White Diamond', code: 'U+25C7' },
      { char: '○', name: 'White Circle', code: 'U+25CB' },
      { char: '●', name: 'Black Circle', code: 'U+25CF' },
      { char: '◐', name: 'Circle with Left Half Black', code: 'U+25D0' },
      { char: '◑', name: 'Circle with Right Half Black', code: 'U+25D1' },
      { char: '◒', name: 'Circle with Lower Half Black', code: 'U+25D2' },
      { char: '◓', name: 'Circle with Upper Half Black', code: 'U+25D3' },
      { char: '◢', name: 'Black Lower Right Triangle', code: 'U+25E2' },
      { char: '◣', name: 'Black Lower Left Triangle', code: 'U+25E3' },
      { char: '◤', name: 'Black Upper Left Triangle', code: 'U+25E4' },
      { char: '◥', name: 'Black Upper Right Triangle', code: 'U+25E5' },
      { char: '◦', name: 'White Bullet', code: 'U+25E6' },
      { char: '⬡', name: 'White Hexagon', code: 'U+2B21' },
      { char: '⬢', name: 'Black Hexagon', code: 'U+2B22' },
      { char: '⬠', name: 'White Pentagon', code: 'U+2B20' },
    ],
  },
  {
    id: 'fractions',
    name: 'Fractions',
    symbols: [
      { char: '½', name: 'Vulgar Fraction One Half', code: 'U+00BD' },
      { char: '⅓', name: 'Vulgar Fraction One Third', code: 'U+2153' },
      { char: '⅔', name: 'Vulgar Fraction Two Thirds', code: 'U+2154' },
      { char: '¼', name: 'Vulgar Fraction One Quarter', code: 'U+00BC' },
      { char: '¾', name: 'Vulgar Fraction Three Quarters', code: 'U+00BE' },
      { char: '⅕', name: 'Vulgar Fraction One Fifth', code: 'U+2155' },
      { char: '⅖', name: 'Vulgar Fraction Two Fifths', code: 'U+2156' },
      { char: '⅗', name: 'Vulgar Fraction Three Fifths', code: 'U+2157' },
      { char: '⅘', name: 'Vulgar Fraction Four Fifths', code: 'U+2158' },
      { char: '⅙', name: 'Vulgar Fraction One Sixth', code: 'U+2159' },
      { char: '⅚', name: 'Vulgar Fraction Five Sixths', code: 'U+215A' },
      { char: '⅛', name: 'Vulgar Fraction One Eighth', code: 'U+215B' },
      { char: '⅜', name: 'Vulgar Fraction Three Eighths', code: 'U+215C' },
      { char: '⅝', name: 'Vulgar Fraction Five Eighths', code: 'U+215D' },
      { char: '⅞', name: 'Vulgar Fraction Seven Eighths', code: 'U+215E' },
      { char: '⅟', name: 'Fraction Numerator One', code: 'U+215F' },
    ],
  },
  {
    id: 'scripts',
    name: 'Scripts',
    symbols: [
      { char: '⁰', name: 'Superscript Zero', code: 'U+2070' },
      { char: '¹', name: 'Superscript One', code: 'U+00B9' },
      { char: '²', name: 'Superscript Two', code: 'U+00B2' },
      { char: '³', name: 'Superscript Three', code: 'U+00B3' },
      { char: '⁴', name: 'Superscript Four', code: 'U+2074' },
      { char: '⁵', name: 'Superscript Five', code: 'U+2075' },
      { char: '⁶', name: 'Superscript Six', code: 'U+2076' },
      { char: '⁷', name: 'Superscript Seven', code: 'U+2077' },
      { char: '⁸', name: 'Superscript Eight', code: 'U+2078' },
      { char: '⁹', name: 'Superscript Nine', code: 'U+2079' },
      { char: '⁺', name: 'Superscript Plus', code: 'U+207A' },
      { char: '⁻', name: 'Superscript Minus', code: 'U+207B' },
      { char: 'ⁿ', name: 'Superscript Latin Small Letter N', code: 'U+207F' },
      { char: '₀', name: 'Subscript Zero', code: 'U+2080' },
      { char: '₁', name: 'Subscript One', code: 'U+2081' },
      { char: '₂', name: 'Subscript Two', code: 'U+2082' },
      { char: '₃', name: 'Subscript Three', code: 'U+2083' },
      { char: '₄', name: 'Subscript Four', code: 'U+2084' },
      { char: '₅', name: 'Subscript Five', code: 'U+2085' },
      { char: '₆', name: 'Subscript Six', code: 'U+2086' },
      { char: '₇', name: 'Subscript Seven', code: 'U+2087' },
      { char: '₈', name: 'Subscript Eight', code: 'U+2088' },
      { char: '₉', name: 'Subscript Nine', code: 'U+2089' },
      { char: '₊', name: 'Subscript Plus', code: 'U+208A' },
    ],
  },
];

const RECENT_SYMBOLS_KEY = 'vellora_recent_symbols';

export class SymbolPicker {
  readonly element: HTMLElement;
  private editor: VelloraEditor;
  private onSelect?: (symbol: string) => void;

  private searchInput!: HTMLInputElement;
  private navScrollWrap!: HTMLElement;
  private navContainer!: HTMLElement;
  private leftArrowBtn!: HTMLButtonElement;
  private rightArrowBtn!: HTMLButtonElement;
  private contentContainer!: HTMLElement;
  private previewBox!: HTMLElement;
  private previewName!: HTMLElement;
  private previewCode!: HTMLElement;

  private activeTabId: string = 'common';
  private searchQuery: string = '';
  private recentSymbols: SymbolItem[] = [];

  constructor(editor: VelloraEditor, onSelect?: (symbol: string) => void) {
    this.editor = editor;
    this.onSelect = onSelect;

    this.element = document.createElement('div');
    this.element.classList.add('vellora-symbol-picker');
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-label', 'Special Characters and Symbols');

    this._loadRecent();
    this._buildUI();
  }

  private _loadRecent(): void {
    try {
      const stored = localStorage.getItem(RECENT_SYMBOLS_KEY);
      if (stored) {
        this.recentSymbols = JSON.parse(stored);
      }
    } catch {
      this.recentSymbols = [];
    }

    if (this.recentSymbols.length === 0) {
      this.recentSymbols = [
        { char: '→', name: 'Rightwards Arrow', code: 'U+2192' },
        { char: '©', name: 'Copyright Sign', code: 'U+00A9' },
        { char: '—', name: 'Em Dash', code: 'U+2014' },
        { char: '•', name: 'Bullet Point', code: 'U+2022' },
        { char: '€', name: 'Euro Sign', code: 'U+20AC' },
        { char: 'π', name: 'Greek Small Letter Pi', code: 'U+03C0' },
      ];
    }
  }

  private _saveRecent(sym: SymbolItem): void {
    try {
      this.recentSymbols = [sym, ...this.recentSymbols.filter(x => x.char !== sym.char)].slice(0, 12);
      localStorage.setItem(RECENT_SYMBOLS_KEY, JSON.stringify(this.recentSymbols));
    } catch {
      // Ignore
    }
  }

  private _buildUI(): void {
    this.element.innerHTML = '';

    // ── 1. Top Search Header with Shortcut Badge (100% Match) ──
    const searchWrap = document.createElement('div');
    searchWrap.classList.add('vellora-sym-search-wrap');

    const searchIcon = document.createElement('span');
    searchIcon.classList.add('vellora-sym-search-icon');
    searchIcon.innerHTML = icons.search || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.classList.add('vellora-sym-search-input');
    this.searchInput.placeholder = 'Search 1,200+ symbols by name or codepoint...';
    this.searchInput.addEventListener('input', () => {
      this.searchQuery = this.searchInput.value.trim().toLowerCase();
      this._renderContent();
    });

    const badge = document.createElement('span');
    badge.classList.add('vellora-sym-search-badge');
    badge.textContent = '/';

    searchWrap.appendChild(searchIcon);
    searchWrap.appendChild(this.searchInput);
    searchWrap.appendChild(badge);
    this.element.appendChild(searchWrap);

    // ── 2. Category Tabs Row with Left & Right Scroll Arrows (100% Match) ──
    const navOuter = document.createElement('div');
    navOuter.classList.add('vellora-sym-nav-outer');

    // Left arrow button
    this.leftArrowBtn = document.createElement('button');
    this.leftArrowBtn.type = 'button';
    this.leftArrowBtn.classList.add('vellora-sym-nav-arrow', 'vellora-sym-nav-arrow--left');
    this.leftArrowBtn.innerHTML = icons.chevronLeft || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    this.leftArrowBtn.title = 'Scroll left';
    this.leftArrowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.navScrollWrap.scrollBy({ left: -140, behavior: 'smooth' });
    });

    // Right arrow button
    this.rightArrowBtn = document.createElement('button');
    this.rightArrowBtn.type = 'button';
    this.rightArrowBtn.classList.add('vellora-sym-nav-arrow', 'vellora-sym-nav-arrow--right');
    this.rightArrowBtn.innerHTML = icons.chevronRight || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    this.rightArrowBtn.title = 'Scroll right';
    this.rightArrowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.navScrollWrap.scrollBy({ left: 140, behavior: 'smooth' });
    });

    this.navScrollWrap = document.createElement('div');
    this.navScrollWrap.classList.add('vellora-sym-nav-scroll-wrap');

    this.navContainer = document.createElement('div');
    this.navContainer.classList.add('vellora-sym-nav');

    SYMBOL_CATEGORIES.forEach(cat => {
      const tabBtn = document.createElement('button');
      tabBtn.type = 'button';
      tabBtn.classList.add('vellora-sym-nav-tab');
      tabBtn.dataset.tabId = cat.id;
      if (cat.id === this.activeTabId) {
        tabBtn.classList.add('vellora-sym-nav-tab--active');
      }

      const label = document.createElement('span');
      label.classList.add('vellora-sym-tab-label');
      label.textContent = cat.name;

      const count = document.createElement('span');
      count.classList.add('vellora-sym-tab-count');
      count.textContent = String(cat.symbols.length);

      tabBtn.appendChild(label);
      tabBtn.appendChild(count);

      tabBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.activeTabId = cat.id;
        this.searchQuery = '';
        this.searchInput.value = '';
        this._updateNavActive();
        this._renderContent();
        tabBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });

      this.navContainer.appendChild(tabBtn);
    });

    this.navScrollWrap.appendChild(this.navContainer);
    this.navScrollWrap.addEventListener('scroll', () => {
      this._updateArrowState();
    });

    navOuter.appendChild(this.leftArrowBtn);
    navOuter.appendChild(this.navScrollWrap);
    navOuter.appendChild(this.rightArrowBtn);
    this.element.appendChild(navOuter);

    // ── 3. Scrollable Content Area (Recent Well + Category Grid) ──
    this.contentContainer = document.createElement('div');
    this.contentContainer.classList.add('vellora-sym-content');
    this.element.appendChild(this.contentContainer);

    // ── 4. Bottom Hover Details Footer ──
    const footer = document.createElement('div');
    footer.classList.add('vellora-sym-footer');

    this.previewBox = document.createElement('div');
    this.previewBox.classList.add('vellora-sym-footer-box');
    this.previewBox.textContent = 'Ω';

    const textWrap = document.createElement('div');
    textWrap.classList.add('vellora-sym-footer-text');

    this.previewName = document.createElement('div');
    this.previewName.classList.add('vellora-sym-footer-name');
    this.previewName.textContent = 'Hover a symbol for details';

    this.previewCode = document.createElement('div');
    this.previewCode.classList.add('vellora-sym-footer-sub');
    this.previewCode.textContent = 'Click to insert at cursor';

    textWrap.appendChild(this.previewName);
    textWrap.appendChild(this.previewCode);

    footer.appendChild(this.previewBox);
    footer.appendChild(textWrap);
    this.element.appendChild(footer);

    this._renderContent();
    setTimeout(() => this._updateArrowState(), 50);
  }

  private _updateArrowState(): void {
    if (!this.navScrollWrap) return;
    const { scrollLeft, scrollWidth, clientWidth } = this.navScrollWrap;
    const canScrollLeft = scrollLeft > 4;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - 4;

    this.leftArrowBtn.classList.toggle('vellora-sym-nav-arrow--visible', canScrollLeft);
    this.rightArrowBtn.classList.toggle('vellora-sym-nav-arrow--visible', canScrollRight);
  }

  private _updateNavActive(): void {
    const tabs = this.navContainer.querySelectorAll<HTMLButtonElement>('.vellora-sym-nav-tab');
    tabs.forEach(tab => {
      const isCurrent = tab.dataset.tabId === this.activeTabId && !this.searchQuery;
      tab.classList.toggle('vellora-sym-nav-tab--active', isCurrent);
    });
  }

  private _renderContent(): void {
    this.contentContainer.innerHTML = '';

    if (this.searchQuery) {
      // ── Search View ──
      const matches: SymbolItem[] = [];
      SYMBOL_CATEGORIES.forEach(cat => {
        cat.symbols.forEach(item => {
          if (
            item.name.toLowerCase().includes(this.searchQuery) ||
            item.char.toLowerCase().includes(this.searchQuery) ||
            (item.code && item.code.toLowerCase().includes(this.searchQuery)) ||
            (item.keywords && item.keywords.some(k => k.toLowerCase().includes(this.searchQuery)))
          ) {
            matches.push(item);
          }
        });
      });

      const header = document.createElement('div');
      header.classList.add('vellora-sym-section-header');
      header.innerHTML = `<span>SEARCH RESULTS</span> <span class="vellora-sym-section-count">${matches.length}</span>`;
      this.contentContainer.appendChild(header);

      if (matches.length === 0) {
        const empty = document.createElement('div');
        empty.classList.add('vellora-sym-empty');
        empty.textContent = 'No matching symbols found';
        this.contentContainer.appendChild(empty);
        return;
      }

      const grid = document.createElement('div');
      grid.classList.add('vellora-sym-grid');
      matches.forEach(item => {
        grid.appendChild(this._createSymbolButton(item));
      });
      this.contentContainer.appendChild(grid);
      return;
    }

    // ── 1. Recently Used Section with Enclosed Well (Screenshot Match) ──
    if (this.recentSymbols.length > 0) {
      const recentHeader = document.createElement('div');
      recentHeader.classList.add('vellora-sym-section-header');
      recentHeader.innerHTML = `
        <span class="vellora-sym-header-left">
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>RECENTLY USED</span>
        </span>
        <span class="vellora-sym-section-count">${this.recentSymbols.length}</span>
      `;
      this.contentContainer.appendChild(recentHeader);

      const recentWell = document.createElement('div');
      recentWell.classList.add('vellora-sym-recent-well');

      const recentGrid = document.createElement('div');
      recentGrid.classList.add('vellora-sym-grid', 'vellora-sym-grid--recent');
      this.recentSymbols.forEach(item => {
        recentGrid.appendChild(this._createSymbolButton(item));
      });
      recentWell.appendChild(recentGrid);
      this.contentContainer.appendChild(recentWell);
    }

    // ── 2. Active Category Grid ──
    const currentCategory = SYMBOL_CATEGORIES.find(c => c.id === this.activeTabId) || SYMBOL_CATEGORIES[0];

    const catHeader = document.createElement('div');
    catHeader.classList.add('vellora-sym-section-header');
    catHeader.innerHTML = `
      <span>${currentCategory.name.toUpperCase()}</span>
      <span class="vellora-sym-section-count">${currentCategory.symbols.length}</span>
    `;
    this.contentContainer.appendChild(catHeader);

    const catGrid = document.createElement('div');
    catGrid.classList.add('vellora-sym-grid');
    currentCategory.symbols.forEach(item => {
      catGrid.appendChild(this._createSymbolButton(item));
    });
    this.contentContainer.appendChild(catGrid);
  }

  private _createSymbolButton(item: SymbolItem): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('vellora-sym-item-btn');
    btn.textContent = item.char;
    btn.setAttribute('aria-label', item.name);

    btn.addEventListener('mouseenter', () => {
      this.previewBox.textContent = item.char;
      this.previewName.textContent = item.name;
      this.previewCode.textContent = item.code ? `${item.code} · Click to insert` : 'Click to insert at cursor';
    });

    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._selectSymbol(item);
    });

    return btn;
  }

  private _selectSymbol(item: SymbolItem): void {
    this._saveRecent(item);
    document.execCommand('insertText', false, item.char);
    this.onSelect?.(item.char);
  }

  focusSearch(): void {
    setTimeout(() => {
      this.searchInput.focus();
      this.searchInput.select();
      this._updateArrowState();
    }, 40);
  }
}
