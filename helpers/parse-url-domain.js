export default function parseUrlDomain(url) {
	const pattern =
		/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gim;
	let urlWitoutPath = url.match(pattern);
	return urlWitoutPath[0].replace("https://", "");
}
