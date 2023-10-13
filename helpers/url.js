export function parseDomain(url, level) {
  const PATTERN = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gim;
  let urlWithoutPath = url.match(PATTERN);
  let urlWithoutSchema = urlWithoutPath[0].replace("https://", "");
  if (!level) return urlWithoutSchema;
  let domains = urlWithoutSchema.split(".");
  if (domains.length > 2) {
    switch (level) {
      case "top":
        return domains[2];
      case "second":
        return domains[1];
      case "third":
        return domains[0];
    }
  }
  switch (level) {
    case "top":
      return domains[1];
    case "second":
      return domains[0];
    default:
      return "";
  }
}

export function parsePath(url) {
  const parts = url.split("/");
  const result = parts.slice(3).join("/");
  return result;
}
