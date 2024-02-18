"use strict";

import { writeErrors } from "./error.js";
import { logger } from "./logger.js";
import { ErrorMessages } from "../constants/constants.js";

// The current file name needed for logger
const FILE_NAME = "tabs.js";

export const sendMessage = async function (tabID, message = {}) {
  if (!tabID) {
    logger(sendMessage.name, FILE_NAME, { arguments });
    writeErrors(tabID);

    throw new Error(ErrorMessages.WRONG_VALUE, tabID);
  }
  try {
    const response = await browser.tabs.sendMessage(tabID, message);

    logger(sendMessage.name, FILE_NAME, { arguments, response });

    return response;
  } catch (ex) {
    const isError = browser.runtime.lastError;

    logger(sendMessage.name, FILE_NAME, { arguments, isError });
    writeErrors(ex, isError);

    throw new Error(ex.message, ex);
  }
};

export const getActive = async function () {
  try {
    const queryOptions = { active: true, currentWindow: true };

    logger(getActive.name, FILE_NAME, { arguments, queryOptions });

    const data = await browser.tabs.query(queryOptions);

    return data.pop();
  } catch (ex) {
    const isError = browser.runtime.lastError;

    logger(sendMessage.name, FILE_NAME, { arguments, isError });
    writeErrors(ex, isError);

    throw new Error(ex.message, ex);
  }
};
