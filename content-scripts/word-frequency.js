"use strict";

const UPPERCASE_A_CODE = 65;
const UPPERCASE_Z_CODE = 90;
const LOWERCASE_A_CODE = 97;
const LOWERCASE_Z_CODE = 122;

function wordFrequencyHandler(request, sender, sendResponse) {
	let searchWord = request.searchWord;
	let minRepeats = request.minRepeats;
	let num = minRepeats ? +minRepeats : 1;
	let wordFrequency = getWordFrequency(num);
	let data = searchWord
		? JSON.stringify(isSearchedWord(searchWord, wordFrequency))
		: JSON.stringify(wordFrequency);
	sendResponse(data);
}

function getWordFrequency(num) {
	let collectionOfWords = {};
	let content = document.body.innerText;
	let correctWords = validatePageContent(content);
	for (let word of correctWords) {
		collectionOfWords[word] = (collectionOfWords[word] || 0) + 1;
	}
	let wordFrequency = [];
	for (let word in collectionOfWords) {
		wordFrequency.push([word, collectionOfWords[word]]);
	}
	let words = wordFrequency.filter(([_, count]) => count >= num);
	return words;
}

function isLatinLetter(char) {
	let charCode = char.charCodeAt();
	return (
		(charCode >= UPPERCASE_A_CODE && charCode <= UPPERCASE_Z_CODE) ||
		(charCode >= LOWERCASE_A_CODE && charCode <= LOWERCASE_Z_CODE)
	);
}

function validateChars(char) {
	return isLatinLetter(char) ? char.toLowerCase() : " ";
}

function isSearchedWord(searchWord, words) {
	return words.filter(([word, _]) => word === searchWord);
}

function validatePageContent(content) {
	let articles = ["an", "a", "the"];
	return content
		.split("")
		.map(validateChars)
		.join("")
		.split(" ")
		.filter(word => word.length > 1 && !articles.includes(word));
}

browser.runtime.onMessage.addListener(wordFrequencyHandler);
