"use strict";

import { BlackListDomains } from "../constants/constants.js";
import * as tabs from "../helpers/tabs.js";
import * as url from "../helpers/url.js";
import * as storage from "../helpers/storage.js";

const blackList = Object.values(BlackListDomains);

const findMathedWords = (wordFrequency, cachedWords) =>
  wordFrequency
    .filter(([word]) => cachedWords.includes(word))
    .reduce((acc, [word, frequency]) => ((acc[word] = frequency), acc), {});

const findMissingWords = (wordFrequency, cachedWords) =>
  wordFrequency.filter(([word]) => !cachedWords.includes(word));

const mergeMissing = (missingWords, matchedWords, cachedWordFrequency) =>
  cachedWordFrequency
    .map(([word, frequency]) => [word, frequency + (matchedWords[word] || 0)])
    .concat(missingWords);

const fetchWordFrequency = (cachedWordFrequency, wordFrequency) => {
  try {
    const cachedWords = cachedWordFrequency.map(([word]) => word);

    return mergeMissing(
      findMissingWords(wordFrequency, cachedWords),
      findMathedWords(wordFrequency, cachedWords),
      cachedWordFrequency,
    );
  } catch (ex) {
    console.error(ex);
  }
};

const addNewContent = async (wordFrequency, composedParts) => {
  try {
    const options = storage.createOptions(wordFrequency, null, composedParts);

    await storage.save(options, composedParts.secondDomain);
  } catch (ex) {
    console.error(ex);
  }
};

const updateContent = async (composedParts, data, wordFrequency) => {
  try {
    const cachedWordFrequency = data.wordFrequency;
    const options = storage.createOptions(
      fetchWordFrequency(cachedWordFrequency, wordFrequency),
      data,
      composedParts,
    );

    await storage.save(options, composedParts.secondDomain);
  } catch (ex) {
    console.error(ex);
  }
};

const observer = async (tabID, composedParts) => {
  try {
    const response = await tabs.sendMessage(tabID, {});
    const wordFrequency = JSON.parse(response);
    const data = await storage.read(composedParts.secondDomain);

    if (!data) {
      await addNewContent(wordFrequency, composedParts);
      return;
    }

    const isVisitedPath = data.paths.includes(composedParts.path);

    if (!isVisitedPath) await updateContent(composedParts, data, wordFrequency);
  } catch (ex) {
    console.error(ex);
  }
};

const onUpdateTab = async (tabID, { status }, tab) => {
  try {
    if (status !== "complete") return;

    const composedParts = url.composeParts(tab.url);
    const partsExist = !!Object.keys(composedParts).length;

    if (!partsExist || blackList.includes(composedParts.secondDomain)) return;

    await observer(tabID, composedParts);
  } catch (ex) {
    console.error(ex);
  }
};

browser.tabs.onUpdated.addListener(onUpdateTab);
