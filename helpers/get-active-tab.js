export default async function getActiveTab() {
  try {
    let queryOption = { active: true, currentWindow: true };
    let [data] = await browser.tabs.query(queryOption);
    return data;
  } catch (e) {
    throw new Error("get active tab error", e);
  }
}
