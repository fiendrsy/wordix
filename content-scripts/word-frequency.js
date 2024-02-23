function load() {
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

  const isLatinLetter = (text) => {
		if (text.length > 1) {
			return [...text].every((char) => isLatinLetter(char));
    }

    let charCode = text.charCodeAt();

    return (
      (charCode >= UPPERCASE_A_CODE && charCode <= UPPERCASE_Z_CODE) ||
      (charCode >= LOWERCASE_A_CODE && charCode <= LOWERCASE_Z_CODE)
    );
  };

  const isValidValue = (value) => isLatinLetter(value) && !SERVICE_WORDS.has(value);

  const validateValue = (value) => value?.length > 1 && isValidValue(value);

  const normalizeValue = (value) => value.toLowerCase().trim().replace(/[.,:;?'"]/g, "");

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

    return Object.entries(wordFrequency).sort((a, b) => b[1] - a[1]);
  };

  const wordFrequencyHandler = (req, sender, res) => {
    const wordFrequency = calculateWordFrequency();
    const data = JSON.stringify(wordFrequency);

    console.clear();
    console.log(wordFrequency);

    res(data);
  };

  browser.runtime.onMessage.addListener(wordFrequencyHandler);

  void 0;
};

const init = () => {
  const DELAY = 2500;

  // Timeout required to run the script after all other scripts on the page
  setTimeout(load, DELAY);

  void 0;
}

init();

