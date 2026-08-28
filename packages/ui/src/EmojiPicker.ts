// ============================================================
// EditKit — Complete EditKit-Inspired Rich Emoji Picker
// Search, categorized navigation, Apple-Style Emojis & World Flags
// ============================================================

import type { EditKitEditor } from '@editkit/core';
import { icons } from './icons';

// Convert 2-letter ISO country code to flag emoji
function getFlag(cc: string): string {
  const codePoints = cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Convert emoji character into unified hexadecimal code point string for Apple iOS assets
export function getAppleEmojiUrl(char: string): string {
  const codePoints: string[] = [];
  for (let i = 0; i < char.length; i++) {
    const cp = char.codePointAt(i);
    if (cp !== undefined) {
      if (cp !== 0xfe0f) {
        codePoints.push(cp.toString(16).toLowerCase());
      }
      if (cp > 0xffff) {
        i++;
      }
    }
  }
  const hex = codePoints.join('-');
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64/${hex}.png`;
}

// Render Apple iOS style emoji image with graceful fallback to native glyph
export function renderAppleEmoji(char: string, altText: string = '', className: string = 'editkit-apple-emoji'): HTMLElement {
  const img = document.createElement('img');
  img.classList.add(className);
  img.src = getAppleEmojiUrl(char);
  img.alt = altText || char;
  img.loading = 'lazy';
  img.draggable = false;
  img.onerror = () => {
    const span = document.createElement('span');
    span.textContent = char;
    img.replaceWith(span);
  };
  return img;
}

interface EmojiItem {
  char: string;
  name: string;
  keywords: string[];
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: EmojiItem[];
}

// Full comprehensive world country list (~240 countries and territories)
const WORLD_COUNTRIES = [
  { code: 'AF', name: 'Afghanistan', keywords: ['kabul'] },
  { code: 'AL', name: 'Albania', keywords: ['tirana'] },
  { code: 'DZ', name: 'Algeria', keywords: ['algiers'] },
  { code: 'AD', name: 'Andorra', keywords: ['andorra'] },
  { code: 'AO', name: 'Angola', keywords: ['luanda'] },
  { code: 'AG', name: 'Antigua and Barbuda', keywords: ['caribbean'] },
  { code: 'AR', name: 'Argentina', keywords: ['buenos aires', 'messi'] },
  { code: 'AM', name: 'Armenia', keywords: ['yerevan'] },
  { code: 'AU', name: 'Australia', keywords: ['canberra', 'sydney', 'melbourne', 'oz'] },
  { code: 'AT', name: 'Austria', keywords: ['vienna'] },
  { code: 'AZ', name: 'Azerbaijan', keywords: ['baku'] },
  { code: 'BS', name: 'Bahamas', keywords: ['nassau', 'caribbean'] },
  { code: 'BH', name: 'Bahrain', keywords: ['manama', 'gulf'] },
  { code: 'BD', name: 'Bangladesh', keywords: ['dhaka', 'bangla', 'bengal'] },
  { code: 'BB', name: 'Barbados', keywords: ['bridgetown'] },
  { code: 'BY', name: 'Belarus', keywords: ['minsk'] },
  { code: 'BE', name: 'Belgium', keywords: ['brussels', 'bruxelles'] },
  { code: 'BZ', name: 'Belize', keywords: ['belmopan'] },
  { code: 'BJ', name: 'Benin', keywords: ['porto-novo'] },
  { code: 'BT', name: 'Bhutan', keywords: ['thimphu'] },
  { code: 'BO', name: 'Bolivia', keywords: ['la paz', 'sucre'] },
  { code: 'BA', name: 'Bosnia and Herzegovina', keywords: ['sarajevo'] },
  { code: 'BW', name: 'Botswana', keywords: ['gaborone'] },
  { code: 'BR', name: 'Brazil', keywords: ['brasil', 'brasilia', 'rio', 'sao paulo'] },
  { code: 'BN', name: 'Brunei', keywords: ['bandar'] },
  { code: 'BG', name: 'Bulgaria', keywords: ['sofia'] },
  { code: 'BF', name: 'Burkina Faso', keywords: ['ouagadougou'] },
  { code: 'BI', name: 'Burundi', keywords: ['gitega'] },
  { code: 'CV', name: 'Cabo Verde', keywords: ['cape verde'] },
  { code: 'KH', name: 'Cambodia', keywords: ['phnom penh'] },
  { code: 'CM', name: 'Cameroon', keywords: ['yaounde'] },
  { code: 'CA', name: 'Canada', keywords: ['ottawa', 'toronto', 'vancouver', 'maple'] },
  { code: 'CF', name: 'Central African Republic', keywords: ['bangui'] },
  { code: 'TD', name: 'Chad', keywords: ["n'djamena"] },
  { code: 'CL', name: 'Chile', keywords: ['santiago'] },
  { code: 'CN', name: 'China', keywords: ['beijing', 'shanghai', 'prc'] },
  { code: 'CO', name: 'Colombia', keywords: ['bogota'] },
  { code: 'KM', name: 'Comoros', keywords: ['moroni'] },
  { code: 'CG', name: 'Congo - Brazzaville', keywords: ['congo'] },
  { code: 'CD', name: 'Congo - Kinshasa', keywords: ['drc', 'zaire'] },
  { code: 'CR', name: 'Costa Rica', keywords: ['san jose'] },
  { code: 'CI', name: "Côte d'Ivoire", keywords: ['ivory coast'] },
  { code: 'HR', name: 'Croatia', keywords: ['zagreb', 'hrvatska'] },
  { code: 'CU', name: 'Cuba', keywords: ['havana'] },
  { code: 'CY', name: 'Cyprus', keywords: ['nicosia'] },
  { code: 'CZ', name: 'Czechia', keywords: ['czech republic', 'prague'] },
  { code: 'DK', name: 'Denmark', keywords: ['copenhagen', 'danish'] },
  { code: 'DJ', name: 'Djibouti', keywords: ['djibouti'] },
  { code: 'DM', name: 'Dominica', keywords: ['roseau'] },
  { code: 'DO', name: 'Dominican Republic', keywords: ['santo domingo'] },
  { code: 'EC', name: 'Ecuador', keywords: ['quito'] },
  { code: 'EG', name: 'Egypt', keywords: ['cairo', 'pyramids'] },
  { code: 'SV', name: 'El Salvador', keywords: ['san salvador'] },
  { code: 'GQ', name: 'Equatorial Guinea', keywords: ['malabo'] },
  { code: 'ER', name: 'Eritrea', keywords: ['asmara'] },
  { code: 'EE', name: 'Estonia', keywords: ['tallinn'] },
  { code: 'SZ', name: 'Eswatini', keywords: ['swaziland'] },
  { code: 'ET', name: 'Ethiopia', keywords: ['addis ababa'] },
  { code: 'FJ', name: 'Fiji', keywords: ['suva'] },
  { code: 'FI', name: 'Finland', keywords: ['helsinki', 'suomi'] },
  { code: 'FR', name: 'France', keywords: ['paris', 'french'] },
  { code: 'GA', name: 'Gabon', keywords: ['libreville'] },
  { code: 'GM', name: 'Gambia', keywords: ['banjul'] },
  { code: 'GE', name: 'Georgia', keywords: ['tbilisi'] },
  { code: 'DE', name: 'Germany', keywords: ['berlin', 'deutschland'] },
  { code: 'GH', name: 'Ghana', keywords: ['accra'] },
  { code: 'GR', name: 'Greece', keywords: ['athens', 'hellas'] },
  { code: 'GD', name: 'Grenada', keywords: ["st. george's"] },
  { code: 'GT', name: 'Guatemala', keywords: ['guatemala city'] },
  { code: 'GN', name: 'Guinea', keywords: ['conakry'] },
  { code: 'GW', name: 'Guinea-Bissau', keywords: ['bissau'] },
  { code: 'GY', name: 'Guyana', keywords: ['georgetown'] },
  { code: 'HT', name: 'Haiti', keywords: ['port-au-prince'] },
  { code: 'HN', name: 'Honduras', keywords: ['tegucigalpa'] },
  { code: 'HK', name: 'Hong Kong', keywords: ['hk'] },
  { code: 'HU', name: 'Hungary', keywords: ['budapest', 'magyar'] },
  { code: 'IS', name: 'Iceland', keywords: ['reykjavik'] },
  { code: 'IN', name: 'India', keywords: ['delhi', 'mumbai', 'bharat'] },
  { code: 'ID', name: 'Indonesia', keywords: ['jakarta', 'bali'] },
  { code: 'IR', name: 'Iran', keywords: ['tehran', 'persia'] },
  { code: 'IQ', name: 'Iraq', keywords: ['baghdad'] },
  { code: 'IE', name: 'Ireland', keywords: ['dublin', 'eire', 'irish'] },
  { code: 'IL', name: 'Israel', keywords: ['jerusalem', 'tel aviv'] },
  { code: 'IT', name: 'Italy', keywords: ['rome', 'italia', 'milan'] },
  { code: 'JM', name: 'Jamaica', keywords: ['kingston'] },
  { code: 'JP', name: 'Japan', keywords: ['tokyo', 'nippon', 'japanese'] },
  { code: 'JO', name: 'Jordan', keywords: ['amman'] },
  { code: 'KZ', name: 'Kazakhstan', keywords: ['astana'] },
  { code: 'KE', name: 'Kenya', keywords: ['nairobi'] },
  { code: 'KI', name: 'Kiribati', keywords: ['tarawa'] },
  { code: 'KP', name: 'North Korea', keywords: ['pyongyang'] },
  { code: 'KR', name: 'South Korea', keywords: ['seoul', 'korea'] },
  { code: 'KW', name: 'Kuwait', keywords: ['kuwait city'] },
  { code: 'KG', name: 'Kyrgyzstan', keywords: ['bishkek'] },
  { code: 'LA', name: 'Laos', keywords: ['vientiane'] },
  { code: 'LV', name: 'Latvia', keywords: ['riga'] },
  { code: 'LB', name: 'Lebanon', keywords: ['beirut'] },
  { code: 'LS', name: 'Lesotho', keywords: ['maseru'] },
  { code: 'LR', name: 'Liberia', keywords: ['monrovia'] },
  { code: 'LY', name: 'Libya', keywords: ['tripoli'] },
  { code: 'LI', name: 'Liechtenstein', keywords: ['vaduz'] },
  { code: 'LT', name: 'Lithuania', keywords: ['vilnius'] },
  { code: 'LU', name: 'Luxembourg', keywords: ['luxembourg'] },
  { code: 'MO', name: 'Macau', keywords: ['macao'] },
  { code: 'MG', name: 'Madagascar', keywords: ['antananarivo'] },
  { code: 'MW', name: 'Malawi', keywords: ['lilongwe'] },
  { code: 'MY', name: 'Malaysia', keywords: ['kuala lumpur'] },
  { code: 'MV', name: 'Maldives', keywords: ['male'] },
  { code: 'ML', name: 'Mali', keywords: ['bamako'] },
  { code: 'MT', name: 'Malta', keywords: ['valletta'] },
  { code: 'MH', name: 'Marshall Islands', keywords: ['majuro'] },
  { code: 'MR', name: 'Mauritania', keywords: ['nouakchott'] },
  { code: 'MU', name: 'Mauritius', keywords: ['port louis'] },
  { code: 'MX', name: 'Mexico', keywords: ['mexico city', 'mexico'] },
  { code: 'FM', name: 'Micronesia', keywords: ['palikir'] },
  { code: 'MD', name: 'Moldova', keywords: ['chisinau'] },
  { code: 'MC', name: 'Monaco', keywords: ['monaco'] },
  { code: 'MN', name: 'Mongolia', keywords: ['ulaanbaatar'] },
  { code: 'ME', name: 'Montenegro', keywords: ['podgorica'] },
  { code: 'MA', name: 'Morocco', keywords: ['rabat', 'casablanca'] },
  { code: 'MZ', name: 'Mozambique', keywords: ['maputo'] },
  { code: 'MM', name: 'Myanmar', keywords: ['burma', 'yangon'] },
  { code: 'NA', name: 'Namibia', keywords: ['windhoek'] },
  { code: 'NR', name: 'Nauru', keywords: ['yaren'] },
  { code: 'NP', name: 'Nepal', keywords: ['kathmandu', 'everest'] },
  { code: 'NL', name: 'Netherlands', keywords: ['amsterdam', 'holland', 'dutch'] },
  { code: 'NZ', name: 'New Zealand', keywords: ['wellington', 'auckland', 'kiwi'] },
  { code: 'NI', name: 'Nicaragua', keywords: ['managua'] },
  { code: 'NE', name: 'Niger', keywords: ['niamey'] },
  { code: 'NG', name: 'Nigeria', keywords: ['abuja', 'lagos'] },
  { code: 'MK', name: 'North Macedonia', keywords: ['skopje'] },
  { code: 'NO', name: 'Norway', keywords: ['oslo', 'norsk'] },
  { code: 'OM', name: 'Oman', keywords: ['muscat'] },
  { code: 'PK', name: 'Pakistan', keywords: ['islamabad', 'karachi', 'lahore'] },
  { code: 'PW', name: 'Palau', keywords: ['ngerulmud'] },
  { code: 'PS', name: 'Palestine', keywords: ['gaza', 'ramallah', 'jerusalem'] },
  { code: 'PA', name: 'Panama', keywords: ['panama city'] },
  { code: 'PG', name: 'Papua New Guinea', keywords: ['port moresby'] },
  { code: 'PY', name: 'Paraguay', keywords: ['asuncion'] },
  { code: 'PE', name: 'Peru', keywords: ['lima'] },
  { code: 'PH', name: 'Philippines', keywords: ['manila'] },
  { code: 'PL', name: 'Poland', keywords: ['warsaw', 'polska'] },
  { code: 'PT', name: 'Portugal', keywords: ['lisbon', 'porto'] },
  { code: 'QA', name: 'Qatar', keywords: ['doha', 'fifa'] },
  { code: 'RO', name: 'Romania', keywords: ['bucharest'] },
  { code: 'RU', name: 'Russia', keywords: ['moscow', 'russian'] },
  { code: 'RW', name: 'Rwanda', keywords: ['kigali'] },
  { code: 'KN', name: 'Saint Kitts and Nevis', keywords: ['basseterre'] },
  { code: 'LC', name: 'Saint Lucia', keywords: ['castries'] },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', keywords: ['kingstown'] },
  { code: 'WS', name: 'Samoa', keywords: ['apia'] },
  { code: 'SM', name: 'San Marino', keywords: ['san marino'] },
  { code: 'ST', name: 'São Tomé and Príncipe', keywords: ['sao tome'] },
  { code: 'SA', name: 'Saudi Arabia', keywords: ['riyadh', 'jeddah', 'mecca'] },
  { code: 'SN', name: 'Senegal', keywords: ['dakar'] },
  { code: 'RS', name: 'Serbia', keywords: ['belgrade'] },
  { code: 'SC', name: 'Seychelles', keywords: ['victoria'] },
  { code: 'SL', name: 'Sierra Leone', keywords: ['freetown'] },
  { code: 'SG', name: 'Singapore', keywords: ['singapore'] },
  { code: 'SK', name: 'Slovakia', keywords: ['bratislava'] },
  { code: 'SI', name: 'Slovenia', keywords: ['ljubljana'] },
  { code: 'SB', name: 'Solomon Islands', keywords: ['honiara'] },
  { code: 'SO', name: 'Somalia', keywords: ['mogadishu'] },
  { code: 'ZA', name: 'South Africa', keywords: ['pretoria', 'cape town', 'johannesburg'] },
  { code: 'SS', name: 'South Sudan', keywords: ['juba'] },
  { code: 'ES', name: 'Spain', keywords: ['madrid', 'barcelona', 'espana'] },
  { code: 'LK', name: 'Sri Lanka', keywords: ['colombo'] },
  { code: 'SD', name: 'Sudan', keywords: ['khartoum'] },
  { code: 'SR', name: 'Suriname', keywords: ['paramaribo'] },
  { code: 'SE', name: 'Sweden', keywords: ['stockholm', 'sverige'] },
  { code: 'CH', name: 'Switzerland', keywords: ['bern', 'zurich', 'swiss'] },
  { code: 'SY', name: 'Syria', keywords: ['damascus'] },
  { code: 'TW', name: 'Taiwan', keywords: ['taipei'] },
  { code: 'TJ', name: 'Tajikistan', keywords: ['dushanbe'] },
  { code: 'TZ', name: 'Tanzania', keywords: ['dodoma', 'zanzibar'] },
  { code: 'TH', name: 'Thailand', keywords: ['bangkok', 'thai'] },
  { code: 'TL', name: 'Timor-Leste', keywords: ['dili'] },
  { code: 'TG', name: 'Togo', keywords: ['lome'] },
  { code: 'TO', name: 'Tonga', keywords: ["nuku'alofa"] },
  { code: 'TT', name: 'Trinidad and Tobago', keywords: ['port of spain'] },
  { code: 'TN', name: 'Tunisia', keywords: ['tunis'] },
  { code: 'TR', name: 'Turkey', keywords: ['turkiye', 'ankara', 'istanbul'] },
  { code: 'TM', name: 'Turkmenistan', keywords: ['ashgabat'] },
  { code: 'TV', name: 'Tuvalu', keywords: ['funafuti'] },
  { code: 'UG', name: 'Uganda', keywords: ['kampala'] },
  { code: 'UA', name: 'Ukraine', keywords: ['kyiv'] },
  { code: 'AE', name: 'United Arab Emirates', keywords: ['uae', 'dubai', 'abu dhabi'] },
  { code: 'GB', name: 'United Kingdom', keywords: ['uk', 'britain', 'london', 'england', 'scotland', 'wales'] },
  { code: 'US', name: 'United States', keywords: ['usa', 'america', 'washington', 'new york'] },
  { code: 'UY', name: 'Uruguay', keywords: ['montevideo'] },
  { code: 'UZ', name: 'Uzbekistan', keywords: ['tashkent'] },
  { code: 'VU', name: 'Vanuatu', keywords: ['port vila'] },
  { code: 'VA', name: 'Vatican City', keywords: ['holy see', 'rome'] },
  { code: 'VE', name: 'Venezuela', keywords: ['caracas'] },
  { code: 'VN', name: 'Vietnam', keywords: ['hanoi', 'saigon'] },
  { code: 'YE', name: 'Yemen', keywords: ['sanaa'] },
  { code: 'ZM', name: 'Zambia', keywords: ['lusaka'] },
  { code: 'ZW', name: 'Zimbabwe', keywords: ['harare'] },
];

const FLAG_EMOJIS: EmojiItem[] = [
  { char: '🏁', name: 'Chequered Flag', keywords: ['racing', 'finish', 'f1'] },
  { char: '🚩', name: 'Triangular Flag', keywords: ['red flag', 'warning'] },
  { char: '🎌', name: 'Crossed Flags', keywords: ['japan', 'celebration'] },
  { char: '🏴‍☠️', name: 'Pirate Flag', keywords: ['jolly roger', 'skull'] },
  { char: '🏳️‍🌈', name: 'Rainbow Flag', keywords: ['pride', 'lgbt'] },
  { char: '🏳️‍⚧️', name: 'Transgender Flag', keywords: ['trans', 'pride'] },
  { char: '🇺🇳', name: 'United Nations', keywords: ['un', 'world'] },
  { char: '🇪🇺', name: 'European Union', keywords: ['eu', 'europe'] },
  ...WORLD_COUNTRIES.map(c => ({
    char: getFlag(c.code),
    name: c.name,
    keywords: [c.code.toLowerCase(), ...c.keywords, 'flag', 'country'],
  })),
];

const EMOJI_DATA: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Smileys & People',
    icon: '😃',
    emojis: [
      { char: '😀', name: 'Grinning Face', keywords: ['smile', 'happy', 'joy'] },
      { char: '😃', name: 'Grinning Face with Big Eyes', keywords: ['smile', 'happy', 'joy', 'haha'] },
      { char: '😄', name: 'Grinning Face with Smiling Eyes', keywords: ['happy', 'joy', 'laugh'] },
      { char: '😁', name: 'Beaming Face with Smiling Eyes', keywords: ['smile', 'happy', 'grin'] },
      { char: '😆', name: 'Grinning Squinting Face', keywords: ['happy', 'haha', 'laugh'] },
      { char: '😅', name: 'Grinning Face with Sweat', keywords: ['hot', 'phew', 'nervous'] },
      { char: '🤣', name: 'Rolling on the Floor Laughing', keywords: ['rofl', 'lol', 'laugh'] },
      { char: '😂', name: 'Face with Tears of Joy', keywords: ['cry', 'tears', 'lol', 'laugh'] },
      { char: '🙂', name: 'Slightly Smiling Face', keywords: ['smile', 'mild'] },
      { char: '🙃', name: 'Upside-Down Face', keywords: ['sarcasm', 'irony'] },
      { char: '🫠', name: 'Melting Face', keywords: ['melt', 'hot', 'disappear'] },
      { char: '😉', name: 'Winking Face', keywords: ['wink', 'flirt'] },
      { char: '😊', name: 'Smiling Face with Smiling Eyes', keywords: ['blush', 'proud', 'happy'] },
      { char: '😇', name: 'Smiling Face with Halo', keywords: ['angel', 'innocent', 'holy'] },
      { char: '🥰', name: 'Smiling Face with Hearts', keywords: ['love', 'crush', 'adore'] },
      { char: '😍', name: 'Smiling Face with Heart-Eyes', keywords: ['love', 'crush', 'heart'] },
      { char: '🤩', name: 'Star-Struck', keywords: ['stars', 'eyes', 'wow'] },
      { char: '😘', name: 'Face Blowing a Kiss', keywords: ['kiss', 'flirt', 'love'] },
      { char: '😗', name: 'Kissing Face', keywords: ['kiss'] },
      { char: '😚', name: 'Kissing Face with Closed Eyes', keywords: ['kiss'] },
      { char: '😙', name: 'Kissing Face with Smiling Eyes', keywords: ['kiss', 'smile'] },
      { char: '😋', name: 'Face Savoring Food', keywords: ['yummy', 'delicious', 'tasty'] },
      { char: '😛', name: 'Face with Tongue', keywords: ['tongue', 'playful'] },
      { char: '😜', name: 'Winking Face with Tongue', keywords: ['tongue', 'wink', 'crazy'] },
      { char: '🤪', name: 'Zany Face', keywords: ['crazy', 'goofy', 'wild'] },
      { char: '😝', name: 'Squinting Face with Tongue', keywords: ['tongue', 'laugh'] },
      { char: '🤑', name: 'Money-Mouth Face', keywords: ['rich', 'dollar', 'money'] },
      { char: '🤗', name: 'Smiling Face with Open Hands', keywords: ['hug', 'embrace'] },
      { char: '🤭', name: 'Face with Hand Over Mouth', keywords: ['oops', 'giggle'] },
      { char: '🫢', name: 'Face with Open Eyes and Hand Over Mouth', keywords: ['gasp', 'shock'] },
      { char: '🫣', name: 'Face with Peeking Eye', keywords: ['scared', 'peek'] },
      { char: '🤫', name: 'Shushing Face', keywords: ['quiet', 'secret', 'shh'] },
      { char: '🤔', name: 'Thinking Face', keywords: ['think', 'idea', 'ponder'] },
      { char: '🫡', name: 'Saluting Face', keywords: ['salute', 'respect', 'yes'] },
      { char: '🤐', name: 'Zipper-Mouth Face', keywords: ['secret', 'silent', 'zip'] },
      { char: '🤨', name: 'Face with Raised Eyebrow', keywords: ['skeptic', 'doubt'] },
      { char: '😐', name: 'Neutral Face', keywords: ['meh', 'indifferent'] },
      { char: '😑', name: 'Expressionless Face', keywords: ['blank', 'unimpressed'] },
      { char: '😶', name: 'Face Without Mouth', keywords: ['mute', 'speechless'] },
      { char: '🫥', name: 'Dotted Line Face', keywords: ['invisible', 'disappear'] },
      { char: '😏', name: 'Smirking Face', keywords: ['smirk', 'flirt'] },
      { char: '😒', name: 'Unamused Face', keywords: ['bored', 'annoyed'] },
      { char: '🙄', name: 'Face with Rolling Eyes', keywords: ['eyeroll', 'whatever'] },
      { char: '😬', name: 'Grimacing Face', keywords: ['awkward', 'eek'] },
      { char: '😮‍💨', name: 'Face Exhaling', keywords: ['sigh', 'relief', 'gasp'] },
      { char: '🤥', name: 'Lying Face', keywords: ['pinocchio', 'lie'] },
      { char: '🫨', name: 'Shaking Face', keywords: ['earthquake', 'vibrate', 'shock'] },
      { char: '😌', name: 'Relieved Face', keywords: ['peace', 'calm', 'relax'] },
      { char: '😔', name: 'Pensive Face', keywords: ['sad', 'down'] },
      { char: '😪', name: 'Sleepy Face', keywords: ['tired', 'sleep'] },
      { char: '🤤', name: 'Drooling Face', keywords: ['drool', 'craving'] },
      { char: '😴', name: 'Sleeping Face', keywords: ['zzz', 'sleep', 'night'] },
      { char: '😷', name: 'Face with Medical Mask', keywords: ['sick', 'mask', 'covid'] },
      { char: '🤒', name: 'Face with Thermometer', keywords: ['fever', 'ill', 'sick'] },
      { char: '🤕', name: 'Face with Head-Bandage', keywords: ['hurt', 'injured'] },
      { char: '🤢', name: 'Nauseated Face', keywords: ['gross', 'disgust', 'sick'] },
      { char: '🤮', name: 'Face Vomiting', keywords: ['puke', 'vomit', 'sick'] },
      { char: '🤧', name: 'Sneezing Face', keywords: ['sneeze', 'cold', 'tissue'] },
      { char: '🥵', name: 'Hot Face', keywords: ['heat', 'summer', 'sweat'] },
      { char: '🥶', name: 'Cold Face', keywords: ['ice', 'freezing', 'winter'] },
      { char: '🥴', name: 'Woozy Face', keywords: ['dizzy', 'drunk'] },
      { char: '😵', name: 'Face with Crossed-Out Eyes', keywords: ['ko', 'dead', 'faint'] },
      { char: '🤯', name: 'Exploding Head', keywords: ['mindblown', 'shock', 'boom'] },
      { char: '🤠', name: 'Cowboy Hat Face', keywords: ['cowboy', 'western'] },
      { char: '🥳', name: 'Partying Face', keywords: ['party', 'celebrate', 'cheers'] },
      { char: '🥸', name: 'Disguised Face', keywords: ['mustache', 'incognito'] },
      { char: '😎', name: 'Smiling Face with Sunglasses', keywords: ['cool', 'shades', 'slick'] },
      { char: '🤓', name: 'Nerd Face', keywords: ['nerd', 'glasses', 'geek'] },
      { char: '🧐', name: 'Face with Monocle', keywords: ['fancy', 'detective'] },
      { char: '😕', name: 'Confused Face', keywords: ['confused', 'puzzled'] },
      { char: '😟', name: 'Worried Face', keywords: ['worry', 'scared'] },
      { char: '🙁', name: 'Slightly Frowning Face', keywords: ['sad', 'frown'] },
      { char: '😮', name: 'Face with Open Mouth', keywords: ['surprise', 'wow'] },
      { char: '😯', name: 'Hushed Face', keywords: ['silenced', 'quiet'] },
      { char: '😲', name: 'Astonished Face', keywords: ['amazed', 'gasp'] },
      { char: '😳', name: 'Flushed Face', keywords: ['blush', 'embarrassed'] },
      { char: '🥺', name: 'Pleading Face', keywords: ['puppy', 'eyes', 'please'] },
      { char: '🥹', name: 'Face Holding Back Tears', keywords: ['grateful', 'proud', 'tear'] },
      { char: '😦', name: 'Frowning Face with Open Mouth', keywords: ['shocked', 'sad'] },
      { char: '😨', name: 'Fearful Face', keywords: ['scared', 'fear'] },
      { char: '😰', name: 'Anxious Face with Sweat', keywords: ['nervous', 'anxiety'] },
      { char: '😥', name: 'Sad but Relieved Face', keywords: ['phew', 'disappointed'] },
      { char: '😢', name: 'Crying Face', keywords: ['tear', 'sad', 'cry'] },
      { char: '😭', name: 'Loudly Crying Face', keywords: ['sob', 'cry', 'tears', 'bawl'] },
      { char: '😱', name: 'Face Screaming in Fear', keywords: ['munch', 'scream', 'scared'] },
      { char: '😖', name: 'Confounded Face', keywords: ['quiver', 'frustrated'] },
      { char: '😣', name: 'Persevering Face', keywords: ['struggle', 'tough'] },
      { char: '😞', name: 'Disappointed Face', keywords: ['sad', 'regret'] },
      { char: '😓', name: 'Downcast Face with Sweat', keywords: ['hardwork', 'exhausted'] },
      { char: '😩', name: 'Weary Face', keywords: ['tired', 'frustrated'] },
      { char: '😫', name: 'Tired Face', keywords: ['exhausted', 'done'] },
      { char: '🥱', name: 'Yawning Face', keywords: ['yawn', 'sleepy', 'bored'] },
      { char: '😤', name: 'Face with Steam From Nose', keywords: ['triumph', 'angry', 'steam'] },
      { char: '😡', name: 'Enraged Face', keywords: ['pout', 'rage', 'angry'] },
      { char: '😠', name: 'Angry Face', keywords: ['mad', 'annoyed'] },
      { char: '🤬', name: 'Face with Symbols on Mouth', keywords: ['cursing', 'swear', 'rage'] },
      { char: '😈', name: 'Smiling Face with Horns', keywords: ['devil', 'evil', 'naughty'] },
      { char: '👿', name: 'Angry Face with Horns', keywords: ['demon', 'devil', 'rage'] },
      { char: '💀', name: 'Skull', keywords: ['dead', 'skeleton', 'death', 'lol'] },
      { char: '☠️', name: 'Skull and Crossbones', keywords: ['danger', 'pirate', 'poison'] },
      { char: '💩', name: 'Pile of Poo', keywords: ['poop', 'crap'] },
      { char: '🤡', name: 'Clown Face', keywords: ['clown', 'circus', 'fool'] },
      { char: '👻', name: 'Ghost', keywords: ['spooky', 'halloween', 'boo'] },
      { char: '👽', name: 'Alien', keywords: ['ufo', 'space', 'extraterrestrial'] },
      { char: '🤖', name: 'Robot', keywords: ['bot', 'ai', 'tech'] },
      { char: '🎃', name: 'Jack-O-Lantern', keywords: ['halloween', 'pumpkin'] },
      // Hands & Gestures
      { char: '👋', name: 'Waving Hand', keywords: ['wave', 'hello', 'bye', 'hi'] },
      { char: '🤚', name: 'Raised Back of Hand', keywords: ['hand', 'stop'] },
      { char: '🖐️', name: 'Hand with Fingers Splayed', keywords: ['five', 'hand'] },
      { char: '✋', name: 'Raised Hand', keywords: ['highfive', 'stop', 'halt'] },
      { char: '🖖', name: 'Vulcan Salute', keywords: ['spock', 'star trek'] },
      { char: '👌', name: 'OK Hand', keywords: ['perfect', 'okay', 'great'] },
      { char: '🤌', name: 'Pinched Fingers', keywords: ['italian', 'gesture'] },
      { char: '🤏', name: 'Pinching Hand', keywords: ['small', 'tiny', 'little'] },
      { char: '✌️', name: 'Victory Hand', keywords: ['peace', 'two', 'v'] },
      { char: '🤞', name: 'Crossed Fingers', keywords: ['luck', 'hope'] },
      { char: '🫰', name: 'Hand with Index Finger and Thumb Crossed', keywords: ['kpop', 'heart', 'money'] },
      { char: '🤟', name: 'Love-You Gesture', keywords: ['ily', 'rock'] },
      { char: '🤘', name: 'Sign of the Horns', keywords: ['rock', 'metal'] },
      { char: '🤙', name: 'Call Me Hand', keywords: ['shaka', 'phone', 'hang loose'] },
      { char: '👈', name: 'Backhand Index Pointing Left', keywords: ['point', 'left'] },
      { char: '👉', name: 'Backhand Index Pointing Right', keywords: ['point', 'right'] },
      { char: '👆', name: 'Backhand Index Pointing Up', keywords: ['point', 'up'] },
      { char: '🖕', name: 'Middle Finger', keywords: ['fu', 'disrespect'] },
      { char: '👇', name: 'Backhand Index Pointing Down', keywords: ['point', 'down'] },
      { char: '☝️', name: 'Index Pointing Up', keywords: ['one', 'first', 'point'] },
      { char: '👍', name: 'Thumbs Up', keywords: ['like', 'yes', 'agree', 'approve', 'good'] },
      { char: '👎', name: 'Thumbs Down', keywords: ['dislike', 'no', 'bad'] },
      { char: '✊', name: 'Raised Fist', keywords: ['power', 'solidarity'] },
      { char: '👊', name: 'Oncoming Fist', keywords: ['punch', 'fist bump'] },
      { char: '🤛', name: 'Left-Facing Fist', keywords: ['fist bump'] },
      { char: '🤜', name: 'Right-Facing Fist', keywords: ['fist bump'] },
      { char: '👏', name: 'Clapping Hands', keywords: ['applause', 'bravo', 'clap'] },
      { char: '🙌', name: 'Raising Hands', keywords: ['celebrate', 'yay', 'hooray'] },
      { char: '🫶', name: 'Heart Hands', keywords: ['love', 'care'] },
      { char: '👐', name: 'Open Hands', keywords: ['hug', 'open'] },
      { char: '🤲', name: 'Palms Up Together', keywords: ['prayer', 'dua'] },
      { char: '🤝', name: 'Handshake', keywords: ['deal', 'agree', 'partner'] },
      { char: '🙏', name: 'Folded Hands', keywords: ['please', 'thank you', 'pray', 'namaste'] },
      { char: '✍️', name: 'Writing Hand', keywords: ['write', 'author', 'pen'] },
      { char: '💅', name: 'Nail Polish', keywords: ['beauty', 'slay', 'manicure'] },
      { char: '🤳', name: 'Selfie', keywords: ['camera', 'phone'] },
      { char: '💪', name: 'Flexed Biceps', keywords: ['muscle', 'strong', 'gym', 'power'] },
      { char: '🦵', name: 'Leg', keywords: ['kick', 'limb'] },
      { char: '🦶', name: 'Foot', keywords: ['kick', 'walk'] },
      { char: '👂', name: 'Ear', keywords: ['hear', 'listen'] },
      { char: '👃', name: 'Nose', keywords: ['smell', 'sniff'] },
      { char: '👶', name: 'Baby', keywords: ['child', 'infant'] },
      { char: '👧', name: 'Girl', keywords: ['female', 'kid'] },
      { char: '👦', name: 'Boy', keywords: ['male', 'kid'] },
      { char: '👩', name: 'Woman', keywords: ['female', 'adult'] },
      { char: '🧑', name: 'Person', keywords: ['gender neutral', 'adult'] },
      { char: '👨', name: 'Man', keywords: ['male', 'guy'] },
      { char: '👵', name: 'Old Woman', keywords: ['grandma', 'elder'] },
      { char: '👴', name: 'Old Man', keywords: ['grandpa', 'elder'] },
      { char: '👮', name: 'Police Officer', keywords: ['cop', 'law'] },
      { char: '👷', name: 'Construction Worker', keywords: ['builder', 'helmet'] },
      { char: '💂', name: 'Guard', keywords: ['royal', 'london'] },
      { char: '🕵️', name: 'Detective', keywords: ['sleuth', 'spy'] },
      { char: '👩‍💻', name: 'Woman Technologist', keywords: ['coder', 'developer', 'hacker'] },
      { char: '👨‍💻', name: 'Man Technologist', keywords: ['coder', 'developer', 'hacker'] },
      { char: '👩‍🔬', name: 'Woman Scientist', keywords: ['lab', 'chemistry', 'research'] },
      { char: '👨‍🔬', name: 'Man Scientist', keywords: ['lab', 'chemistry', 'research'] },
      { char: '👩‍🎨', name: 'Woman Artist', keywords: ['art', 'painter'] },
      { char: '👨‍🎨', name: 'Man Artist', keywords: ['art', 'painter'] },
      { char: '👩‍🚀', name: 'Woman Astronaut', keywords: ['space', 'rocket'] },
      { char: '👨‍🚀', name: 'Man Astronaut', keywords: ['space', 'rocket'] },
      { char: '🦸', name: 'Superhero', keywords: ['hero', 'power'] },
      { char: '🦹', name: 'Supervillain', keywords: ['villain', 'evil'] },
      { char: '🧙', name: 'Mage', keywords: ['wizard', 'magic'] },
      { char: '🧚', name: 'Fairy', keywords: ['magic', 'wings'] },
      { char: '🧛', name: 'Vampire', keywords: ['dracula', 'blood'] },
      { char: '🧜', name: 'Merperson', keywords: ['mermaid', 'ocean'] },
      { char: '🧝', name: 'Elf', keywords: ['fantasy', 'magic'] },
      { char: '💃', name: 'Woman Dancing', keywords: ['dance', 'party', 'salsa'] },
      { char: '🕺', name: 'Man Dancing', keywords: ['disco', 'dance'] },
      { char: '🚶', name: 'Person Walking', keywords: ['walk', 'hike'] },
      { char: '🏃', name: 'Person Running', keywords: ['sprint', 'run', 'fast'] },
      { char: '🧘', name: 'Person in Lotus Position', keywords: ['yoga', 'meditate', 'zen'] },
    ],
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    icon: '🐻',
    emojis: [
      { char: '🐶', name: 'Dog Face', keywords: ['puppy', 'pet', 'dog'] },
      { char: '🐱', name: 'Cat Face', keywords: ['kitten', 'pet', 'cat'] },
      { char: '🐭', name: 'Mouse Face', keywords: ['mouse', 'rodent'] },
      { char: '🐹', name: 'Hamster Face', keywords: ['pet', 'rodent'] },
      { char: '🐰', name: 'Rabbit Face', keywords: ['bunny', 'rabbit'] },
      { char: '🦊', name: 'Fox', keywords: ['fox', 'clever'] },
      { char: '🐻', name: 'Bear', keywords: ['bear', 'wild'] },
      { char: '🐼', name: 'Panda', keywords: ['panda', 'bamboo'] },
      { char: '🐨', name: 'Koala', keywords: ['australia', 'koala'] },
      { char: '🐯', name: 'Tiger Face', keywords: ['tiger', 'wild', 'stripes'] },
      { char: '🦁', name: 'Lion', keywords: ['lion', 'king', 'safari'] },
      { char: '🐮', name: 'Cow Face', keywords: ['cow', 'beef', 'milk'] },
      { char: '🐷', name: 'Pig Face', keywords: ['pig', 'pork'] },
      { char: '🐸', name: 'Frog', keywords: ['frog', 'toad'] },
      { char: '🐵', name: 'Monkey Face', keywords: ['monkey', 'banana'] },
      { char: '🐔', name: 'Chicken', keywords: ['chicken', 'bird'] },
      { char: '🐧', name: 'Penguin', keywords: ['bird', 'ice', 'antarctica'] },
      { char: '🐦', name: 'Bird', keywords: ['bird', 'fly'] },
      { char: '🦅', name: 'Eagle', keywords: ['eagle', 'america', 'bird'] },
      { char: '🦆', name: 'Duck', keywords: ['duck', 'quack'] },
      { char: '🦉', name: 'Owl', keywords: ['owl', 'wise', 'night'] },
      { char: '🦇', name: 'Bat', keywords: ['vampire', 'batman', 'night'] },
      { char: '🐺', name: 'Wolf', keywords: ['wolf', 'howl'] },
      { char: '🐗', name: 'Boar', keywords: ['wild pig'] },
      { char: '🐴', name: 'Horse Face', keywords: ['horse', 'pony'] },
      { char: '🦄', name: 'Unicorn', keywords: ['magic', 'fantasy', 'unicorn'] },
      { char: '🐝', name: 'Honeybee', keywords: ['bee', 'honey', 'insect'] },
      { char: '🐛', name: 'Bug', keywords: ['caterpillar', 'insect'] },
      { char: '🦋', name: 'Butterfly', keywords: ['butterfly', 'insect', 'pretty'] },
      { char: '🐌', name: 'Snail', keywords: ['slow', 'shell'] },
      { char: '🐞', name: 'Lady Beetle', keywords: ['ladybug', 'insect'] },
      { char: '🐜', name: 'Ant', keywords: ['ant', 'insect'] },
      { char: '🕷️', name: 'Spider', keywords: ['spider', 'web'] },
      { char: '🦂', name: 'Scorpion', keywords: ['scorpion', 'sting'] },
      { char: '🐢', name: 'Turtle', keywords: ['turtle', 'slow', 'reptile'] },
      { char: '🐍', name: 'Snake', keywords: ['serpent', 'snake', 'reptile'] },
      { char: '🦎', name: 'Lizard', keywords: ['gecko', 'reptile'] },
      { char: '🦖', name: 'T-Rex', keywords: ['dinosaur', 'tyrannosaurus'] },
      { char: '🐙', name: 'Octopus', keywords: ['squid', 'sea', 'ocean'] },
      { char: '🦑', name: 'Squid', keywords: ['ocean', 'calamari'] },
      { char: '🦐', name: 'Shrimp', keywords: ['prawn', 'seafood'] },
      { char: '🦞', name: 'Lobster', keywords: ['seafood', 'crab'] },
      { char: '🦀', name: 'Crab', keywords: ['cancer', 'beach'] },
      { char: '🐡', name: 'Blowfish', keywords: ['pufferfish', 'sea'] },
      { char: '🐠', name: 'Tropical Fish', keywords: ['nemo', 'ocean'] },
      { char: '🐟', name: 'Fish', keywords: ['seafood', 'lake'] },
      { char: '🐬', name: 'Dolphin', keywords: ['flipper', 'sea'] },
      { char: '🐳', name: 'Spouting Whale', keywords: ['whale', 'ocean'] },
      { char: '🦈', name: 'Shark', keywords: ['jaws', 'predator'] },
      { char: '🐊', name: 'Crocodile', keywords: ['alligator', 'reptile'] },
      { char: '🐆', name: 'Leopard', keywords: ['cheetah', 'safari'] },
      { char: '🦓', name: 'Zebra', keywords: ['stripes', 'safari'] },
      { char: '🦍', name: 'Gorilla', keywords: ['ape', 'king kong'] },
      { char: '🦧', name: 'Orangutan', keywords: ['ape', 'monkey'] },
      { char: '🐘', name: 'Elephant', keywords: ['trunk', 'safari', 'africa'] },
      { char: '🦛', name: 'Hippopotamus', keywords: ['hippo'] },
      { char: '🦏', name: 'Rhinoceros', keywords: ['rhino'] },
      { char: '🐪', name: 'Camel', keywords: ['desert', 'hump'] },
      { char: '🦒', name: 'Giraffe', keywords: ['tall', 'neck', 'safari'] },
      { char: '🦘', name: 'Kangaroo', keywords: ['australia', 'hop'] },
      { char: '🦬', name: 'Bison', keywords: ['buffalo'] },
      { char: '🐃', name: 'Water Buffalo', keywords: ['ox', 'bull'] },
      { char: '🐂', name: 'Ox', keywords: ['bull', 'taurus'] },
      { char: '🐑', name: 'Ewe', keywords: ['sheep', 'wool'] },
      { char: '🐐', name: 'Goat', keywords: ['goat', 'greatest'] },
      { char: '🦌', name: 'Deer', keywords: ['bambi', 'stag'] },
      { char: '🐕', name: 'Dog', keywords: ['pet', 'canine'] },
      { char: '🐩', name: 'Poodle', keywords: ['dog', 'fancy'] },
      { char: '🐈', name: 'Cat', keywords: ['feline', 'pet'] },
      { char: '🐓', name: 'Rooster', keywords: ['cock', 'morning'] },
      { char: '🦚', name: 'Peacock', keywords: ['feathers', 'bird'] },
      { char: '🦜', name: 'Parrot', keywords: ['bird', 'pirate', 'talk'] },
      { char: '🦢', name: 'Swan', keywords: ['bird', 'graceful'] },
      { char: '🦩', name: 'Flamingo', keywords: ['pink', 'bird'] },
      { char: '🕊️', name: 'Dove', keywords: ['peace', 'bird'] },
      { char: '🌹', name: 'Rose', keywords: ['flower', 'love', 'red'] },
      { char: '🌸', name: 'Cherry Blossom', keywords: ['sakura', 'flower', 'pink'] },
      { char: '🌺', name: 'Hibiscus', keywords: ['flower', 'tropical'] },
      { char: '🌻', name: 'Sunflower', keywords: ['sun', 'flower', 'yellow'] },
      { char: '🌼', name: 'Blossom', keywords: ['flower', 'spring'] },
      { char: '🌷', name: 'Tulip', keywords: ['flower', 'netherlands'] },
      { char: '🌱', name: 'Seedling', keywords: ['sprout', 'grow', 'plant'] },
      { char: '🌲', name: 'Evergreen Tree', keywords: ['pine', 'christmas', 'forest'] },
      { char: '🌳', name: 'Deciduous Tree', keywords: ['nature', 'wood'] },
      { char: '🌴', name: 'Palm Tree', keywords: ['beach', 'vacation', 'tropical'] },
      { char: '🌵', name: 'Cactus', keywords: ['desert', 'spikes'] },
      { char: '🍀', name: 'Four Leaf Clover', keywords: ['lucky', 'irish', 'green'] },
      { char: '🍁', name: 'Maple Leaf', keywords: ['canada', 'autumn', 'fall'] },
      { char: '🍂', name: 'Fallen Leaf', keywords: ['autumn', 'leaves'] },
      { char: '🍄', name: 'Mushroom', keywords: ['fungus', 'mario'] },
    ],
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: '🍔',
    emojis: [
      { char: '🍏', name: 'Green Apple', keywords: ['fruit', 'healthy'] },
      { char: '🍎', name: 'Red Apple', keywords: ['fruit', 'apple'] },
      { char: '🍐', name: 'Pear', keywords: ['fruit'] },
      { char: '🍊', name: 'Tangerine', keywords: ['orange', 'citrus'] },
      { char: '🍋', name: 'Lemon', keywords: ['sour', 'citrus'] },
      { char: '🍌', name: 'Banana', keywords: ['fruit', 'potassium'] },
      { char: '🍉', name: 'Watermelon', keywords: ['summer', 'fruit'] },
      { char: '🍇', name: 'Grapes', keywords: ['wine', 'fruit'] },
      { char: '🍓', name: 'Strawberry', keywords: ['berry', 'fruit'] },
      { char: '🫐', name: 'Blueberries', keywords: ['berry', 'blue'] },
      { char: '🍈', name: 'Melon', keywords: ['cantaloupe'] },
      { char: '🍒', name: 'Cherries', keywords: ['fruit', 'red'] },
      { char: '🍑', name: 'Peach', keywords: ['fruit', 'butt'] },
      { char: '🥭', name: 'Mango', keywords: ['tropical', 'fruit'] },
      { char: '🍍', name: 'Pineapple', keywords: ['tropical', 'fruit'] },
      { char: '🥥', name: 'Coconut', keywords: ['palm', 'island'] },
      { char: '🥝', name: 'Kiwi Fruit', keywords: ['fruit', 'green'] },
      { char: '🍅', name: 'Tomato', keywords: ['vegetable', 'sauce'] },
      { char: '🥑', name: 'Avocado', keywords: ['guacamole', 'toast'] },
      { char: '🥦', name: 'Broccoli', keywords: ['green', 'vegetable'] },
      { char: '🥒', name: 'Cucumber', keywords: ['pickle', 'salad'] },
      { char: '🌶️', name: 'Hot Pepper', keywords: ['spicy', 'chili'] },
      { char: '🌽', name: 'Ear of Corn', keywords: ['maize', 'popcorn'] },
      { char: '🥕', name: 'Carrot', keywords: ['vegetable', 'orange'] },
      { char: '🥔', name: 'Potato', keywords: ['fries', 'carb'] },
      { char: '🥐', name: 'Croissant', keywords: ['bakery', 'french'] },
      { char: '🍞', name: 'Bread', keywords: ['toast', 'loaf'] },
      { char: '🥖', name: 'Baguette Bread', keywords: ['french', 'bread'] },
      { char: '🥨', name: 'Pretzel', keywords: ['german', 'snack'] },
      { char: '🧀', name: 'Cheese Wedge', keywords: ['cheddar', 'dairy'] },
      { char: '🥚', name: 'Egg', keywords: ['breakfast', 'protein'] },
      { char: '🍳', name: 'Cooking', keywords: ['fried egg', 'breakfast'] },
      { char: '🥞', name: 'Pancakes', keywords: ['breakfast', 'syrup'] },
      { char: '🧇', name: 'Waffle', keywords: ['breakfast', 'belgian'] },
      { char: '🥓', name: 'Bacon', keywords: ['pork', 'breakfast'] },
      { char: '🥩', name: 'Cut of Meat', keywords: ['steak', 'beef'] },
      { char: '🍗', name: 'Poultry Leg', keywords: ['chicken', 'drumstick'] },
      { char: '🍖', name: 'Meat on Bone', keywords: ['meat', 'bbq'] },
      { char: '🌭', name: 'Hot Dog', keywords: ['sausage', 'frankfurter'] },
      { char: '🍔', name: 'Hamburger', keywords: ['burger', 'beef', 'fast food'] },
      { char: '🍟', name: 'French Fries', keywords: ['chips', 'fast food'] },
      { char: '🍕', name: 'Pizza', keywords: ['cheese', 'slice', 'italian'] },
      { char: '🥪', name: 'Sandwich', keywords: ['lunch', 'bread'] },
      { char: '🥙', name: 'Stuffed Flatbread', keywords: ['gyro', 'kebab', 'shawarma'] },
      { char: '🧆', name: 'Falafel', keywords: ['middle east', 'vegan'] },
      { char: '🌮', name: 'Taco', keywords: ['mexican', 'tortilla'] },
      { char: '🌯', name: 'Burrito', keywords: ['mexican', 'wrap'] },
      { char: '🥗', name: 'Green Salad', keywords: ['healthy', 'vegan'] },
      { char: '🍿', name: 'Popcorn', keywords: ['movie', 'cinema', 'snack'] },
      { char: '🧈', name: 'Butter', keywords: ['dairy', 'spread'] },
      { char: '🍝', name: 'Spaghetti', keywords: ['pasta', 'italian', 'noodles'] },
      { char: '🍜', name: 'Steaming Bowl', keywords: ['ramen', 'soup', 'noodles'] },
      { char: '🍲', name: 'Pot of Food', keywords: ['stew', 'curry'] },
      { char: '🍛', name: 'Curry Rice', keywords: ['indian', 'spicy'] },
      { char: '🍣', name: 'Sushi', keywords: ['japanese', 'fish', 'rice'] },
      { char: '🍱', name: 'Bento Box', keywords: ['japanese', 'lunch'] },
      { char: '🥟', name: 'Dumpling', keywords: ['dim sum', 'gyoza'] },
      { char: '🍙', name: 'Rice Ball', keywords: ['onigiri', 'japanese'] },
      { char: '🍚', name: 'Cooked Rice', keywords: ['rice', 'bowl'] },
      { char: '🍘', name: 'Rice Cracker', keywords: ['senbei', 'snack'] },
      { char: '🍢', name: 'Oden', keywords: ['japanese', 'seafood'] },
      { char: '🍡', name: 'Dango', keywords: ['japanese', 'sweet'] },
      { char: '🍧', name: 'Shaved Ice', keywords: ['dessert', 'cold'] },
      { char: '🍨', name: 'Ice Cream', keywords: ['dessert', 'scoop'] },
      { char: '🍦', name: 'Soft Ice Cream', keywords: ['cone', 'dessert'] },
      { char: '🥧', name: 'Pie', keywords: ['bakery', 'apple pie'] },
      { char: '🧁', name: 'Cupcake', keywords: ['frosting', 'sweet'] },
      { char: '🍰', name: 'Shortcake', keywords: ['cake', 'slice'] },
      { char: '🎂', name: 'Birthday Cake', keywords: ['celebrate', 'party'] },
      { char: '🍮', name: 'Custard', keywords: ['pudding', 'flan'] },
      { char: '🍭', name: 'Lollipop', keywords: ['candy', 'sugar'] },
      { char: '🍬', name: 'Candy', keywords: ['sweet', 'sugar'] },
      { char: '🍫', name: 'Chocolate Bar', keywords: ['cocoa', 'sweet'] },
      { char: '🍩', name: 'Doughnut', keywords: ['donut', 'pastry'] },
      { char: '🍪', name: 'Cookie', keywords: ['biscuit', 'choc chip'] },
      { char: '☕', name: 'Hot Beverage', keywords: ['coffee', 'tea', 'cafe', 'espresso'] },
      { char: '🫖', name: 'Teapot', keywords: ['tea', 'pot'] },
      { char: '🍵', name: 'Teacup Without Handle', keywords: ['green tea', 'matcha'] },
      { char: '🧃', name: 'Beverage Box', keywords: ['juice', 'box'] },
      { char: '🥤', name: 'Cup with Straw', keywords: ['soda', 'drink'] },
      { char: '🧋', name: 'Bubble Tea', keywords: ['boba', 'milk tea'] },
      { char: '🥛', name: 'Glass of Milk', keywords: ['dairy', 'calcium'] },
      { char: '🍺', name: 'Beer Mug', keywords: ['alcohol', 'pub', 'cheers'] },
      { char: '🍻', name: 'Clinking Beer Mugs', keywords: ['cheers', 'toast'] },
      { char: '🥂', name: 'Clinking Glasses', keywords: ['champagne', 'celebrate'] },
      { char: '🍷', name: 'Wine Glass', keywords: ['red wine', 'alcohol'] },
      { char: '🍸', name: 'Cocktail Glass', keywords: ['martini', 'bar'] },
      { char: '🍹', name: 'Tropical Drink', keywords: ['cocktail', 'vacation'] },
      { char: '🍾', name: 'Bottle with Popping Cork', keywords: ['champagne', 'celebration'] },
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    icon: '✈️',
    emojis: [
      { char: '🚗', name: 'Automobile', keywords: ['car', 'drive'] },
      { char: '🚕', name: 'Taxi', keywords: ['cab', 'uber'] },
      { char: '🚙', name: 'Sport Utility Vehicle', keywords: ['suv', 'car'] },
      { char: '🚌', name: 'Bus', keywords: ['transit', 'transport'] },
      { char: '🚎', name: 'Trolleybus', keywords: ['transit'] },
      { char: '🏎️', name: 'Racing Car', keywords: ['f1', 'race', 'fast'] },
      { char: '🚓', name: 'Police Car', keywords: ['cop', 'law'] },
      { char: '🚑', name: 'Ambulance', keywords: ['hospital', 'emergency'] },
      { char: '🚒', name: 'Fire Engine', keywords: ['firefighter', 'truck'] },
      { char: '🚐', name: 'Minibus', keywords: ['van', 'transit'] },
      { char: '🚚', name: 'Delivery Truck', keywords: ['amazon', 'cargo'] },
      { char: '🚛', name: 'Articulated Lorry', keywords: ['semi', 'truck'] },
      { char: '🚜', name: 'Tractor', keywords: ['farm', 'agriculture'] },
      { char: '🛵', name: 'Motor Scooter', keywords: ['vespa', 'bike'] },
      { char: '🏍️', name: 'Motorcycle', keywords: ['motorbike', 'harley'] },
      { char: '🚲', name: 'Bicycle', keywords: ['bike', 'cycle'] },
      { char: '🛴', name: 'Kick Scooter', keywords: ['scooter'] },
      { char: '🛹', name: 'Skateboard', keywords: ['skate', 'board'] },
      { char: '🛼', name: 'Roller Skate', keywords: ['skating'] },
      { char: '🚨', name: 'Police Car Light', keywords: ['siren', 'emergency', 'alert'] },
      { char: '✈️', name: 'Airplane', keywords: ['flight', 'travel', 'plane'] },
      { char: '🛫', name: 'Airplane Departure', keywords: ['takeoff', 'vacation'] },
      { char: '🛬', name: 'Airplane Arrival', keywords: ['landing'] },
      { char: '🚀', name: 'Rocket', keywords: ['space', 'launch', 'fast', 'moon'] },
      { char: '🛸', name: 'Flying Saucer', keywords: ['ufo', 'alien'] },
      { char: '🚁', name: 'Helicopter', keywords: ['chopper', 'flight'] },
      { char: '⛵', name: 'Sailboat', keywords: ['boat', 'sea', 'sailing'] },
      { char: '🚤', name: 'Speedboat', keywords: ['fast boat', 'lake'] },
      { char: '🛳️', name: 'Passenger Ship', keywords: ['cruise', 'vacation'] },
      { char: '🚢', name: 'Ship', keywords: ['boat', 'vessel'] },
      { char: '⚓', name: 'Anchor', keywords: ['port', 'nautical', 'ship'] },
      { char: '⛽', name: 'Fuel Pump', keywords: ['gas', 'petrol', 'station'] },
      { char: '🚧', name: 'Construction', keywords: ['barrier', 'warning'] },
      { char: '🚦', name: 'Vertical Traffic Light', keywords: ['stop', 'signal'] },
      { char: '🗽', name: 'Statue of Liberty', keywords: ['nyc', 'usa', 'new york'] },
      { char: '🗼', name: 'Tokyo Tower', keywords: ['japan', 'tower'] },
      { char: '🏰', name: 'Castle', keywords: ['disney', 'palace'] },
      { char: '🏯', name: 'Japanese Castle', keywords: ['fortress'] },
      { char: '🏟️', name: 'Stadium', keywords: ['sports', 'arena'] },
      { char: '🎡', name: 'Ferris Wheel', keywords: ['amusement park', 'fair'] },
      { char: '🎢', name: 'Roller Coaster', keywords: ['thrill', 'carnival'] },
      { char: '🏖️', name: 'Beach with Umbrella', keywords: ['vacation', 'sea', 'sand'] },
      { char: '🏝️', name: 'Desert Island', keywords: ['island', 'tropical'] },
      { char: '⛰️', name: 'Mountain', keywords: ['hiking', 'peak', 'nature'] },
      { char: '🏔️', name: 'Snow-Capped Mountain', keywords: ['alps', 'snow'] },
      { char: '🏕️', name: 'Camping', keywords: ['tent', 'outdoors'] },
      { char: '🏠', name: 'House', keywords: ['home', 'building'] },
      { char: '🏡', name: 'House with Garden', keywords: ['suburb', 'home'] },
      { char: '🏢', name: 'Office Building', keywords: ['work', 'company'] },
      { char: '🏬', name: 'Department Store', keywords: ['mall', 'shopping'] },
      { char: '🏨', name: 'Hotel', keywords: ['vacation', 'stay'] },
      { char: '🏦', name: 'Bank', keywords: ['money', 'finance'] },
      { char: '🏥', name: 'Hospital', keywords: ['doctor', 'medical'] },
      { char: '🏛️', name: 'Classical Building', keywords: ['museum', 'bank', 'monument'] },
      { char: '⛪', name: 'Church', keywords: ['christian', 'religion'] },
      { char: '🕌', name: 'Mosque', keywords: ['islam', 'muslim'] },
      { char: '🌅', name: 'Sunrise', keywords: ['morning', 'sun', 'dawn'] },
      { char: '🌄', name: 'Sunrise Over Mountains', keywords: ['view', 'dawn'] },
      { char: '🌆', name: 'Cityscape at Dusk', keywords: ['sunset', 'city'] },
      { char: '🌇', name: 'Sunset', keywords: ['golden hour', 'sun'] },
      { char: '🌃', name: 'Night with Stars', keywords: ['sky', 'city', 'evening'] },
      { char: '🌌', name: 'Milky Way', keywords: ['galaxy', 'space', 'universe'] },
    ],
  },
  {
    id: 'activities',
    name: 'Activities & Sports',
    icon: '⚽',
    emojis: [
      { char: '⚽', name: 'Soccer Ball', keywords: ['football', 'fifa', 'sport'] },
      { char: '🏀', name: 'Basketball', keywords: ['nba', 'hoop', 'sport'] },
      { char: '🏈', name: 'American Football', keywords: ['nfl', 'superbowl'] },
      { char: '⚾', name: 'Baseball', keywords: ['mlb', 'bat'] },
      { char: '🥎', name: 'Softball', keywords: ['ball', 'game'] },
      { char: '🎾', name: 'Tennis', keywords: ['wimbledon', 'racket'] },
      { char: '🏐', name: 'Volleyball', keywords: ['beach', 'net'] },
      { char: '🏉', name: 'Rugby Football', keywords: ['rugby'] },
      { char: '🎱', name: 'Pool 8 Ball', keywords: ['billiards', 'snooker'] },
      { char: '🏓', name: 'Ping Pong', keywords: ['table tennis'] },
      { char: '🏸', name: 'Badminton', keywords: ['shuttlecock'] },
      { char: '🥊', name: 'Boxing Glove', keywords: ['punch', 'fight', 'mma'] },
      { char: '🥋', name: 'Martial Arts Uniform', keywords: ['karate', 'judo'] },
      { char: '⛳', name: 'Flag in Hole', keywords: ['golf', 'pga'] },
      { char: '⛸️', name: 'Ice Skate', keywords: ['skating', 'winter'] },
      { char: '🎿', name: 'Skis', keywords: ['skiing', 'snow', 'winter'] },
      { char: '🛷', name: 'Sled', keywords: ['sleigh', 'snow'] },
      { char: '🏹', name: 'Bow and Arrow', keywords: ['archery', 'target'] },
      { char: '🎣', name: 'Fishing Pole', keywords: ['fish', 'hobby'] },
      { char: '🤿', name: 'Diving Mask', keywords: ['snorkel', 'scuba'] },
      { char: '🎯', name: 'Bullseye', keywords: ['darts', 'target', 'goal', 'hit'] },
      { char: '🎮', name: 'Video Game', keywords: ['controller', 'gaming', 'playstation', 'xbox'] },
      { char: '🕹️', name: 'Joystick', keywords: ['arcade', 'retro'] },
      { char: '🎲', name: 'Game Die', keywords: ['dice', 'luck', 'boardgame'] },
      { char: '🧩', name: 'Puzzle Piece', keywords: ['jigsaw', 'problem'] },
      { char: '♟️', name: 'Chess Pawn', keywords: ['strategy', 'chess'] },
      { char: '🎭', name: 'Performing Arts', keywords: ['theater', 'drama', 'masks'] },
      { char: '🎨', name: 'Artist Palette', keywords: ['art', 'paint', 'design', 'color'] },
      { char: '🎬', name: 'Clapper Board', keywords: ['movie', 'film', 'cinema'] },
      { char: '🎤', name: 'Microphone', keywords: ['sing', 'karaoke', 'music'] },
      { char: '🎧', name: 'Headphone', keywords: ['music', 'audio', 'listen'] },
      { char: '🎼', name: 'Musical Score', keywords: ['notes', 'song'] },
      { char: '🎹', name: 'Musical Keyboard', keywords: ['piano', 'music'] },
      { char: '🥁', name: 'Drum', keywords: ['music', 'beat'] },
      { char: '🎷', name: 'Saxophone', keywords: ['jazz', 'music'] },
      { char: '🎺', name: 'Trumpet', keywords: ['brass', 'music'] },
      { char: '🎸', name: 'Guitar', keywords: ['rock', 'acoustic', 'music'] },
      { char: '🎻', name: 'Violin', keywords: ['classical', 'strings'] },
      { char: '🏆', name: 'Trophy', keywords: ['winner', 'first', 'champion', 'cup'] },
      { char: '🥇', name: '1st Place Medal', keywords: ['gold', 'winner'] },
      { char: '🥈', name: '2nd Place Medal', keywords: ['silver'] },
      { char: '🥉', name: '3rd Place Medal', keywords: ['bronze'] },
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '💡',
    emojis: [
      { char: '💡', name: 'Light Bulb', keywords: ['idea', 'bright', 'smart', 'energy'] },
      { char: '🔦', name: 'Flashlight', keywords: ['torch', 'light'] },
      { char: '🕯️', name: 'Candle', keywords: ['flame', 'light'] },
      { char: '📱', name: 'Mobile Phone', keywords: ['iphone', 'smartphone', 'cell'] },
      { char: '📲', name: 'Mobile Phone with Arrow', keywords: ['call', 'message'] },
      { char: '💻', name: 'Laptop', keywords: ['computer', 'pc', 'macbook', 'work', 'code'] },
      { char: '⌨️', name: 'Keyboard', keywords: ['type', 'coding'] },
      { char: '🖥️', name: 'Desktop Computer', keywords: ['monitor', 'screen'] },
      { char: '🖨️', name: 'Printer', keywords: ['paper', 'office'] },
      { char: '🖱️', name: 'Computer Mouse', keywords: ['click'] },
      { char: '📷', name: 'Camera', keywords: ['photo', 'picture'] },
      { char: '📹', name: 'Video Camera', keywords: ['film', 'record'] },
      { char: '🔍', name: 'Magnifying Glass Left', keywords: ['search', 'find', 'zoom'] },
      { char: '🔎', name: 'Magnifying Glass Right', keywords: ['search', 'inspect'] },
      { char: '📦', name: 'Package', keywords: ['box', 'delivery', 'parcel'] },
      { char: '📧', name: 'E-Mail', keywords: ['letter', 'inbox', 'mail'] },
      { char: '✉️', name: 'Envelope', keywords: ['letter', 'post'] },
      { char: '📝', name: 'Memo', keywords: ['note', 'write', 'paper', 'text'] },
      { char: '📄', name: 'Page Facing Up', keywords: ['document', 'file'] },
      { char: '📊', name: 'Bar Chart', keywords: ['analytics', 'stats', 'growth'] },
      { char: '📈', name: 'Chart Increasing', keywords: ['stonks', 'up', 'profit'] },
      { char: '📉', name: 'Chart Decreasing', keywords: ['down', 'loss'] },
      { char: '📁', name: 'File Folder', keywords: ['directory'] },
      { char: '📂', name: 'Open File Folder', keywords: ['files'] },
      { char: '📅', name: 'Calendar', keywords: ['date', 'schedule', 'event'] },
      { char: '📆', name: 'Tear-Off Calendar', keywords: ['date', 'time'] },
      { char: '📚', name: 'Books', keywords: ['study', 'library', 'read'] },
      { char: '📖', name: 'Open Book', keywords: ['reading', 'learning'] },
      { char: '🔖', name: 'Bookmark', keywords: ['mark', 'save'] },
      { char: '🔗', name: 'Link', keywords: ['url', 'hyperlink', 'chain'] },
      { char: '📎', name: 'Paperclip', keywords: ['attachment'] },
      { char: '📐', name: 'Triangular Ruler', keywords: ['measure', 'math'] },
      { char: '📏', name: 'Straight Ruler', keywords: ['length', 'measure'] },
      { char: '📌', name: 'Pushpin', keywords: ['pin', 'location', 'notice'] },
      { char: '📍', name: 'Round Pushpin', keywords: ['map', 'location'] },
      { char: '✂️', name: 'Scissors', keywords: ['cut', 'tool'] },
      { char: '🖊️', name: 'Pen', keywords: ['write', 'ink'] },
      { char: '🖋️', name: 'Fountain Pen', keywords: ['fancy', 'signature'] },
      { char: '✒️', name: 'Black Nib', keywords: ['pen', 'author'] },
      { char: '🖌️', name: 'Paintbrush', keywords: ['artist', 'art'] },
      { char: '🖍️', name: 'Crayon', keywords: ['drawing', 'color'] },
      { char: '🔒', name: 'Locked', keywords: ['security', 'private', 'password'] },
      { char: '🔓', name: 'Unlocked', keywords: ['open', 'public'] },
      { char: '🔑', name: 'Key', keywords: ['password', 'auth', 'access'] },
      { char: '🗝️', name: 'Old Key', keywords: ['secret', 'vintage'] },
      { char: '🔨', name: 'Hammer', keywords: ['tool', 'build'] },
      { char: '🛠️', name: 'Hammer and Wrench', keywords: ['tools', 'settings', 'fix'] },
      { char: '⚙️', name: 'Gear', keywords: ['settings', 'config', 'cog'] },
      { char: '🧲', name: 'Magnet', keywords: ['attract', 'magnetic'] },
      { char: '🧪', name: 'Test Tube', keywords: ['science', 'chemistry', 'experiment'] },
      { char: '🧬', name: 'DNA', keywords: ['biology', 'genes'] },
      { char: '🔬', name: 'Microscope', keywords: ['science', 'lab'] },
      { char: '🔭', name: 'Telescope', keywords: ['astronomy', 'stars'] },
      { char: '📡', name: 'Satellite Antenna', keywords: ['dish', 'radar'] },
      { char: '🔋', name: 'Battery', keywords: ['power', 'energy'] },
      { char: '🔌', name: 'Electric Plug', keywords: ['power', 'cable'] },
      { char: '💎', name: 'Gem Stone', keywords: ['diamond', 'jewel', 'rich'] },
      { char: '🔔', name: 'Bell', keywords: ['notification', 'alert', 'alarm'] },
      { char: '🔕', name: 'Bell with Slash', keywords: ['mute', 'silent'] },
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: '💖',
    emojis: [
      { char: '❤️', name: 'Red Heart', keywords: ['love', 'heart'] },
      { char: '🧡', name: 'Orange Heart', keywords: ['love'] },
      { char: '💛', name: 'Yellow Heart', keywords: ['friendship'] },
      { char: '💚', name: 'Green Heart', keywords: ['nature', 'love'] },
      { char: '💙', name: 'Blue Heart', keywords: ['peace', 'love'] },
      { char: '💜', name: 'Purple Heart', keywords: ['love', 'bts'] },
      { char: '🖤', name: 'Black Heart', keywords: ['dark', 'love'] },
      { char: '🤍', name: 'White Heart', keywords: ['pure', 'love'] },
      { char: '🤎', name: 'Brown Heart', keywords: ['love'] },
      { char: '💔', name: 'Broken Heart', keywords: ['heartbreak', 'sad'] },
      { char: '❤️‍🔥', name: 'Heart on Fire', keywords: ['passion', 'lust'] },
      { char: '💕', name: 'Two Hearts', keywords: ['love', 'hearts'] },
      { char: '💖', name: 'Sparkling Heart', keywords: ['sparkle', 'love'] },
      { char: '💗', name: 'Growing Heart', keywords: ['love', 'nervous'] },
      { char: '💘', name: 'Heart with Arrow', keywords: ['cupid', 'love'] },
      { char: '✅', name: 'Check Mark Button', keywords: ['done', 'yes', 'correct', 'pass'] },
      { char: '❌', name: 'Cross Mark', keywords: ['no', 'wrong', 'fail', 'x'] },
      { char: '❎', name: 'Cross Mark Button', keywords: ['no', 'delete'] },
      { char: '➕', name: 'Plus', keywords: ['add', 'more', 'math'] },
      { char: '➖', name: 'Minus', keywords: ['subtract', 'less'] },
      { char: '✖️', name: 'Multiply', keywords: ['times', 'math'] },
      { char: '➗', name: 'Divide', keywords: ['division', 'math'] },
      { char: '♾️', name: 'Infinity', keywords: ['forever', 'infinite'] },
      { char: '❓', name: 'Red Question Mark', keywords: ['confused', 'query', 'help'] },
      { char: '❔', name: 'White Question Mark', keywords: ['doubt'] },
      { char: '❗', name: 'Red Exclamation Mark', keywords: ['warning', 'alert', 'important'] },
      { char: '❕', name: 'White Exclamation Mark', keywords: ['notice'] },
      { char: '⚠️', name: 'Warning', keywords: ['alert', 'caution', 'danger'] },
      { char: '⛔', name: 'No Entry', keywords: ['stop', 'forbidden'] },
      { char: '🚫', name: 'Prohibited', keywords: ['forbidden', 'no'] },
      { char: '☢️', name: 'Radioactive', keywords: ['hazard', 'danger'] },
      { char: '☣️', name: 'Biohazard', keywords: ['hazard', 'virus'] },
      { char: '⬆️', name: 'Up Arrow', keywords: ['north', 'top'] },
      { char: '↗️', name: 'Up-Right Arrow', keywords: ['diagonal'] },
      { char: '➡️', name: 'Right Arrow', keywords: ['east', 'next'] },
      { char: '↘️', name: 'Down-Right Arrow', keywords: ['diagonal'] },
      { char: '⬇️', name: 'Down Arrow', keywords: ['south', 'bottom'] },
      { char: '↙️', name: 'Down-Left Arrow', keywords: ['diagonal'] },
      { char: '⬅️', name: 'Left Arrow', keywords: ['west', 'back'] },
      { char: '↖️', name: 'Up-Left Arrow', keywords: ['diagonal'] },
      { char: '↕️', name: 'Up-Down Arrow', keywords: ['vertical'] },
      { char: '↔️', name: 'Left-Right Arrow', keywords: ['horizontal'] },
      { char: '🔄', name: 'Counterclockwise Arrows Button', keywords: ['sync', 'reload', 'repeat'] },
      { char: '🔁', name: 'Repeat Button', keywords: ['loop', 'playlist'] },
      { char: '🔂', name: 'Repeat Single Button', keywords: ['loop one'] },
      { char: '▶️', name: 'Play Button', keywords: ['start', 'video'] },
      { char: '⏸️', name: 'Pause Button', keywords: ['wait', 'hold'] },
      { char: '⏹️', name: 'Stop Button', keywords: ['halt'] },
      { char: '⏺️', name: 'Record Button', keywords: ['rec', 'dot'] },
      { char: '🔊', name: 'Speaker High Volume', keywords: ['sound', 'loud', 'audio'] },
      { char: '🔇', name: 'Muted Speaker', keywords: ['silent', 'quiet'] },
      { char: '⚡', name: 'High Voltage', keywords: ['lightning', 'zap', 'fast', 'power'] },
      { char: '💥', name: 'Collision', keywords: ['boom', 'blast', 'explode'] },
      { char: '🌟', name: 'Glowing Star', keywords: ['magic', 'glam'] },
      { char: '⭐', name: 'Star', keywords: ['favorite', 'rating'] },
      { char: '💫', name: 'Dizzy', keywords: ['stars', 'sparkle'] },
    ],
  },
  {
    id: 'flags',
    name: 'Flags',
    icon: '🏁',
    emojis: FLAG_EMOJIS,
  },
];

const RECENT_STORAGE_KEY = 'editkit_recent_emojis';

export class EmojiPicker {
  readonly element: HTMLElement;
  private editor: EditKitEditor;
  private onSelect?: (emoji: string) => void;

  private searchInput!: HTMLInputElement;
  private navContainer!: HTMLElement;
  private contentContainer!: HTMLElement;
  private previewFooter!: HTMLElement;
  private previewIcon!: HTMLElement;
  private previewTitle!: HTMLElement;

  private searchQuery: string = '';
  private recentEmojis: EmojiItem[] = [];
  private savedEditorRange: Range | null = null;

  constructor(editor: EditKitEditor, onSelect?: (emoji: string) => void) {
    this.editor = editor;
    this.onSelect = onSelect;

    this.element = document.createElement('div');
    this.element.classList.add('editkit-emoji-picker');
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-label', 'Emoji picker');

    this._loadRecent();
    this._buildUI();
  }

  private _loadRecent(): void {
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      if (stored) {
        this.recentEmojis = JSON.parse(stored);
      }
    } catch {
      this.recentEmojis = [];
    }

    if (this.recentEmojis.length === 0) {
      this.recentEmojis = [
        { char: '😀', name: 'Grinning Face', keywords: ['smile', 'happy'] },
        { char: '🔥', name: 'Fire', keywords: ['hot', 'lit'] },
        { char: '✨', name: 'Sparkles', keywords: ['magic', 'shine'] },
        { char: '🚀', name: 'Rocket', keywords: ['space', 'fast'] },
        { char: '🎉', name: 'Party Popper', keywords: ['celebrate', 'tada'] },
        { char: '💡', name: 'Light Bulb', keywords: ['idea'] },
        { char: '✅', name: 'Check Mark', keywords: ['done'] },
        { char: '❤️', name: 'Red Heart', keywords: ['love'] },
      ];
    }
  }

  private _saveRecent(emoji: EmojiItem): void {
    try {
      this.recentEmojis = [emoji, ...this.recentEmojis.filter(x => x.char !== emoji.char)].slice(0, 16);
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(this.recentEmojis));
    } catch {
      // Ignore storage errors
    }
  }

  private _buildUI(): void {
    this.element.innerHTML = '';

    // ── 1. Search Bar (Full Width with Clean Apple Look) ──
    const searchWrap = document.createElement('div');
    searchWrap.classList.add('editkit-emoji-search-wrap');

    const searchIcon = document.createElement('span');
    searchIcon.classList.add('editkit-emoji-search-icon');
    searchIcon.innerHTML = icons.search || `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.classList.add('editkit-emoji-search-input');
    this.searchInput.placeholder = 'Search emojis...';
    this.searchInput.addEventListener('input', () => {
      this.searchQuery = this.searchInput.value.trim().toLowerCase();
      this._renderGrid();
    });

    searchWrap.appendChild(searchIcon);
    searchWrap.appendChild(this.searchInput);
    this.element.appendChild(searchWrap);

    // ── 2. Category Nav Tabs Row (Apple iOS Icon Artwork) ──
    this.navContainer = document.createElement('div');
    this.navContainer.classList.add('editkit-emoji-nav');

    // Recent tab
    const recentTab = document.createElement('button');
    recentTab.type = 'button';
    recentTab.classList.add('editkit-emoji-nav-btn');
    recentTab.appendChild(renderAppleEmoji('🕒', 'Frequently Used', 'editkit-apple-emoji-nav'));
    recentTab.title = 'Frequently Used';
    recentTab.addEventListener('click', (e) => {
      e.preventDefault();
      this._scrollToCategory('section-frequent');
    });
    this.navContainer.appendChild(recentTab);

    // Categories tabs
    EMOJI_DATA.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('editkit-emoji-nav-btn');
      btn.appendChild(renderAppleEmoji(cat.icon, cat.name, 'editkit-apple-emoji-nav'));
      btn.title = cat.name;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this._scrollToCategory(`section-${cat.id}`);
      });
      this.navContainer.appendChild(btn);
    });

    this.element.appendChild(this.navContainer);

    // ── 3. Scrollable Content Area ──
    this.contentContainer = document.createElement('div');
    this.contentContainer.classList.add('editkit-emoji-content');
    this.element.appendChild(this.contentContainer);

    // ── 4. Bottom Mood / Preview Footer ──
    this.previewFooter = document.createElement('div');
    this.previewFooter.classList.add('editkit-emoji-footer');

    this.previewIcon = document.createElement('div');
    this.previewIcon.classList.add('editkit-emoji-footer-icon');
    this.previewIcon.appendChild(renderAppleEmoji('😊', 'Smiling Face', 'editkit-apple-emoji-lg'));

    this.previewTitle = document.createElement('div');
    this.previewTitle.classList.add('editkit-emoji-footer-title');
    this.previewTitle.textContent = "What's Your Mood?";

    this.previewFooter.appendChild(this.previewIcon);
    this.previewFooter.appendChild(this.previewTitle);
    this.element.appendChild(this.previewFooter);

    this._renderGrid();
  }

  private _scrollToCategory(sectionId: string): void {
    const el = this.contentContainer.querySelector(`#${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private _renderGrid(): void {
    this.contentContainer.innerHTML = '';

    if (this.searchQuery) {
      // ── Search Results View ──
      const allResults: EmojiItem[] = [];
      EMOJI_DATA.forEach(cat => {
        cat.emojis.forEach(item => {
          if (
            item.name.toLowerCase().includes(this.searchQuery) ||
            item.keywords.some(k => k.toLowerCase().includes(this.searchQuery))
          ) {
            allResults.push(item);
          }
        });
      });

      const header = document.createElement('div');
      header.classList.add('editkit-emoji-section-header');
      header.textContent = `Search Results (${allResults.length})`;
      this.contentContainer.appendChild(header);

      if (allResults.length === 0) {
        const noResult = document.createElement('div');
        noResult.classList.add('editkit-emoji-empty');
        noResult.textContent = 'No matching emojis found';
        this.contentContainer.appendChild(noResult);
        return;
      }

      const grid = document.createElement('div');
      grid.classList.add('editkit-emoji-grid');
      allResults.forEach(item => {
        grid.appendChild(this._createEmojiButton(item));
      });
      this.contentContainer.appendChild(grid);
      return;
    }

    // ── 1. Frequently Used Section ──
    if (this.recentEmojis.length > 0) {
      const recentSec = document.createElement('div');
      recentSec.id = 'section-frequent';
      recentSec.classList.add('editkit-emoji-section');

      const secHeader = document.createElement('div');
      secHeader.classList.add('editkit-emoji-section-header');
      secHeader.textContent = 'Frequently Used';

      const grid = document.createElement('div');
      grid.classList.add('editkit-emoji-grid');

      this.recentEmojis.forEach(item => {
        grid.appendChild(this._createEmojiButton(item));
      });

      recentSec.appendChild(secHeader);
      recentSec.appendChild(grid);
      this.contentContainer.appendChild(recentSec);
    }

    // ── 2. All Categories ──
    EMOJI_DATA.forEach(cat => {
      const sec = document.createElement('div');
      sec.id = `section-${cat.id}`;
      sec.classList.add('editkit-emoji-section');

      const secHeader = document.createElement('div');
      secHeader.classList.add('editkit-emoji-section-header');
      secHeader.textContent = cat.name;

      const grid = document.createElement('div');
      grid.classList.add('editkit-emoji-grid');

      cat.emojis.forEach(item => {
        grid.appendChild(this._createEmojiButton(item));
      });

      sec.appendChild(secHeader);
      sec.appendChild(grid);
      this.contentContainer.appendChild(sec);
    });
  }

  private _createEmojiButton(item: EmojiItem): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('editkit-emoji-item-btn');
    btn.appendChild(renderAppleEmoji(item.char, item.name, 'editkit-apple-emoji'));
    btn.setAttribute('aria-label', item.name);
    btn.setAttribute('title', item.name);

    btn.addEventListener('mouseenter', () => {
      this.previewIcon.innerHTML = '';
      this.previewIcon.appendChild(renderAppleEmoji(item.char, item.name, 'editkit-apple-emoji-lg'));
      this.previewTitle.textContent = item.name;
    });

    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._selectEmoji(item);
    });

    return btn;
  }

  private _selectEmoji(item: EmojiItem): void {
    this._saveRecent(item);
    this._restoreEditorSelection();
    document.execCommand('insertText', false, item.char);
    this.savedEditorRange = null;
    this.onSelect?.(item.char);
  }

  focusSearch(): void {
    this._saveEditorSelection();
    setTimeout(() => {
      this.searchInput.focus();
      this.searchInput.select();
    }, 40);
  }

  private _saveEditorSelection(): void {
    this.savedEditorRange = null;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (this.editor.contentEl.contains(range.commonAncestorContainer)) {
      this.savedEditorRange = range.cloneRange();
    }
  }

  private _restoreEditorSelection(): void {
    const range = this.savedEditorRange;
    if (!range || !range.commonAncestorContainer.isConnected ||
      !this.editor.contentEl.contains(range.commonAncestorContainer)) {
      this.editor.focus('end');
      return;
    }

    this.editor.contentEl.focus({ preventScroll: true });
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}
