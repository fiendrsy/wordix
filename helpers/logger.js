"use strict";

import { writeErrors } from "./error.js";

const isArgumets = (value) => {
  const ARGUMENTS_OBJECT = "[object Arguments]";

  return Object.prototype.toString.call(value) === ARGUMENTS_OBJECT;
};

const isObject = (value) => value?.constructor === Object;

export const logger = function (funcName, fileName, ...args) {
  if (typeof funcName !== "string" || typeof fileName !== "string") {
    writeErrors(fileName, args);

    return;
  }

  const log = {
    funcName,
    funcArgs: [],
    localENV: [],
  };

  let values = isObject(args[0]) ? Object.values(args[0]) : args;

  values.forEach((value) => {
    if (isObject(value)) {
      if (isArgumets(value))
        log.funcArgs = [...value];
      else
        log.localENV.push(value);

      return;
    }

    log.localENV.push(value);
  });

  console.info(fileName + ":");
  console.dir(log);
};
