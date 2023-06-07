export async function readFromStorage(key) {
	try {
		let data = await browser.storage.local.get([key]);
		return data[key];
	} catch (e) {
		throw new Error("read from storage error", e);
	}
}

export async function saveToStorage(data) {
	try {
		await browser.storage.local.set(data);
	} catch (e) {
		throw new Error("save to storage error", e);
	}
}
