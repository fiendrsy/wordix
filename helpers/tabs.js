export function sendMessage(tabId, message) {
  try {
    let response = browser.tabs.sendMessage(tabId, message);
    return response;
  } catch (e) {
    throw new Error("tabs send message error", e);
  }
}

export async function getActive() {
  try {
    const queryOptions = { active: true, currentWindow: true };
    const [data] = await browser.tabs.query(queryOptions);
    return data;
  } catch (e) {
    throw new Error("get active tab error", e);
  }
}
