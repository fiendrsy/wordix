"use strict";

import getActiveTab from "../../helpers/get-active-tab.js";
import tabsSendMessage from "../../helpers/tabs-send-message.js";
import { readFromStorage, saveToStorage } from "./storage.js";

let activeTab;
let minRepeats;
let searchWord;
let olElement = document.getElementById("parsed-words-list");

(async () => {
	let data = await getActiveTab();
	activeTab = data;
})();

function insertInDocumentContent([word, count], index) {
	let liElement = document.createElement("li");
	let labelElement = document.createElement("label");
	let checkboxElement = document.createElement("input");
	checkboxElement.setAttribute("type", "checkbox");
	checkboxElement.id = `parsed-word__${index}`;
	labelElement.textContent = `${word} -> ${count} times`;
	labelElement.htmlFor = `${checkboxElement.id}`;
	liElement.setAttribute("id", `${index}`);
	liElement.append(checkboxElement);
	liElement.append(labelElement);
	olElement.append(liElement);
	checkboxElement.addEventListener("change", selectedWordHandler);
}

async function parseHandler(e) {
	minRepeats = document.getElementById("minimum-repeats").value.trim();
	searchWord = document.getElementById("search-by-word").value.trim();
	olElement.textContent = "";
	let tabId = activeTab[0].id;
	let message = { minRepeats, searchWord };
	let response = await tabsSendMessage(tabId, message);
	let parsedWords = JSON.parse(response);
	parsedWords.sort((a, b) => b[1] - a[1]);
	parsedWords.forEach(insertInDocumentContent);
}

async function selectedWordHandler(e) {
	const date = new Date();
	let word = e.target.parentNode.innerText.split(" ")[0];
	let numRepetitions = parseInt(e.target.parentNode.innerText.split(" ")[2]);
	let liElementId = e.target.parentNode.id;
	let checkboxElement = e.target;
	let liElement = document.getElementById(liElementId);
	let description = {
		addedDate: date,
		context: [],
		numRepetitions,
	};
	let data = await readFromStorage(word);
	if (!data) {
		await saveToStorage({ [word]: description });
		liElement.remove();
	} else {
		checkboxElement.removeAttribute("type");
		liElement.textContent += " (ALREDY STORED)";
		liElement.classList.add("alredy-stored");
	}
}

document
	.getElementById("parse-button")
	.addEventListener("click", parseHandler);
document
	.getElementById("search-by-word")
	.addEventListener("input", parseHandler);
document
	.getElementById("minimum-repeats")
	.addEventListener("input", parseHandler);
