"use strict";

import { Domains } from "../constants/constants.js";
import * as tabs from "../helpers/tabs.js";
import * as url from "../helpers/url.js";
import * as storage from "../helpers/storage.js";

const BAD_DOMAINS = [Domains.TWITCH, Domains.YOUTUBE, Domains.MONKEYTYPE, Domains.GITHUB];

const findMathedWords = (wordFrequency, cachedWords, isPathExist) =>
  !isPathExist
    ? wordFrequency
        .filter(([w]) => cachedWords.includes(w))
        .reduce((acc, [w, f]) => ((acc[w] = f), acc), {})
    : {};

const findMissingWords = (wordFrequency, cachedWords) =>
  wordFrequency.filter(([w]) => !cachedWords.includes(w));

const mergeMissing = (missingWords, matchedWords, cachedWordFrequency) =>
  cachedWordFrequency
    .map(([word, frequency]) => [word, frequency + (matchedWords[word] || 0)])
    .concat(missingWords);

const processing = async (composedParts, data, wordFrequency) => {
  try {
    const isPathExist = data.paths.includes(composedParts.path);
    const cachedWords = data.wordFrequency.map(([w]) => w);
    const missingWords = findMissingWords(wordFrequency, cachedWords);
    const matchedWords = findMathedWords(wordFrequency, cachedWords, isPathExist);
    const missingWordsExist = !!missingWords.length;
    const matchedWordsExist = !!Object.keys(matchedWords).length;

    if (!missingWordsExist && !matchedWordsExist) return;

    const options = storage.createOptions(
      mergeMissing(missingWords, matchedWords, data.wordFrequency),
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
      const options = storage.createOptions(wordFrequency, null, composedParts);
      await storage.save(options, composedParts.secondDomain);
      return;
    }

    processing(composedParts, data, wordFrequency);
  } catch (ex) {
    console.error(ex);
  }
};

const onUpdateTab = async (tabID, { status }, tab) => {
  try {
    if (status !== "complete") return;

    const composedParts = url.composeParts(tab.url);
    const partsExist = !!Object.keys(composedParts).length;

    if (!partsExist || BAD_DOMAINS.includes(composedParts.secondDomain)) return;

    await observer(tabID, composedParts);
  } catch (ex) {
    console.error(ex);
  }
};

browser.tabs.onUpdated.addListener(onUpdateTab);
