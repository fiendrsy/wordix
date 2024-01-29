export function parseDomain(url, domainLevel) {
  const PATTERN = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gim;
  let urlWithoutPath = url.match(PATTERN);
  let urlWithoutSchema = urlWithoutPath[0].replace("https://", "");
  if (!domainLevel) return urlWithoutSchema;
  let domains = urlWithoutSchema.split(".");
  if (domains.length > 2) {
    switch (domainLevel) {
      case "top":
        return domains[2];
      case "second":
        return domains[1];
      case "third":
        return domains[0];
    }
  }
  switch (domainLevel) {
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
