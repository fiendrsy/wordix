"use strict";

import * as dom from "./dom.js";
import { onParse } from "./parse.js";
import { onSession } from "./session.js";
import { printHostname } from "./print-hostname.js";
import { logger } from "../../helpers/logger.js";
import * as tabs from "../../helpers/tabs.js";
import * as url from "../../helpers/url.js";
import { writeErrors } from "../../helpers/error.js";

// The current file name needed for logger
const FILE_NAME = "popup.js";

const initSubscriptions = (...args) => {
  const selectors = {
    buttons: [".parse-button", ".upload-button"],
    inputs: [
      "#session-min-repeats",
      "#session-limit-words",
      "#session-by-site",
      "#session-search-word",
      "#search-word__input",
      "#min-repeats__input",
    ],
  };

  selectors.buttons.forEach((s) => {
    let fn = s.startsWith(".upload") ? onSession : onParse;

    dom.addLis(s, "click", fn, ...args);
  });

  selectors.inputs.forEach((s) => {
    let fn = s.startsWith("#session") ? onSession : onParse;

    dom.addLis(s, "input", fn, ...args);
  });
};

const popup = async function () {
  try {
    const tab = await tabs.getActive();
    const partsURL = url.composeParts(tab.url);

    logger(popup.name, FILE_NAME, arguments, partsURL);

    if (partsURL) {
      printHostname(partsURL.hostname);
      initSubscriptions(tab, partsURL);
    }
  } catch (ex) {
    logger(popup.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

dom.addLis(document, "DOMContentLoaded", popup);
