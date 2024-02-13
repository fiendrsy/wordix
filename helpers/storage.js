"use strict";

import { logger } from "./logger.js";
import { writeErrors } from "./error.js";

// The current file name needed for logger
const FILE_NAME = "storage.js";

const excludeDuplicates = (items) => [...new Set(items)];

const validateValues = (values) => values.filter((value) => !!value?.length); // Hack

const prepareValue = function (data, key) {
  const options = {};
  const prepareData = data;

  for (let prop in prepareData) {
    let value = prepareData[prop];

    if (Array.isArray(value)) {
      const uniqItems = excludeDuplicates(value);

      prepareData[prop] = validateValues(uniqItems);
    } else if (typeof value !== "string") {
      prepareData[prop] = String(value);
    }
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

export const createOptions = function (wordFrequency, data, partsURL) {
  if (!wordFrequency || !partsURL) {
    logger(createOptions.name, FILE_NAME, { arguments });
    writeErrors(wordFrequency, partsURL);

    return null;
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

    logger(createOptions.name, FILE_NAME, { arguments, options });

    return options;
  } catch (ex) {
    logger(createOptions.name, FILE_NAME, arguments);
    writeErrors(ex);
  }
};
