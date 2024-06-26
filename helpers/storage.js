"use strict";

import { logger } from "./logger.js";
import { writeErrors } from "./error.js";

// The current file name needed for logger
const FILE_NAME = "storage.js";

const isFlat = (values) =>
  values.filter((value) => Array.isArray(value)).length !== values.length;

const excludeDuplicates = (values) => {
  if (isFlat(values))
    return [...new Set(values)];
  else
    return values.map((arr) => [...new Set(arr)]);
};

const validateValues = (values) => {
  const uniqItems = excludeDuplicates(values);

  return uniqItems.filter((value) => {
    if (Array.isArray(value)) {
      // Length of the value before validations
      const startLen = value.length;
      const result = validateValues(value);

     /**
       If the result length is not equal to startLen var,
       it means the value is not valid
     **/
      return result.length === startLen;
    }

    if (typeof value === "string" && value.length > 0)
      return true;

    if (typeof value === "number")
      return true;

    return false;
  });
};

const prepareValue = function (data, key) {
  const options = {};
  const prepareData = data;

  for (let prop in prepareData) {
    let value = prepareData[prop];

    if (Array.isArray(value))
      prepareData[prop] = validateValues(value);
  }

  options[key] = prepareData;

  return options;
};

export const readAll = async function () {
  try {
    const data = await browser.storage.local.get();
    const dataExist = !!Object.keys(data).length;

    if (!dataExist)
      return null;
    else
      return Object.values(data);
  } catch (ex) {
    const isError = browser.runtime.lastError;

    logger(readAll.name, FILE_NAME, { arguments, isError });
    writeErrors(ex, isError);

    return null;
  }
};

export const read = async function (key) {
  if (!key || typeof key !== "string") {
    logger(read.name, FILE_NAME, arguments);
    writeErrors(key);

    return null;
  }
  try {
    const data = await browser.storage.local.get([key]);
    const dataExist = !!Object.keys(data).length;

    if (!dataExist)
      return null;
    else
      return data[key];
  } catch (ex) {
    const isError = browser.runtime.lastError;

    logger(read.name, FILE_NAME, { arguments, isError });
    writeErrors(ex, isError);

    return null;
  }
};

export const save = async function (data, key) {
  if (data.constructor !== Object || !data || !key) {
    logger(save.name, FILE_NAME, arguments);
    writeErrors(data, key);
  }
  try {
    const options = prepareValue(data, key);

    logger(save.name, FILE_NAME, { arguments, options });

    await browser.storage.local.set(options);
  } catch (ex) {
    const isError = browser.runtime.lastError;

    logger(save.name, FILE_NAME, { arguments, isError });
    writeErrors(ex, isError);
  }
};

export const createOptions = async function (partsURL, wordFrequency, wordFrequencyByPath) {
  if (!partsURL || partsURL.constructor !== Object) {
    logger(createOptions.name, FILE_NAME, arguments);
    writeErrors(partsURL);

    return null;
  }
  try {
    const { path, thirdDomain, secondDomain } = partsURL;

    const data = await read(secondDomain);

    if (!wordFrequency) {
      if (data) {
        wordFrequency = data.wordFrequency;
      } else {
        logger(createOptions.name, FILE_NAME, arguments);
        writeErrors(wordFrequency);

        return null;
      }
    }

    const createdAt = data
      ? data.createdAt
      : Date.now();

    const selectedWords = data
      ? [...data.selectedWords]
      : [];

    const thirdDomains = data
      ? [...data.thirdDomains, thirdDomain]
      : [thirdDomain];

    const paths = new Map(data
      ? [...data.paths]
      : []
    );

    if (wordFrequencyByPath || !data)
      paths.set(path, wordFrequencyByPath || wordFrequency);

    const options = {
      createdAt,
      selectedWords,
      wordFrequency,
      paths,
      thirdDomains,
    };

    logger(createOptions.name, FILE_NAME, { arguments, options });

    return options;
  } catch (ex) {
    logger(createOptions.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};
