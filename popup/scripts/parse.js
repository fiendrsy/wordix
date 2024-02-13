"use strict";

import { logger } from "../../helpers/logger.js";
import * as dom from "./dom.js";
import * as tabs from "../../helpers/tabs.js";
import * as storage from "../../helpers/storage.js";

// The current file name needed for logger
const FILE_NAME = "parse.js";

// The function is fired by clicked on parse button
export const onParse = async function (ev, tab, partsURL) {
  try {
    dom.reWrite(".parsed-words__list");

    const minRepeats = dom.gVal("#min-repeats__input");
    const searchWord = dom.gVal("#search-word__input");

    const data = await storage.read(partsURL.secondDomain);
    const response = await tabs.sendMessage(tab.id, { minRepeats, searchWord });
    const wordFrequency = JSON.parse(response);

    logger(onParse.name, FILE_NAME, {
      arguments,
      data,
      response,
      wordFrequency,
      minRepeats,
      searchWord,
    });

    // Exclude words that were selected from wordFrequency
    const excludeSelectedWords = (wordFrequency) =>
      wordFrequency.filter(([word]) => !data.selectedWords.includes(word));

    const prepareWordFrequency = (wordFrequency) => {
      const result = !data ? wordFrequency : excludeSelectedWords(wordFrequency);

      // Sorting result in descending order
      return result.sort((a, b) => b[1] - a[1]);
    };

    const addSelectedWordToStorage = async function (word) {
      try {
        if (!data) return;

        const options = storage.createOptions(data.wordFrequency, data, partsURL);
        options.selectedWords.push(word);

        logger(addSelectedWordToStorage.name, FILE_NAME, { arguments, data, options });

        await storage.save(options, partsURL.secondDomain);

        void 0;
      } catch (ex) {
        logger(addSelectedWordToStorage.name, FILE_NAME, arguments);
        console.error(ex);
      }
    };

    // Event handler that triggers when a word is selected
    const onSelectWord = async function (ev) {
      try {
        // ev.target is equals input(type: checkbox) element
        const li = ev.target.parentNode;
        const [word] = li.innerText.split(" ");

        logger(onSelectWord.name, FILE_NAME, { arguments, li, word });

        await addSelectedWordToStorage(word);

        li.remove();

        void 0;
      } catch (ex) {
        logger(onSelectWord.name, FILE_NAME, arguments);
        console.error(ex);
      }
    };

    const insertContentToDOM = function ([word, frequency], index) {
      try {
        let url = `https://context.reverso.net/translation/english-russian/${word}`;
        let wordFrequency = `${word} -> ${frequency} times`;
        let checkBoxID = `parsed-word__${index}`;

        const a = dom.cEl("a");
        const li = dom.cEl("li");
        const label = dom.cEl("label");
        const checkbox = dom.cEl("input");
        const parsedWords = dom.qSl(".parsed-words__list");

        logger(insertContentToDOM.name, FILE_NAME, {
          arguments,
          url,
          wordFrequency,
          checkbox,
          a,
          li,
          label,
          checkbox,
          parsedWords,
        });

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

        dom.addLis(checkbox, "change", onSelectWord)

        void 0;
      } catch (ex) {
        logger(insertContentToDOM.name, FILE_NAME, arguments);
        console.error(ex);
      }
    };

    const preparedWordFrequency = prepareWordFrequency(wordFrequency);

    preparedWordFrequency.forEach(insertContentToDOM);

    void 0;
  } catch (ex) {
    logger(onParse.name, FILE_NAME, arguments);
    console.error(ex);
  }
};
