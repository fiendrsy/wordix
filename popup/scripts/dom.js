"use strict";

import { logger } from "../../helpers/logger.js";
import { writeErrors } from "../../helpers/error.js";

const FILE_NAME = "dom.js";
const HTML_TAGS = [
  "div", "p", "span", "a", "img", "input", "button", "ul", "li", "ol", "form",
  "label", "h1", "h2", "h3", "h4", "h5", "h6", "header", "nav", "footer", "section",
  "article", "main", "aside", "header", "footer", "table", "tr", "td", "th", "tbody",
  "thead", "tfoot", "iframe", "video", "audio", "blockquote", "hr", "br", "textarea",
  "select", "option", "fieldset", "legend", "label", "cite", "abbr", "address", "cite",
  "code", "em", "strong", "sub", "sup", "b", "i", "u", "strike", "small", "big", "pre",
];

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
  if (typeof el !== "string" || !HTML_TAGS.includes(el)) {
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
}

export const addLis = (target, event, fn, ...args) => {
  if (typeof event !== "string" || typeof fn !== "function") {
    logger(addLis.name, FILE_NAME, { event, fn });
    writeErrors(event, fn);

    return;
  }

  const wrapper = async (ev) => await fn(ev, ...args);
  let el;

  if (target instanceof HTMLElement || target === document) {
    el = target;
  } else if (isValidSelector(target)) {
    el = qSl(target);
  } else {
    logger(addLis.name, FILE_NAME, { target });
    writeErrors(target);

    return;
  }

  el.addEventListener(event, wrapper);

  void 0;
};

export const text = (sl, text = "") => {
  if (!isValidSelector(sl)) {
    logger(text.name, FILE_NAME, { sl, text });
    writeErrors(sl, text);

    return;
  }

  const el = qSl(sl);

  el.textContent = text;

  void 0;
};

export const gDoc = () => document;

export const gBody = () => document.body;
