"use strict";

import { ErrorMessages } from "../constants/constants.js";
import { logger } from "./logger.js";

// The current file name needed for logger
const FILE_NAME = "tabs.js";

export const sendMessage = async function (tabID, message = {}) {
  if (!tabID) {
    logger(sendMessage.name, FILE_NAME, { arguments });
    console.error(`${tabID} ${ErrorMessages.WRONG_VALUE}`);

    throw new Error(ErrorMessages.ACTIVE_TAB, ex);
  }
  try {
    const response = browser.tabs.sendMessage(tabID, message);

    logger(sendMessage.name, FILE_NAME, { arguments, response });

    return response;
  } catch (ex) {
    const isError = browser.runtime.lastError;

    logger(sendMessage.name, FILE_NAME, { arguments, isError });
    console.error(ErrorMessages.SEND_TAB, ex);

    throw new Error(ErrorMessages.ACTIVE_TAB, ex);
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
    console.error(ErrorMessages.ACTIVE_TAB, ex);

    throw new Error(ErrorMessages.ACTIVE_TAB, ex);
  }
};
