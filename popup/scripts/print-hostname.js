import * as dom from "./dom.js";
import { logger } from "../../helpers/logger.js";
import { writeErrors } from "../../helpers/error.js";

// The current file name needed for logger
const FILE_NAME = "print-hostnama.js";

export const printHostname = (hostname) => {
  if (typeof hostname !== "string") {
    logger(printHostname.name, FILE_NAME, hostname);
    writeErrors(hostname);

    return;
  }

  dom.text(".current-site-address", hostname);

  void 0;
};
