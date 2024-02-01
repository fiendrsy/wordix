"use strict";

import { Domains } from "../constants/constants.js";
import * as date from "../helpers/date.js";
import * as url from "../helpers/url.js";
import * as tabs from "../helpers/tabs.js";
import * as storage from "../helpers/storage.js";

const BAD_DOMAINS = [Domains.TWITCH, Domains.YOUTUBE, Domains.MONKEYTYPE, Domains.GITHUB];

const _findMathedWords = (wordFrequency, cachedWords, isPathExist) =>
  !isPathExist
    ? wordFrequency
        .filter(([w]) => cachedWords.includes(w))
        .reduce((acc, [w, f]) => {
          acc[w] = f;
          return acc;
        }, {})
    : {};

const _findMissingWords = (wordFrequency, cachedWords) =>
  wordFrequency.filter(([w]) => !cachedWords.includes(w));

function _mergeMissing(missingWords, matchedWords, cachedWordFrequency) {
  const result = [];

  for (let [word, frequency] of cachedWordFrequency) {
    if (word in matchedWords) frequency += matchedWords[word];
    result.push([word, frequency]);
  }

  result.push(...missingWords);

  return result;
}

async function tabsUpdateHandler(idUpdatedTab, changeInfo) {
  const activeTab = await tabs.getActive();
  const composedParts = url.composeParts(activeTab.url);

  if (
    changeInfo.status !== "complete" ||
    activeTab.id !== idUpdatedTab ||
    BAD_DOMAINS.includes(composedParts.secondDomain)
  ) {
    return;
  }

  await observer(activeTab.id, composedParts);
}

async function observer(tabId, composedParts) {
  const response = await tabs.sendMessage(tabId, {});
  const wordFrequency = JSON.parse(response);
  const data = await storage.read(composedParts.secondDomain);

  if (!data) {
    addNewContent(wordFrequency, composedParts);
    return;
  }

  processing(composedParts, data, wordFrequency);
}

async function addNewContent(wordFrequency, { secondDomain, path, thirdDomain }) {
  const options = {
    createdAt: date.getCurrent(),
    selectedWords: [],
    wordFrequency,
    paths: [path],
    thirdDomains: [thirdDomain],
  };

  await storage.save(options, secondDomain);
}

async function updateContent(wordFrequency, data, { secondDomain, path, thirdDomain }) {
  const options = {
    createdAt: data.createdAt,
    selectedWords: [...data.selectedWords],
    wordFrequency,
    paths: [...new Set([...data.paths, path])],
    thirdDomains: [...new Set([...data.thirdDomains, thirdDomain])],
  };

  await storage.save(options, secondDomain);
}

async function processing(composedParts, data, wordFrequency) {
  let cachedWords, isPathExist, missingWords, matchedWords;

  isPathExist = data.paths.includes(composedParts.path);
  cachedWords = data.wordFrequency.map(([w]) => w);
  missingWords = _findMissingWords(wordFrequency, cachedWords);
  matchedWords = _findMathedWords(wordFrequency, cachedWords, isPathExist);

  if (missingWords.length === 0 && Object.values(matchedWords).length === 0) return;

  updateContent(_mergeMissing(missingWords, matchedWords, data.wordFrequency), data, composedParts);
}

browser.tabs.onUpdated.addListener(tabsUpdateHandler);
