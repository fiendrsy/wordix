"use strict";

import * as date from "../helpers/date.js";
import * as url from "../helpers/url.js";
import * as tabs from "../helpers/tabs.js";
import * as storage from "../helpers/storage.js";

const BAD_DOMAINS = ["twitch", "youtube", "monkeytype", "github"];

async function tabsUpdateHandler(idUpdatedTab, changeInfo) {
  const activeTab = await tabs.getActive();
  const composeUrls = url.compose(activeTab.url);
  if (
    changeInfo.status !== "complete" ||
    activeTab.id !== idUpdatedTab ||
    BAD_DOMAINS.includes(composeUrls.secondDomain)
  ) {
    return;
  }
  const storageData = await storage.read(composeUrls.secondDomain);
  await observer(storageData, activeTab.id, composeUrls);
}

async function observer(storageData, tabId, composeUrls) {
  if (!storageData) {
    addNewContent(tabId, composeUrls);
    return;
  }
  processing(composeUrls, tabId);
}

function mergeWordFrequencyWithMissing(missingWords, matchedWords, oldWordFrequency) {
  const updatedWordFrequency = oldWordFrequency.map(([word, frequency]) => {
    if (word in matchedWords) frequency += matchedWords[word];
    return [word, frequency];
  });
  updatedWordFrequency.push(...missingWords);
  return updatedWordFrequency;
}

async function addNewContent(tabId, { secondDomain, path, thirdDomain } = urlData) {
  const response = await tabs.sendMessage(tabId, {});
  const wordFrequency = JSON.parse(response);
  const options = {
    [secondDomain]: {
      createdAt: date.getCurrent(),
      selectedWords: [],
      wordFrequency,
      paths: [path],
      thirdDomains: [thirdDomain],
    },
  };
  await storage.save(options);
}

async function updateContent(updatedWordFrequency, thirdDomain, secondDomain, path) {
  const data = await storage.read(secondDomain);
  const options = {
    [secondDomain]: {
      createdAt: data.createdAt,
      selectedWords: [...data.selectedWords],
      wordFrequency: updatedWordFrequency,
      paths: [...data.paths, path],
      thirdDomains: [...new Set([...data.thirdDomains, thirdDomain])],
    },
  };
  await storage.save(options);
}

async function processing({ path, secondDomain, thirdDomain } = currUrlData, tabId) {
  const missingWords = [];
  const matchedWords = {};
  const storageData = await storage.read(secondDomain);
  const response = await tabs.sendMessage(tabId, {});
  const currWordFrequency = JSON.parse(response);
  const wordsFromStorage = storageData.wordFrequency.map(([word]) => word);
  for (let [word, frequency] of currWordFrequency) {
    if (!wordsFromStorage.includes(word)) missingWords.push([word, frequency]);
    if (!storageData.paths.includes(path) && wordsFromStorage.includes(word))
      matchedWords[word] = frequency;
  }
  if (missingWords.length === 0 && Object.values(matchedWords).length === 0) return;
  updateContent(
    mergeWordFrequencyWithMissing(missingWords, matchedWords, storageData.wordFrequency),
    thirdDomain,
    secondDomain,
    path
  );
}

browser.tabs.onUpdated.addListener(tabsUpdateHandler);
