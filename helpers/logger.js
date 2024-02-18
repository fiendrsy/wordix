"use strict";

import { writeErrors } from "./error.js";

const isArgumets = (value) =>
  Object.prototype.toString.call(value) === "[object Arguments]";

const isObject = (value) => value?.constructor === Object;

export const logger = function (funcName, fileName, ...args) {
  if (typeof funcName !== "string" || typeof fileName !== "string") {
    writeErrors(fileName, args);

    return;
  }

  const log = {
    funcName: funcName,
    funcArgs: [],
    localENV: [],
  };

  let values = isObject(args[0]) ? Object.values(args[0]) : args;

  values.forEach((value) => {
    if (isObject(value)) {
      return isArgumets(value)
        ? (log.funcArgs = [...value])
        : log.localENV.push(value);
    }

    log.localENV.push(value);
  });

  console.info(fileName + ":");
  console.dir(log);
}

