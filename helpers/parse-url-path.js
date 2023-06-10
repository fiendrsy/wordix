export default function parseUrlPath(url) {
	const parts = url.split("/");
	const result = parts.slice(3).join("/");
	return result;
}
