"use strict";

import { BlackListDomains } from "../constants/constants.js";
import { logger } from "../helpers/logger.js";
import * as tabs from "../helpers/tabs.js";
import * as url from "../helpers/url.js";
import * as storage from "../helpers/storage.js";
import { writeErrors } from "../helpers/error.js";

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

const fetchWordFrequency = function (cachedWordFrequency, wordFrequency) {
  try {
    const cachedWords = cachedWordFrequency.map(([word]) => word);
    const mergedWordFrequency = mergeMissing(
      findMissingWords(wordFrequency, cachedWords),
      findMathedWords(wordFrequency, cachedWords),
      cachedWordFrequency,
    );

    logger(fetchWordFrequency.name, FILE_NAME, {
      arguments,
      cachedWords,
      mergedWordFrequency,
    });

    return mergedWordFrequency;
  } catch (ex) {
    logger(fetchWordFrequency.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

const addNewContent = async function (wordFrequency, partsURL) {
  try {
    const options = storage.createOptions(wordFrequency, null, partsURL);

    logger(addNewContent.name, FILE_NAME, { arguments, options });

    await storage.save(options, partsURL.secondDomain);
  } catch (ex) {
    logger(addNewContent.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

const updateContent = async function (partsURL, data, wordFrequency) {
  try {
    const cachedWordFrequency = data.wordFrequency;
    const options = storage.createOptions(
      fetchWordFrequency(cachedWordFrequency, wordFrequency),
      data,
      partsURL,
    );

    logger(updateContent.name, FILE_NAME, { arguments, cachedWordFrequency, options });

    await storage.save(options, partsURL.secondDomain);
  } catch (ex) {
    logger(updateContent.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

const observer = async function (wordFrequency, partsURL) {
  try {
    const data = await storage.read(partsURL.secondDomain);

    logger(observer.name, FILE_NAME, { arguments, wordFrequency, data });

    if (!data) {
      await addNewContent(wordFrequency, partsURL);
      return;
    }

    const isVisitedPath = data.paths.includes(partsURL.path);

    if (!isVisitedPath)
      await updateContent(partsURL, data, wordFrequency);
    else
      return;
  } catch (ex) {
    logger(observer.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

const onMessage = async function (req, sender) {
  try {
    const { from, data } = req;

    if (!from || !data || from !== "INJECT_SCRIPT") {
      logger(onMessage.name, FILE_NAME, arguments, from, data);
      writeErrors(from, data);

      return;
    }

    const activeTab = await tabs.getActive();

    if (sender.tab.id !== activeTab.id) {
      logger(onMessage.name, FILE_NAME, arguments, sender.tab.id, activeTab.id);
      writeErrors(sender.tab.id, activeTab.id);

      return;
    }

    const partsURL = url.composeParts(sender.url);

    logger(onMessage.name, FILE_NAME, { arguments, partsURL });

    if (!partsURL || blackList.includes(partsURL.secondDomain))
      return;

    const wordFrequency = JSON.parse(data);

    await observer(wordFrequency, partsURL);
  } catch (ex) {
    logger(onMessage.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

browser.runtime.onMessage.addListener(onMessage);
