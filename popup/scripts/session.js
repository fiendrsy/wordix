"use strict";

import readAllFromStorage from "../../storage/read-all-from-storage.js";
import readFromStorage from "../../storage/read-from-storage.js";

let searchWord;
let minRepeats;
let limitWords;
let byDomain;
let olElement = document.getElementById("session-list");

async function uploadHandler() {
  olElement.textContent = "";
  const wordFrequency = await getAllWordFrequencyFromStorage();
  const dataInputs = collectDataInputs();
  processing(dataInputs, wordFrequency);
}

async function getAllWordFrequencyFromStorage() {
  byDomain = document.getElementById("session-by-site").value.trim();
  if (byDomain.length > 1) {
    const { wordFrequency } = await readFromStorage(byDomain);
    return wordFrequency;
  }
  const storageData = await readAllFromStorage();
  const wordFrequency = [];
  for (let domain in storageData) {
    wordFrequency.push(...storageData[domain].wordFrequency);
  }
  const concateWordFrequency = concatWordFrequency(wordFrequency);
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
  const liElement = document.createElement("li");
  liElement.textContent = `${word} -> ${frequency} times`;
  olElement.append(liElement);
}

async function isSearchWord() {
  olElement.textContent = "";
  const wordFrequency = await getAllWordFrequencyFromStorage();
  const dataInputs = collectDataInputs();
  const result = wordFrequency.filter(([word]) => word === dataInputs.searchWord);
  processing(dataInputs, result);
}

function collectDataInputs() {
  minRepeats = document.getElementById("session-min-repeats").value.trim();
  limitWords = document.getElementById("session-limit-words").value.trim();
  searchWord = document.getElementById("session-search-word").value.trim();
  return {
    minRepeats,
    limitWords,
    searchWord,
  };
}

function processing({ minRepeats, limitWords } = dataInputs, wordFrequency) {
  const min = minRepeats ? +minRepeats : 1;
  const limit = limitWords ? +limitWords : wordFrequency.length;
  const result = wordFrequency.filter(([_, frequency]) => frequency >= min);
  result.sort((a, b) => b[1] - a[1]);
  const len = result.length < limit ? result.length : limit;
  for (let i = 0; i < len; ++i) {
    insertContent(result[i]);
  }
}

document.querySelector(".upload-button").addEventListener("click", uploadHandler);
document.getElementById("session-search-word").addEventListener("input", isSearchWord);
