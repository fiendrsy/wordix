"use strict";

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

  if (typeof sl !== "string")
    return INVALID;
  else if (!isValidFormat(sl))
    return INVALID;
  else if (!isExistsSelector(sl))
    return INVALID;
  else
    return VALID;
};

export const qSl = (sl, all = false) => {
  if (!isValidSelector(sl))
    return null;

  if (all)
    return document.querySelectorAll(sl);
  else
    return document.querySelector(sl);
};

export const cEl = (el) => {
  if (typeof el !== "string" && HTML_TAGS.includes(el))
    return null;

  return document.createElement(el);
};

export const gVal = (sl) => {
  if (!isValidSelector(sl)) return "";

  return sl?.value?.trim() ?? "";
}

export const clearSl = (sl) => {
  if (!isValidSelector(sl)) return;

  document.querySelector(sl).textContent = "";

  void 0;
};
