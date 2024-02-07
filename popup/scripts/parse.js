"use strict";

import { logger } from "../../helpers/logger.js";
import * as tabs from "../../helpers/tabs.js";
import * as storage from "../../helpers/storage.js";

// The current file name needed for logger
const FILE_NAME = "parse.js";

const refreshState = () => {
  document.querySelector(".parsed-words__list").textContent = "";

  void 0;
};

export async function onParse(tab, partsURL) {
  try {
    refreshState();

    const minRepeats = document.getElementById("min-repeats__input").value.trim();
    const searchWord = document.getElementById("search-word__input").value.trim();

    const data = await storage.read(partsURL.secondDomain);
    const response = await tabs.sendMessage(tab.id, { minRepeats, searchWord });
    const wordFrequency = JSON.parse(response);

    // Exclude words that were selected from wordFrequency
    const excludeSelectedWords = (wordFrequency) =>
      wordFrequency.filter(([word]) => !data.selectedWords.includes(word));

    const prepareWordFrequncy = (wordFrequency) => {
      const result = !data ? wordFrequency : excludeSelectedWords(wordFrequency);

      // Sorting result in descending order
      return result.sort((a, b) => b[1] - a[1]);
    };

    async function addSelectedWordToStorage(word) {
      try {
        if (!data) return;

        const options = storage.createOptions(data.wordFrequency, data, partsURL);
        options.selectedWords.push(word);

        await storage.save(options, partsURL.secondDomain);
      } catch (ex) {
        logger(addSelectedWordToStorage.name, FILE_NAME, arguments);
        console.error(ex);
      }
    }

    async function onSelectWord(ev) {
      try {
        const li = ev.target.parentNode;
        const [word] = li.innerText.split(" ");

        await addSelectedWordToStorage(word);

        li.remove();
      } catch (ex) {
        logger(onSelectWord.name, FILE_NAME, arguments);
        console.error(ex);
      }
    }

    function insertContentToDOM([word, frequency], index) {
      let url = `https://context.reverso.net/translation/english-russian/${word}`;
      let wordFrequency = `${word} -> ${frequency} times`;
      let checkBoxID = `parsed-word__${index}`;

      const a = document.createElement("a");
      const li = document.createElement("li");
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      const parsedWords = document.querySelector(".parsed-words__list");

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

      checkbox.addEventListener("change", onSelectWord);
    }

    const preparedWordFrequncy = prepareWordFrequncy(wordFrequency);

    preparedWordFrequncy.forEach(insertContentToDOM);

    void 0;
  } catch (ex) {
    logger(onParse.name, FILE_NAME, arguments);
    console.error(ex);
  }
}
