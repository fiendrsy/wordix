"use strict";

import { logger } from "../../helpers/logger.js";
import { writeErrors } from "../../helpers/error.js";

const FILE_NAME = "dom.js";

const HTML_TAGS = new Set([
  "a", "article", "aside", "audio", "b", "blockquote", "br", "button", "cite", "code",
  "div", "em", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr",
  "i", "iframe", "img", "input", "label", "li", "main", "nav", "ol", "option", "p",
  "section", "select", "span", "strike", "strong", "sub", "sup", "table", "tbody", "td",
  "tfoot", "th", "thead", "tr", "u", "ul", "video"
]);

export const gDoc = () => document;

export const gBody = () => document.body;

const isDOMElement = (target) => target instanceof HTMLElement || target === gDoc();

const isExistsSelector = (sl) => document.querySelector(sl) instanceof HTMLElement;

const isValidFormat = (sl) => sl.startsWith(".") || sl.startsWith("#");

const isValidSelector = (sl) => {
  const VALID = true;
  const INVALID = false;

  if (typeof sl !== "string") {
    return INVALID;
  } else if (!isValidFormat(sl)) {
    return INVALID;
  } else if (!isExistsSelector(sl)) {
    return INVALID;
  } else {
    return VALID;
  }
};

export const qSl = (sl, all = false) => {
  if (!isValidSelector(sl)) {
    logger(qSl.name, FILE_NAME, { sl, all });
    writeErrors(sl);

    return null;
  }

  if (all)
    return document.querySelectorAll(sl);
  else
    return document.querySelector(sl);
};

export const cEl = (el) => {
  if (typeof el !== "string" || !HTML_TAGS.has(el)) {
    logger(cEl.name, FILE_NAME, { el });
    writeErrors(el);

    return null;
  }

  return document.createElement(el);
};

export const gVal = (sl) => {
  if (!isValidSelector(sl)) {
    logger(gVal.name, FILE_NAME, { sl });
    writeErrors(sl);

    return "";
  }

  const el = qSl(sl);

  return el instanceof HTMLInputElement ? el.value.trim() : "";
};

const determineTarget = (target) => {
  let result;

  if (isDOMElement(target)) {
    result = target;
  } else if (isValidSelector(target)) {
    result = qSl(target);
  } else {
    logger(addLis.name, FILE_NAME, target);
    writeErrors(target);

    return null;
  }

  return result;
};

export const addLis = (target, event, fn, ...args) => {
  if (typeof event !== "string" || typeof fn !== "function") {
    logger(addLis.name, FILE_NAME, { event, fn });
    writeErrors(event, fn);

    return;
  }

  const wrapper = async (ev) => await fn(ev, ...args);
  const el = determineTarget(target);

  if (!el) {
    logger(addLis.name, FILE_NAME, target, el);
    writeErrors(target, el);

    return;
  }

  el.addEventListener(event, wrapper);

  void 0;
};

export const addCl = (el, cl) => {
  if (!isDOMElement(el) || typeof cl !== "string") {
    logger(addCl.name, FILE_NAME, el, cl);
    writeErrors(el, cl);

    return;
  }

  el.classList.add(cl);

  void 0;
}

export const setAttr = (el, attr, val) => {
  if (!isDOMElement(el) || typeof attr !== "string" || typeof val !== "string") {
    logger(setAttr.name, FILE_NAME, el, attr, val);
    writeErrors(el, attr, val);

    return;
  }

  el.setAttribute(attr, val);

  void 0;
}

export const text = (target, text = "") => {
  const el = determineTarget(target);

  if (!el) {
    logger(addLis.name, FILE_NAME, target, el);
    writeErrors(target, el);

    return;
  }

  el.textContent = text;

  void 0;
};

