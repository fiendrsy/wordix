"use strict";

import * as dom from "./dom.js";
import * as storage from "../../helpers/storage.js";
import { writeErrors } from "../../helpers/error.js";
import { logger } from "../../helpers/logger.js";

const FILE_NAME = "session.js";

export const onUpload = async function () {
  try {
    dom.reWrite("#session-list");

    const minRepeats = dom.gVal("#session-min-repeats");
    const limitWords = dom.gVal("#session-limit-words");
    const searchWord = dom.gVal("#session-search-word");
    const domain = dom.gVal("#session-by-site");

    const mergeWordFrequency = async function () {
      try {
        const data = !!domain
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

        return Object.entries(mergedWordFrequency);
      } catch (ex) {
        logger(mergeWordFrequency.name, FILE_NAME, { data, domain });
        writeErrors(data, domain);

        return [];
      }
    };

    const prepareWordFrequency = function (wordFrequency) {
      const min = parseInt(minRepeats) || 1;
      const limit = parseInt(limitWords) || wordFrequency.length;
      const preparedWordFrequency = wordFrequency
        .filter(([_, frequency]) => frequency >= min)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

      return !!searchWord
        ? preparedWordFrequency.filter(([word]) => word === searchWord)
        : preparedWordFrequency;
    };

    const insertContentToDOM = function ([word, frequency]) {
      let url = `https://context.reverso.net/translation/english-russian/${word}`;
      let wordFrequency = `${word} -> ${frequency} times`;

      const li = dom.cEl("li");
      const a = dom.cEl("a");
      const sessionList = dom.qSl("#session-list");

      a.setAttribute("href", url);
      a.classList.add("context-link");
      a.textContent = wordFrequency;

      li.append(a);
      sessionList.append(li);

      void 0;
    };

    const wordFrequency = await mergeWordFrequency();
    const preparedWordFrequency = prepareWordFrequency(wordFrequency);

    preparedWordFrequency.forEach(insertContentToDOM);

    void 0;
  } catch (ex) {
    logger(onUpload.name, FILE_NAME, { limitWords, minRepeats, domain });
    writeErrors(limitWords, minRepeats, domain);
  }
};
