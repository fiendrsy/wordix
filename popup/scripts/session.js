"use strict";

import * as dom from "./dom.js";
import * as storage from "../../helpers/storage.js";
import { writeErrors } from "../../helpers/error.js";
import { logger } from "../../helpers/logger.js";

const FILE_NAME = "session.js";

const mergeWordFrequency = async function () {
  try {
    const domain = dom.gVal("#session-by-site");

    const data = domain.length > 0
      ? await storage.read(domain)
      : await storage.readAll();

    if (!data) {
      logger(mergeWordFrequency.name, FILE_NAME, { data, domain });
      writeErrors(data, domain);

      return [];
    }

    const mergedWordFrequency = []
      .concat(data)
      .flatMap((domainData) => domainData.wordFrequency)
      .reduce((acc, [word, frequency]) => {
        acc[word] = (acc[word] || 0) + frequency;

        return acc;
      }, {});

    logger(mergeWordFrequency.name, FILE_NAME, { domain, data, mergedWordFrequency });

    return Object.entries(mergedWordFrequency);
  } catch (ex) {
    logger(mergeWordFrequency.name, FILE_NAME, { data, domain });
    writeErrors(data, domain);

    return [];
  }
};

const prepareWordFrequency = function (wordFrequency) {
  try {
    const minRepeats = +dom.gVal("#session-min-repeats") || 1; // HACK
    const limitWords = +dom.gVal("#session-limit-words") || wordFrequency.length; // HACK
    const searchWord = dom.gVal("#session-search-word");

    const preparedWordFrequency = wordFrequency
      .filter(([_, frequency]) => frequency >= minRepeats)
      .slice(0, limitWords);

    if (searchWord.length > 0)
      return preparedWordFrequency.filter(([word]) => word === searchWord);
    else
      return preparedWordFrequency;
  } catch (ex) {
    logger(prepareWordFrequency.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

export const onSession = async function () {
  try {
    dom.text("#session-list");

    const wordFrequency = await mergeWordFrequency();
    const preparedWordFrequency = prepareWordFrequency(wordFrequency);

    logger(onSession.name, FILE_NAME, { wordFrequency, preparedWordFrequency });

    preparedWordFrequency.forEach(([word, frequency]) => {
      let url = `https://context.reverso.net/translation/english-russian/${word}`;
      let wordFrequency = `${word} -> ${frequency} times`;

      const li = dom.cEl("li");
      const a = dom.cEl("a");
      const sessionList = dom.qSl("#session-list");

      dom.setAttr(a, "href", url);
      dom.addCl(a, "context-link");
      dom.text(a, wordFrequency);

      li.append(a);
      sessionList.append(li);

      void 0;
    });

    void 0;
  } catch (ex) {
    logger(onUpload.name, FILE_NAME, { limitWords, minRepeats, domain });
    writeErrors(ex);
  }
};
