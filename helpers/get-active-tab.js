export default async function getActiveTab() {
	let queryOption = { active: true, currentWindow: true };
	let data = await browser.tabs.query(queryOption);
	return data;
};