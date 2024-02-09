"use strict";

import { ErrorMessages } from "../constants/constants.js";
import { logger } from "./logger.js";

// The current file name needed for logger
const FILE_NAME = "storage.js";

const excludeDuplicates = (items) => [...new Set(items)];

const validateValues = (values) => values.filter((value) => !!value);

const prepareValue = (value) => {
  if (value.constructor === Array)
    return validateValues(excludeDuplicates(value));
  else
    return value;
};

export async function readAll() {
  try {
    const data = await browser.storage.local.get();

    if (!data)
      return {};
    else
      return data;
  } catch (ex) {
    const isError = browser.runtime.lastError;

    logger(readAll.name, FILE_NAME, { arguments, isError });
    console.error(ErrorMessages.READ_ALL_STORAGE, ex);

    return {};
  }
}

export async function read(key) {
  if (!key) {
    logger(read.name, FILE_NAME, arguments);
    console.error(`${key} ${ErrorMessages.WRONG_VALUE}`);

    return {};
  }
  try {
    const data = await browser.storage.local.get([key]);

    if (!data)
      return {};
    else
      return data[key];
  } catch (ex) {
    const isError = browser.runtime.lastError;

    logger(read.name, FILE_NAME, { arguments, isError });
    console.error(ErrorMessages.READ_STORAGE, ex);

    return {};
  }
}

export async function save(data, key) {
  if (!data || !key) {
    logger(save.name, FILE_NAME, arguments);
    console.error(
      `${data} ${ErrorMessages.WRONG_VALUE}
       ${key} ${ErrorMessages.WRONG_VALUE}`
    );
  }
  try {
    const options = {};
    options[key] = data;

    logger(save.name, FILE_NAME, { arguments, options });

    await browser.storage.local.set(options);

  } catch (ex) {
    const isError = browser.runtime.lastError;

    logger(save.name, FILE_NAME, { arguments, isError });
    console.error(ErrorMessages.SAVE_STORAGE, ex);
  }
}

export function createOptions(wordFrequency, data, partsURL) {
  if (!wordFrequency || !partsURL) {
    logger(createOptions.name, FILE_NAME, { arguments });
    console.error(
     `${wordFrequency} ${ErrorMessages.WRONG_VALUE}
      ${partsURL} ${ErrorMessages.WRONG_VALUE}`
    );

    return {};
  }
  try {
    const { path, thirdDomain } = partsURL;

    const createdAt = data
      ? data.createdAt
      : new Date();

    const selectedWords = data
      ? [...data.selectedWords]
      : [];

    const paths = data
      ? [...data.paths, path]
      : [path];

    const thirdDomains = data
      ? [...data.thirdDomains, thirdDomain]
      : [thirdDomain];

    const options = {
      createdAt,
      selectedWords,
      wordFrequency,
      paths,
      thirdDomains,
    };

    for (let option in options) {
      options[option] = prepareValue(options[option]);
    }

    logger(createOptions.name, FILE_NAME, { arguments, options });

    return options;
  } catch (ex) {
    logger(createOptions.name, FILE_NAME, arguments);
    console.error(ex);
  }
}
