function handler(request, sender, sendResponse) {
	let data = JSON.stringify(parseWords(request.minRepeats, request.searchWord));
	sendResponse(data);
}

function parseWords(minRepeats, searchWord) {
	let collectionOfWords = {};
	let articles = ["an", "a", "the"];
	let correctWords = document.body.innerText
		.split("")
		.map(validateChars)
		.join("")
		.split(" ")
		.filter(word => word.length > 1 && !articles.includes(word));
	for (let word of correctWords) {
		collectionOfWords[word] = (collectionOfWords[word] || 0) + 1;
	}
	let n = minRepeats ? +minRepeats : 1;
	let counter = [];
	for (let word in collectionOfWords) {
		counter.push([word, collectionOfWords[word]]);
	}
	if (!searchWord) {
		let words = counter.filter(arr => arr[1] >= n);
		return words;
	}
	let word = counter.filter(arr => arr[0] === searchWord.toLowerCase());
	return word;
}

function validateChars(char) {
	let charCode = char.charCodeAt();
	if (charCode <= 64) {
		return " ";
	} else if (charCode >= 91 && charCode <= 96) {
		return " ";
	} else if (charCode >= 123) {
		return " ";
	}
	return char.toLowerCase();
}

browser.runtime.onMessage.addListener(handler);
