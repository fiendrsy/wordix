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

const popup = async function () {
  try {
    const tab = await tabs.getActive();
    const partsURL = url.composeParts(tab.url);

    logger(popup.name, FILE_NAME, arguments, partsURL);

    if (partsURL) {
      printHostname(partsURL.hostname);

      for (let s of ["#search-word__input", "#min-repeats__input"]) {
        dom.addLis(s, "input", onSession, tab, partsURL);
      }

      for (let s of ["#session-min-repeats", "#session-limit-words", "#session-by-site", "#session-search-word"]) {
        dom.addLis(s, "input", onSession);
      }

      dom.addLis(".parse-button", "click", onParse, tab, partsURL);
      dom.addLis(".upload-button", "click", onSession);
    }

    void 0;
  } catch (ex) {
    logger(popup.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

dom.addLis(document, "DOMContentLoaded", popup);
