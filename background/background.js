"use strict";

import getActiveTab from "../helpers/get-active-tab.js";
import getCurrentDate from "../helpers/get-current-date.js";
import parseUrlDomain from "../helpers/parse-url-domain.js";
import parseUrlPath from "../helpers/parse-url-path.js";
import tabsSendMessage from "../helpers/tabs-send-message.js";
import readFromStorage from "../storage/read-from-storage.js";
import saveToStorage from "../storage/save-to-storage.js";

const BAD_DOMAINS = ["twitch", "youtube", "monkeytype", "github"];

async function tabsUpdateHandler(idUpdatedTab, changeInfo) {
  const activeTab = await getActiveTab();
  const urlData = collectUrlData(activeTab.url);
  if (changeInfo.status !== "complete" || activeTab.id !== idUpdatedTab || BAD_DOMAINS.includes(urlData.secondDomain)) {
    return;
  }
  const storageData = await readFromStorage(urlData.secondDomain);
  await autoUpdate(storageData, activeTab.id, urlData);
}

async function autoUpdate(storageData, tabId, currUrlData) {
  if (!storageData) {
    addNewContent(tabId, currUrlData);
    return;
  }
  processing(currUrlData, tabId);
}

function updateWordFrequencyWithMissing(missingWords, matchedWords, oldWordFrequency) {
  const updatedWordFrequency = oldWordFrequency.map(([word, frequency]) => {
    if (word in matchedWords) {
      let sum = frequency + matchedWords[word];
      return [word, sum];
    }
    return [word, frequency];
  });
  updatedWordFrequency.push(...missingWords);
  return updatedWordFrequency;
}

function generateInitialData(secondDomain, wordFrequency) {
  const currDate = getCurrentDate();
  return {
    [secondDomain]: {
      createdAt: [currDate],
      selectedWords: [],
      wordFrequency,
      paths: [],
      thirdDomains: [],
    },
  };
}

function collectUrlData(tabUrl) {
  const thirdDomain = parseUrlDomain(tabUrl, "third");
  const path = parseUrlPath(tabUrl);
  const secondDomain = parseUrlDomain(tabUrl, "second");
  return {
    thirdDomain,
    secondDomain,
    path,
  };
}

async function addNewContent(tabId, { secondDomain, path, thirdDomain } = urlData) {
  const response = await tabsSendMessage(tabId, {});
  const wordFrequency = JSON.parse(response);
  const initialData = generateInitialData(secondDomain, wordFrequency);
  initialData[secondDomain].paths.push(path);
  initialData[secondDomain].thirdDomains.push(thirdDomain);
  await saveToStorage(initialData);
}

async function updateContent(updatedWordFrequency, thirdDomain, secondDomain, path) {
  const data = await readFromStorage(secondDomain);
  const options = {
    [secondDomain]: {
      createdAt: data.createdAt,
      selectedWords: [...data.selectedWords],
      wordFrequency: updatedWordFrequency,
      paths: [...data.paths, path],
      thirdDomains: [...data.thirdDomains],
    },
  };
  if (!data.thirdDomains.includes(thirdDomain)) {
    options[secondDomain].thirdDomains.push(thirdDomain);
  }
  await saveToStorage(options);
}

async function processing({ path, secondDomain, thirdDomain } = currUrlData, tabId) {
  const storageData = await readFromStorage(secondDomain);
  const response = await tabsSendMessage(tabId, {});
  const currWordFrequency = JSON.parse(response);
  const wordsFromStorage = storageData.wordFrequency.map(([word]) => word);
  const missingWords = [];
  const matchedWords = {};
  for (let [word, frequency] of currWordFrequency) {
    if (!wordsFromStorage.includes(word)) {
      missingWords.push([word, frequency]);
    } else if (!storageData.paths.includes(path)) {
      matchedWords[word] = frequency;
    }
  }
  if (missingWords.length === 0 && Object.values(matchedWords).length === 0) {
    return;
  }
  updateContent(
    updateWordFrequencyWithMissing(missingWords, matchedWords, storageData.wordFrequency),
    thirdDomain,
    secondDomain,
    path
  );
}

browser.tabs.onUpdated.addListener(tabsUpdateHandler);
