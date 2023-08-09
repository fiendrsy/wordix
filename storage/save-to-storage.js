export default async function saveToStorage(data) {
  try {
    await browser.storage.local.set(data);
  } catch (e) {
    throw new Error("save to storage error", e);
  }
}
