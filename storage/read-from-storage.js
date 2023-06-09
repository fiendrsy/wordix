export default async function readFromStorage(key) {
	try {
		let data = await browser.storage.local.get([key]);
		return data[key];
	} catch (e) {
		throw new Error("read from storage error", e);
	}
}