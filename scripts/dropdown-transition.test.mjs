import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

class FakeClassList {
  values = new Set();

  add(...classNames) {
    classNames.forEach(className => this.values.add(className));
  }

  remove(...classNames) {
    classNames.forEach(className => this.values.delete(className));
  }

  contains(className) {
    return this.values.has(className);
  }
}

class FakeElement {
  children = [];
  classList = new FakeClassList();
  attributes = new Map();
  listeners = new Map();
  offsetWidth = 240;

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchTransitionEnd() {
    for (const listener of this.listeners.get('transitionend') ?? []) {
      listener({ target: this });
    }
  }
}

class FakeButton extends FakeElement {}

globalThis.HTMLElement = FakeElement;
globalThis.HTMLButtonElement = FakeButton;
globalThis.window = {
  getComputedStyle: () => ({
    transitionDuration: '0.15s',
    transitionDelay: '0s',
  }),
  setTimeout,
  clearTimeout,
};

const source = await readFile(new URL('../packages/ui/src/DropdownTransition.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`;
const { closeDropdown, openDropdown } = await import(moduleUrl);

function dropdownFixture(surfaceClass = 'editkit-tb-dropdown-menu') {
  const wrap = new FakeElement();
  const trigger = new FakeButton();
  const surface = new FakeElement();
  surface.classList.add(surfaceClass);
  wrap.children.push(trigger, surface);
  return { wrap, trigger, surface };
}

test('dropdown remains rendered only while opening and closing transitions run', () => {
  const { wrap, trigger, surface } = dropdownFixture();
  const openClass = 'editkit-tb-dropdown-wrap--open';

  openDropdown(wrap, openClass);
  assert.equal(wrap.classList.contains(openClass), true);
  assert.equal(wrap.classList.contains('editkit-dropdown-wrap--transitioning'), true);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(surface.getAttribute('aria-hidden'), 'false');

  surface.dispatchTransitionEnd();
  assert.equal(wrap.classList.contains(openClass), true);
  assert.equal(wrap.classList.contains('editkit-dropdown-wrap--transitioning'), false);

  closeDropdown(wrap, openClass);
  assert.equal(wrap.classList.contains(openClass), false);
  assert.equal(wrap.classList.contains('editkit-dropdown-wrap--transitioning'), true);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(surface.getAttribute('aria-hidden'), 'true');

  surface.dispatchTransitionEnd();
  assert.equal(wrap.classList.contains('editkit-dropdown-wrap--transitioning'), false);
});

test('reopening during a close cancels stale cleanup', () => {
  const { wrap, surface } = dropdownFixture('editkit-emoji-picker');
  const openClass = 'editkit-tb-dropdown-wrap--open';

  openDropdown(wrap, openClass);
  surface.dispatchTransitionEnd();
  closeDropdown(wrap, openClass);
  openDropdown(wrap, openClass);
  surface.dispatchTransitionEnd();

  assert.equal(wrap.classList.contains(openClass), true);
  assert.equal(wrap.classList.contains('editkit-dropdown-wrap--transitioning'), false);
});

test('closed dropdown CSS keeps transition frames renderable without mobile overflow', async () => {
  const css = await readFile(new URL('../packages/ui/src/styles/editor.css', import.meta.url), 'utf8');

  assert.match(
    css,
    /:not\(\.editkit-tb-dropdown-wrap--open\):not\(\.editkit-dropdown-wrap--transitioning\) > \.editkit-tb-dropdown-menu/,
  );
  assert.match(
    css,
    /:not\(\.editkit-bubble-dropdown-wrap--open\):not\(\.editkit-dropdown-wrap--transitioning\) > \.editkit-color-picker/,
  );
});
