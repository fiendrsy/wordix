"use strict";

import { BlackListDomains } from "../constants/constants.js";
import { logger } from "../helpers/logger.js";
import * as tabs from "../helpers/tabs.js";
import * as url from "../helpers/url.js";
import * as storage from "../helpers/storage.js";

// The current file name needed for logger
const FILE_NAME = "background.js";
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

async function fetchWordFrequency(cachedWordFrequency, wordFrequency) {
  try {
    const cachedWords = cachedWordFrequency.map(([word]) => word);

    return mergeMissing(
      findMissingWords(wordFrequency, cachedWords),
      findMathedWords(wordFrequency, cachedWords),
      cachedWordFrequency,
    );
  } catch (ex) {
    logger(fetchWordFrequency.name, FILE_NAME, arguments);
    console.error(ex);
  }
}

async function addNewContent(wordFrequency, partsURL) {
  try {
    const options = storage.createOptions(wordFrequency, null, partsURL);

    await storage.save(options, partsURL.secondDomain);
  } catch (ex) {
    logger(addNewContent.name, FILE_NAME, arguments);
    console.error(ex);
  }
}

async function updateContent(partsURL, data, wordFrequency) {
  try {
    const cachedWordFrequency = data.wordFrequency;
    const options = storage.createOptions(
      fetchWordFrequency(cachedWordFrequency, wordFrequency),
      data,
      partsURL,
    );

    await storage.save(options, partsURL.secondDomain);
  } catch (ex) {
    logger(updateContent.name, FILE_NAME, arguments);
    console.error(ex);
  }
}

async function observer(tabID, partsURL) {
  try {
    const response = await tabs.sendMessage(tabID, {});
    const wordFrequency = JSON.parse(response);
    const data = await storage.read(partsURL.secondDomain);

    if (!data) {
      await addNewContent(wordFrequency, partsURL);
      return;
    }

    const isVisitedPath = data.paths.includes(partsURL.path);

    if (!isVisitedPath) await updateContent(partsURL, data, wordFrequency);
  } catch (ex) {
    logger(observer.name, FILE_NAME, arguments);
    console.error(ex);
  }
}

async function onUpdateTab(tabID, { status }, tab) {
  try {
    if (status !== "complete") return;

    const partsURL = url.composeParts(tab.url);
    const partsExist = !!Object.keys(partsURL).length;

    if (!partsExist || blackList.includes(partsURL.secondDomain)) return;

    await observer(tabID, partsURL);
  } catch (ex) {
    logger(onUpdateTab.name, FILE_NAME, arguments);
    console.error(ex);
  }
}

browser.tabs.onUpdated.addListener(onUpdateTab);
