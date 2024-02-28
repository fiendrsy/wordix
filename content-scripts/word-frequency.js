(function () {
  const DELAY = 2500;

  // Timeout required to run the script after all other scripts on the page
  setTimeout(() => {
    "use strict";

    const UPPERCASE_A_CODE = 65;
    const UPPERCASE_Z_CODE = 90;
    const LOWERCASE_A_CODE = 97;
    const LOWERCASE_Z_CODE = 122;

    const MIN_SIZE_PROPOSAL = 6;

    const SERVICE_WORDS = new Set([
      "an", "a", "the", "and", "but", "or", "for", "nor", "so", "yet",
      "to", "in", "on", "at", "by", "with", "as", "of", "from", "about",
      "has", "it’s", "its", "it", "not", "is", "he", "do", "you",
		  "can", "be", "if", "no", "are"
    ]);

    const text = document.body.innerText;

    const isLatinLetter = (value) => {
      if (value.length > 1)
        return [...value].every((char) => isLatinLetter(char));

      let charCode = value.charCodeAt();

      return (
        (charCode >= UPPERCASE_A_CODE && charCode <= UPPERCASE_Z_CODE) ||
        (charCode >= LOWERCASE_A_CODE && charCode <= LOWERCASE_Z_CODE)
      );
    };

    const isContractWord = (word) => {
      if (typeof word !== "string" || word.length === 0)
        return false;
      else
        return isLatinLetter(word[0]) && isLatinLetter(word.at(-1)) && /[']/g.test(word);
    };

    const isValidValue = (value) =>
      isLatinLetter(value) && !SERVICE_WORDS.has(value);

    const validateValue = (value) =>
      value?.length > 1 && isValidValue(value) || isContractWord(value);

    const normalizeValue = (value) =>
      value
        .toLowerCase()
        .trim()
        .replace(/[.,:;?"«]/g, "");

    const calculateWordFrequency = () => {
      const proposals = text.split("\n").map(normalizeValue);
      const wordFrequency = {};
      const words = [];

      proposals.forEach((proposal) => {
        const isValidProposal = proposal.split(" ").length > MIN_SIZE_PROPOSAL;

        if (!isValidProposal)
          return;

        words.push(
          ...proposal
          .split(" ")
          .filter(validateValue)
        );
      });

      words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;

        return acc;
      }, wordFrequency);

      return Object.entries(wordFrequency);
    };

    const message = {
      data: JSON.stringify(calculateWordFrequency()),
      from: "INJECT_SCRIPT",
    }

    browser.runtime.sendMessage("", message);

    void 0;
  }, DELAY);

  void 0;
})();

