"use strict";

import getActiveTab from "../../helpers/get-active-tab.js";
import tabsSendMessage from "../../helpers/tabs-send-message.js";

let activeTab;
let minRepeats;
let searchWord;
let olElement = document.querySelector("#parsed-words-list");

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
	liElement.append(checkboxElement);
	liElement.append(labelElement);
	olElement.append(liElement);
}

async function parseHandler(e) {
	minRepeats = document.querySelector("#minimum-repeats").value.trim();
	searchWord = document.querySelector("#search-by-word").value.trim();
	olElement.textContent = "";
	let tabId = activeTab[0].id;
	let message = { minRepeats, searchWord };
	let response = await tabsSendMessage(tabId, message);
	let parsedWords = JSON.parse(response);
	parsedWords.sort((a, b) => b[1] - a[1]);
	parsedWords.forEach(insertInDocumentContent);
}

document
	.querySelector("#parse-button")
	.addEventListener("click", parseHandler);
document
	.querySelector("#search-by-word")
	.addEventListener("input", parseHandler);
document
	.querySelector("#minimum-repeats")
	.addEventListener("input", parseHandler);
