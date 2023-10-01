export default async function getActiveTab() {
  try {
    const queryOptions = { active: true, currentWindow: true };
    const [data] = await browser.tabs.query(queryOptions);
    return data;
  } catch (e) {
    throw new Error("get active tab error", e);
  }
}
