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

// The function is fire when DOM is loaded (means extension dom)
const popup = async function () {
  try {
    const tab = await tabs.getActive();
    const partsURL = url.composeParts(tab.url);

    logger(popup.name, FILE_NAME, arguments, partsURL);

    if (!partsURL)
      return;

    printHostname(partsURL.hostname);

    dom.addLis(".parse-button", "click", onParse, tab, partsURL);
    dom.addLis("#search-word__input", "input", onParse, tab, partsURL);
    dom.addLis("#min-repeats__input", "input", onParse, tab, partsURL);
    dom.addLis(".upload-button", "click", onSession);
    dom.addLis("#session-min-repeats", "input", onSession);
    dom.addLis("#session-limit-words", "input", onSession);
    dom.addLis("#session-by-site", "input", onSession);
    dom.addLis("#session-search-word", "input", onSession);

    void 0;
  } catch (ex) {
    logger(popup.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

dom.addLis(document, "DOMContentLoaded", popup);
