"use strict";

const ARTICLES = ["an", "a", "the"];
const UPPERCASE_A_CODE = 65;
const UPPERCASE_Z_CODE = 90;
const LOWERCASE_A_CODE = 97;
const LOWERCASE_Z_CODE = 122;

function wordFrequencyHandler(request, sender, sendResponse) {
  let searchWord = request.searchWord;
  let minRepeats = request.minRepeats;
  let num = minRepeats ? +minRepeats : 1;
  const wordFrequency = getWordFrequency(num);
  const data = searchWord ? JSON.stringify(isSearchedWord(searchWord, wordFrequency)) : JSON.stringify(wordFrequency);
  sendResponse(data);
}

function getWordFrequency(num) {
  const collectionOfWords = {};
  const correctWords = validatePageContent(document.body.innerText);
  for (let word of correctWords) {
    collectionOfWords[word] = (collectionOfWords[word] || 0) + 1;
  }
  const wordFrequency = [];
  for (let word in collectionOfWords) {
    wordFrequency.push([word, collectionOfWords[word]]);
  }
  return wordFrequency.filter(([_, frequency]) => frequency >= num);
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
  return words.filter(([word]) => word === searchWord);
}

function validatePageContent(content) {
  return content
    .split("")
    .map(validateChars)
    .join("")
    .split(" ")
    .filter((word) => word.length > 1 && !ARTICLES.includes(word));
}

browser.runtime.onMessage.addListener(wordFrequencyHandler);
