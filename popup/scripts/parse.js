"use strict";

import getActiveTab from "../../helpers/get-active-tab.js";
import parseUrlDomain from "../../helpers/parse-url-domain.js";
import tabsSendMessage from "../../helpers/tabs-send-message.js";
import readFromStorage from "../../storage/read-from-storage.js";
import saveToStorage from "../../storage/save-to-storage.js";

let activeTab;
let minRepeats;
let searchWord;
const olElement = document.querySelector(".parsed-words__list");
const currSite = document.querySelector(".current-site-address");

(async function init() {
  const data = await getActiveTab();
  activeTab = data;
  currSite.textContent = parseUrlDomain(activeTab.url);
})();

function insertInDocumentContent([word, count], index) {
  const aElement = document.createElement("a");
  const liElement = document.createElement("li");
  const labelElement = document.createElement("label");
  const checkboxElement = document.createElement("input");
  aElement.setAttribute("href", `https://context.reverso.net/translation/english-russian/${word}`);
  aElement.classList.add("context-link");
  checkboxElement.setAttribute("type", "checkbox");
  checkboxElement.id = `parsed-word__${index}`;
  labelElement.htmlFor = `${checkboxElement.id}`;
  aElement.textContent = `${word} -> ${count} times`;
  labelElement.append(aElement);
  liElement.setAttribute("id", `${index}`);
  liElement.append(checkboxElement);
  liElement.append(labelElement);
  olElement.append(liElement);
  checkboxElement.addEventListener("change", selectedWordHandler);
}

async function parseHandler(e) {
  minRepeats = document.getElementById("min-repeats__input").value.trim();
  searchWord = document.getElementById("search-word__input").value.trim();
  olElement.textContent = "";
  const message = { minRepeats, searchWord };
  const response = await tabsSendMessage(activeTab.id, message);
  const wordFrequency = await excludeSelectedWords(JSON.parse(response));
  wordFrequency.sort((a, b) => b[1] - a[1]);
  wordFrequency.forEach(insertInDocumentContent);
}

async function excludeSelectedWords(words) {
  const secondDomain = parseUrlDomain(activeTab.url, "second");
  const { selectedWords } = await readFromStorage(secondDomain);
  return words.filter(([word]) => !selectedWords.includes(word));
}

async function selectedWordHandler(e) {
  const liElement = e.target.parentNode;
  const [word] = liElement.innerText.split(" ");
  const secondDomain = parseUrlDomain(activeTab.url, "second");
  const storageData = await readFromStorage(secondDomain);
  if (!storageData.selectedWords.includes(word)) {
    await addSelectedWordToStorage(word, storageData, secondDomain);
    liElement.remove();
  }
}

async function addSelectedWordToStorage(word, data, secondDomain) {
  const options = {
    [secondDomain]: {
      createdAt: data.createdAt,
      selectedWords: [...data.selectedWords, word],
      wordFrequency: [...data.wordFrequency],
      paths: [...data.paths],
      thirdDomains: [...data.thirdDomains],
    },
  };
  await saveToStorage(options);
}

document.querySelector(".parse-button").addEventListener("click", parseHandler);
document.getElementById("search-word__input").addEventListener("input", parseHandler);
document.getElementById("min-repeats__input").addEventListener("input", parseHandler);
