"use strict";

import readAllFromStorage from "../../storage/read-all-from-storage.js";

let olElement = document.getElementById("session-list");

async function uploadHandler() {
	olElement.textContent = "";
	let wordFrequency = await getAllWordFrequencyFromStorage();
	wordFrequency.forEach(insertContent);
}

async function getAllWordFrequencyFromStorage() {
	const storageData = await readAllFromStorage();
	const wordFrequency = [];
	for (let domain in storageData) {
		wordFrequency.push(...storageData[domain].wordFrequency);
	}
	const concateWordFrequency = concatWordFrequency(wordFrequency);
	concateWordFrequency.sort((a, b) => b[1] - a[1]);
	return concateWordFrequency;
}

function concatWordFrequency(wordFrequency) {
	const result = [];
	const words = {};
	for (let [word, frequency] of wordFrequency) {
		words[word] = (words[word] || 0) + frequency;
	}
	for (let word in words) {
		result.push([word, words[word]]);
	}
	return result;
}

function insertContent([word, frequency]) {
	let liElement = document.createElement("li");
	liElement.textContent = `${word} -> ${frequency} times`;
	olElement.append(liElement);
}

async function isSearchWord() {}

document.querySelector(".upload-button").addEventListener("click", uploadHandler);
