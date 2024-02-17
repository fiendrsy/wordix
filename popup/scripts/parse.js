"use strict";

import * as dom from "./dom.js";
import { logger } from "../../helpers/logger.js";
import { writeErrors } from "../../helpers/error.js";
import * as tabs from "../../helpers/tabs.js";
import * as storage from "../../helpers/storage.js";

// The current file name needed for logger
const FILE_NAME = "parse.js";

// Exclude words that were selected from wordFrequency
const excludeSelectedWords = (wordFrequency, selectedWords) =>
  wordFrequency.filter(([word]) => !selectedWords.includes(word));

const prepareWordFrequency = (wordFrequency, data) => {
  try {
    const result = !data
      ? wordFrequency
      : excludeSelectedWords(wordFrequency, data.selectedWords);

    const minRepeats = +dom.gVal("#min-repeats__input") || 1;
    const searchWord = dom.gVal("#search-word__input");

    // Sorting result in descending order
    const preparedWordFrequency = result
      .filter(([_, frequency]) => frequency >= minRepeats)
      .sort((a, b) => b[1] - a[1]);

    if (searchWord !== "")
      return preparedWordFrequency.filter(([word]) => word === searchWord);
    else
      return preparedWordFrequency;
  } catch (ex) {
    logger(prepareWordFrequency.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

const addSelectedWordToStorage = async function (word, data, partsURL) {
  try {
    if (!data) return;

    const options = storage.createOptions(data.wordFrequency, data, partsURL);
    options.selectedWords.push(word);

    await storage.save(options, partsURL.secondDomain);

    void 0;
  } catch (ex) {
    logger(addSelectedWordToStorage.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

// Event handler that triggers when a word is selected
const onSelectWord = async function (ev, data, partsURL) {
  try {
    // ev.target is equals input(type: checkbox) element
    const li = ev.target.parentNode;
    const [word] = li.innerText.split(" ");

    await addSelectedWordToStorage(word, data, partsURL);

    li.remove();

    void 0;
  } catch (ex) {
    logger(onSelectWord.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};

export const onParse = async function (ev, tab, partsURL) {
  try {
    dom.text(".parsed-words__list");

    const data = await storage.read(partsURL.secondDomain);
    const response = await tabs.sendMessage(tab.id);
    const wordFrequency = JSON.parse(response);

    logger(onParse.name, FILE_NAME, {
      arguments,
      data,
      response,
      wordFrequency,
    });

    const preparedWordFrequency = prepareWordFrequency(wordFrequency, data);

    preparedWordFrequency.forEach(([word, frequency], index) => {
      try {
        let url = `https://context.reverso.net/translation/english-russian/${word}`;
        let wordFrequency = `${word} -> ${frequency} times`;
        let checkBoxID = `parsed-word__${index}`;

        const a = dom.cEl("a");
        const li = dom.cEl("li");
        const label = dom.cEl("label");
        const checkbox = dom.cEl("input");
        const parsedWords = dom.qSl(".parsed-words__list");

        a.setAttribute("href", url);
        a.classList.add("context-link");

        checkbox.setAttribute("type", "checkbox");
        checkbox.id = checkBoxID;

        label.htmlFor = checkBoxID;
        a.textContent = wordFrequency;

        label.append(a);
        li.setAttribute("id", `${index}`);
        li.append(checkbox);
        li.append(label);
        parsedWords.append(li);

        dom.addLis(checkbox, "change", onSelectWord, data, partsURL);

        void 0;
      } catch (ex) {
        logger(insertContentToDOM.name, FILE_NAME, arguments);
        writeErrors(ex);
      }
    });

    void 0;
  } catch (ex) {
    logger(onParse.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};
