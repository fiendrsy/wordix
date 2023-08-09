export default function tabsSendMessage(tabId, message) {
  try {
    let response = browser.tabs.sendMessage(tabId, message);
    return response;
  } catch (e) {
    throw new Error("tabs send message error", e);
  }
}
