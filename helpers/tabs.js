import { ErrorMessages } from "../constants/constants.js";

export function sendMessage(tabID, message) {
  try {
    let response = browser.tabs.sendMessage(tabID, message);
    return response;
  } catch (ex) {
    throw new Error(ErrorMessages.SEND_TAB, ex);
  }
}

export async function getActive() {
  try {
    const queryOptions = { active: true, currentWindow: true };
    const [data] = await browser.tabs.query(queryOptions);
    return data;
  } catch (ex) {
    throw new Error(ErrorMessages.ACTIVE_TAB, ex);
  }
}
