import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';

const { document, window } = parseHTML('<!doctype html><html><body></body></html>');
Object.assign(globalThis, {
  window,
  document,
  Node: window.Node,
  Element: window.Element,
  HTMLElement: window.HTMLElement,
  HTMLButtonElement: window.HTMLButtonElement,
  HTMLInputElement: window.HTMLInputElement,
  HTMLTableElement: window.HTMLTableElement,
  HTMLTableCellElement: window.HTMLTableCellElement,
  HTMLTableRowElement: window.HTMLTableRowElement,
  Image: window.Image,
  FileReader: window.FileReader,
  requestAnimationFrame: callback => setTimeout(callback, 0),
  cancelAnimationFrame: clearTimeout,
  getComputedStyle: element => window.getComputedStyle?.(element) ?? {
    transitionDuration: '0s',
    transitionDelay: '0s',
  },
});
window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
window.getSelection ??= () => null;
document.execCommand ??= () => false;
if (window.HTMLCanvasElement) {
  window.HTMLCanvasElement.prototype.getContext = () => ({
    scale() {},
    clearRect() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    closePath() {},
    fill() {},
    stroke() {},
    fillText() {},
    drawImage() {},
    setTransform() {},
  });
  window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';
}

const { EditKitEditor } = await import('../packages/core/dist/index.js');
const { EditKitToolbar, TableFloatingMenu } = await import('../packages/ui/dist/index.js');

const sanitizedHTML = `
  <table class="editkit-table"><tbody><tr><td>Brand</td><td>Example</td></tr></tbody></table>
  <div class="editkit-faq-block">
    <div class="editkit-faq-items"><div class="editkit-faq-item"><div class="editkit-faq-accent"></div><div class="editkit-faq-content"><div class="editkit-faq-question">Question?</div><div class="editkit-faq-answer">Answer.</div></div></div></div>
  </div>
  <div class="editkit-columns-container" data-editkit-block="columns" data-layout="50-50">
    <div class="editkit-columns-row">
      <div class="editkit-column-item" data-col="1"><div class="editkit-column-body"><p>Left</p></div></div>
      <div class="editkit-column-item" data-col="2"><div class="editkit-column-body"><p>Right</p></div></div>
    </div>
    <div class="editkit-columns-controls" data-legacy-control="true"><button>stale</button></div>
  </div>
  <div class="editkit-columns-container editkit-feature-row-container" data-editkit-block="columns" data-layout="50-50">
    <div class="editkit-columns-row">
      <div class="editkit-column-item" data-col="1"><div class="editkit-column-body"><h3 class="editkit-feature-col-title">Feature</h3></div></div>
      <div class="editkit-column-item" data-col="2"><div class="editkit-column-body"><p class="editkit-feature-col-desc">Preview</p></div></div>
    </div>
  </div>
  <div class="editkit-button-block" data-variant="filled" data-radius="rounded" data-align="left" data-color="#f59e0b"><a class="editkit-btn-element" href="/shop">Shop</a></div>
  <div class="editkit-section-heading"><span class="editkit-sec-badge">01</span><h2 class="editkit-sec-title">Heading</h2></div>
  <div class="editkit-decorative-divider editkit-dec-div--labeled"><span class="editkit-dec-div-line"></span><span class="editkit-dec-div-label">Label</span><span class="editkit-dec-div-line"></span></div>
  <figure class="editkit-pull-quote"><blockquote class="editkit-pq-quote">Quote</blockquote><figcaption class="editkit-pq-attribution">Author</figcaption></figure>
  <div class="editkit-hero-pattern"><h1 class="editkit-hero-headline">Hero</h1><div class="editkit-button-block"><a class="editkit-btn-element" href="/start">Start</a></div></div>
  <div class="editkit-cta-band-card"><div class="editkit-cta-card-glow"></div><div class="editkit-cta-card-info"><h2 class="editkit-cta-card-title">CTA</h2></div><div class="editkit-cta-card-action"><div class="editkit-button-block"><a class="editkit-btn-element" href="/go">Go</a></div><div class="editkit-cta-card-action-sub">Details</div></div></div>
  <div class="editkit-signature-card"><span class="editkit-signature-name">Name</span><span class="editkit-signature-date">Date</span></div>
  <div class="editkit-panel editkit-panel--info"><div class="editkit-panel-icon">i</div><div class="editkit-panel-body"><p>Panel</p></div></div>
  <figure class="editkit-chart-block" data-editkit-chart="bar"><figcaption class="editkit-chart-title">Chart</figcaption></figure>
  <div class="editkit-math-block" data-math="x^2"><span>x²</span></div>
`;

test('sanitized insert-element blocks rehydrate only inside an editable editor', () => {
  const editor = new EditKitEditor({ content: sanitizedHTML, editable: true });
  editor.mount(document.body);
  const toolbar = new EditKitToolbar(editor, { features: {} });

  assert.equal(editor.contentEl.querySelectorAll('.editkit-faq-add-btn').length, 1);
  assert.equal(editor.contentEl.querySelectorAll('.editkit-faq-item-delete').length, 1);
  assert.equal(editor.contentEl.querySelectorAll('.editkit-faq-block-delete').length, 1);
  assert.equal(editor.contentEl.querySelectorAll('.editkit-columns-handle').length, 2);
  assert.equal(editor.contentEl.querySelectorAll('.editkit-column-header').length, 4);
  assert.equal(editor.contentEl.querySelectorAll('.editkit-columns-controls').length, 2);
  assert.equal(editor.contentEl.querySelector('[data-legacy-control]'), null);
  assert.equal(editor.contentEl.querySelectorAll('.editkit-feature-img-placeholder').length, 1);
  assert.equal(editor.contentEl.querySelectorAll('.editkit-btn-edit-icon').length, 3);
  assert.equal(editor.contentEl.querySelector('.editkit-faq-question')?.getAttribute('contenteditable'), 'true');
  assert.equal(editor.contentEl.querySelector('.editkit-column-body')?.getAttribute('contenteditable'), 'true');
  assert.equal(editor.contentEl.querySelector('.editkit-button-block')?.getAttribute('contenteditable'), 'false');
  assert.equal(editor.contentEl.querySelector('.editkit-sec-title')?.getAttribute('contenteditable'), 'true');
  assert.equal(editor.contentEl.querySelector('.editkit-decorative-divider')?.getAttribute('contenteditable'), 'false');
  assert.equal(editor.contentEl.querySelector('.editkit-dec-div-label')?.getAttribute('contenteditable'), 'true');
  assert.equal(editor.contentEl.querySelector('.editkit-pq-quote')?.getAttribute('contenteditable'), 'true');
  assert.equal(editor.contentEl.querySelector('.editkit-cta-card-action')?.getAttribute('contenteditable'), 'false');
  assert.equal(editor.contentEl.querySelector('.editkit-signature-name')?.getAttribute('contenteditable'), 'true');
  assert.equal(editor.contentEl.querySelector('.editkit-panel-icon')?.getAttribute('contenteditable'), 'false');
  assert.equal(editor.contentEl.querySelector('.editkit-chart-block')?.getAttribute('contenteditable'), 'false');
  assert.equal(editor.contentEl.querySelector('.editkit-math-block')?.getAttribute('contenteditable'), 'false');

  const table = editor.contentEl.querySelector('table');
  const row = table?.querySelector('tr');
  const cell = row?.querySelector('th, td');
  assert.ok(table && row && cell);
  Object.defineProperty(table, 'rows', { value: [row] });
  Object.defineProperty(row, 'cells', { value: Array.from(row.querySelectorAll('th, td')) });
  Object.defineProperty(cell, 'cellIndex', { value: 0 });
  editor.root.getBoundingClientRect = () => ({ top: 0, right: 1000, bottom: 800, left: 0, width: 1000, height: 800, x: 0, y: 0, toJSON() {} });
  editor.contentEl.getBoundingClientRect = () => ({ top: 50, right: 1000, bottom: 800, left: 0, width: 1000, height: 750, x: 0, y: 50, toJSON() {} });
  table.getBoundingClientRect = () => ({ top: 120, right: 500, bottom: 220, left: 100, width: 400, height: 100, x: 100, y: 120, toJSON() {} });
  cell.getBoundingClientRect = () => ({ top: 120, right: 300, bottom: 170, left: 100, width: 200, height: 50, x: 100, y: 120, toJSON() {} });
  const tableMenu = new TableFloatingMenu(editor);
  tableMenu.mount(editor.root);
  editor.emit('tableSelect', {
    cellInfo: {
      table,
      row,
      cell,
      rowIndex: 0,
      colIndex: 0,
      totalRows: 1,
      totalCols: 2,
      isHeader: false,
    },
  });
  assert.equal(editor.root.querySelectorAll('.editkit-table-col-bullet').length, 0);
  assert.equal(editor.root.querySelectorAll('.editkit-table-row-bullet').length, 0);
  assert.equal(editor.root.querySelectorAll('.editkit-table-pill-btn--top').length, 1);
  assert.equal(editor.root.querySelectorAll('.editkit-table-pill-btn--bottom').length, 1);

  const serialized = editor.getHTML();
  assert.doesNotMatch(serialized, /data-editkit-(?:transient|runtime-attrs)/);
  assert.doesNotMatch(serialized, /contenteditable=|spellcheck=/);
  assert.doesNotMatch(serialized, /editkit-(?:faq-add-btn|faq-item-delete|faq-block-delete|columns-handle|column-header|columns-controls|btn-edit-icon|feature-img-placeholder)/);
  assert.match(serialized, /Question\?/);
  assert.match(serialized, /class="editkit-column-body"/);
  assert.match(serialized, /class="editkit-btn-element"/);
  assert.match(serialized, /class="editkit-cta-card-title"/);

  editor.setContent(serialized, false);
  assert.equal(editor.contentEl.querySelectorAll('.editkit-faq-add-btn').length, 1);
  assert.equal(editor.contentEl.querySelectorAll('.editkit-column-header').length, 4);
  assert.equal(editor.contentEl.querySelectorAll('.editkit-btn-edit-icon').length, 3);
  assert.equal(editor.contentEl.querySelector('.editkit-sec-title')?.getAttribute('contenteditable'), 'true');

  tableMenu.destroy();
  toolbar.destroy();
  editor.destroy();

  const readOnly = new EditKitEditor({ content: serialized, editable: false });
  assert.equal(readOnly.contentEl.querySelector('.editkit-faq-add-btn'), null);
  assert.equal(readOnly.contentEl.querySelector('.editkit-column-header'), null);
  assert.equal(readOnly.contentEl.querySelector('.editkit-btn-edit-icon'), null);
  assert.equal(readOnly.contentEl.querySelector('.editkit-sec-title')?.hasAttribute('contenteditable'), false);
  readOnly.destroy();
});
