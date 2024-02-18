"use strict";

import { ErrorMessages } from "../constants/constants.js";

// The element of the stack is == "writeErrors@moz-extension://3ccf89c2-56e6-425d-8605-eba273ab3b84/helpers/error.js:63:11"
const extractFunctionNames = (stack) =>
  stack
    .split("\n")
    .filter((el) => !!el)
    .map((str) => str.split("@")[0]);

export const writeErrors = (...reasons) => {
  reasons.forEach((reason) => {
    if (reason instanceof Error) {
      const { message, cause, stack, fileName, lineNumber } = reason;

      console.info(ErrorMessages.DETAILS);
      console.table([{ message, cause, fileName, lineNumber }]);

      if (stack?.length > 0) {
        const functionNames = extractFunctionNames(stack);

        console.info(ErrorMessages.STACK);
        console.table(functionNames);
      }

      return;
    }

    // The condition is triggered when the reason variable is equal to (null, empty string, undefined)
    if (!reason) {
      console.warn(`${reason} ${ErrorMessages.WRONG_VALUE}`);

      return;
    }

    console.info(reason);
  });
};
