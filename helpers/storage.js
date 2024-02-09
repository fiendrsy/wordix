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
    const isError = browser.runtime.lastError;

    if (isError) {
      logger(readAll.name, FILE_NAME, { arguments, data });
      console.error(ErrorMessages.BROWSER_ERROR, isError);

      return {};
    }

    if (!data)
      return {};
    else
      return data;
  } catch (ex) {
    logger(readAll.name, FILE_NAME, arguments);
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
    const isError = browser.runtime.lastError;

    if (isError) {
      logger(read.name, FILE_NAME, { arguments, data });
      console.error(ErrorMessages.BROWSER_ERROR, isError);
      return {};
    }

    if (!data)
      return {};
    else
      return data[key];
  } catch (ex) {
    logger(read.name, FILE_NAME, arguments);
    console.error(ErrorMessages.READ_STORAGE, ex);

    return {};
  }
}

export async function save(data, key) {
  if (!data || !key) {
    logger(save.name, FILE_NAME, arguments);
    console.error(`${data} ${ErrorMessages.WRONG_VALUE} ${key} ${ErrorMessages.WRONG_VALUE}`);
  }
  try {
    const options = {};
    options[key] = data;

    await browser.storage.local.set(options);
    const isError = browser.runtime.lastError;

    if (isError) {
      logger(save.name, FILE_NAME, { arguments, options });
      console.error(ErrorMessages.BROWSER_ERROR, isError);
    }
  } catch (ex) {
    logger(save.name, FILE_NAME, arguments);
    console.error(ErrorMessages.SAVE_STORAGE, ex);
  }
}

export function createOptions(wordFrequency, data, { path, thirdDomain }) {
  try {
    const createdAt = data ? data.createdAt : new Date();
    const selectedWords = data ? [...data.selectedWords] : [];
    const paths = data ? [...data.paths, path] : [path];
    const thirdDomains = data ? [...data.thirdDomains, thirdDomain] : [thirdDomain];

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
    logger(createOptions.name, FILE_NAME, options);
    console.error(ex);
  }
}
