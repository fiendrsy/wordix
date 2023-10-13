export async function readAll() {
  try {
    const data = await browser.storage.local.get();
    return data;
  } catch (e) {
    throw new Error("read all from storage error", e);
  }
}

export async function read(key) {
  try {
    const data = await browser.storage.local.get([key]);
    return data[key];
  } catch (e) {
    throw new Error("read from storage error", e);
  }
}

export async function save(data) {
  try {
    await browser.storage.local.set(data);
  } catch (e) {
    throw new Error("save to storage error", e);
  }
}
