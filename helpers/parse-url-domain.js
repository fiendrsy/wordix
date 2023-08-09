export default function parseUrlDomain(url, level) {
  const pattern = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/gim;
  let urlWithoutPath = url.match(pattern);
  let urlWithoutSchema = urlWithoutPath[0].replace("https://", "");
  if (level) {
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
  return urlWithoutSchema;
}
