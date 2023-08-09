export default async function readAllFromStorage() {
  try {
    const data = await browser.storage.local.get();
    return data;
  } catch (e) {
    throw new Error("read all from storage error", e);
  }
}
