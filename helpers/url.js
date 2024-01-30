export function extractDomain(url, domainLevel) {
  if (!URL.canParse(url)) return "";
  let hostname = new URL(url).hostname;
  if (!domainLevel) return hostname;
  let domains = hostname.split(".").map(normalizeDomain);
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

function normalizeDomain(domain) {
  if (typeof domain !== "string") return domain;
  return domain.toLowerCase().trim();
}

export function extractPath(url) {
  if (!URL.canParse(url)) return "";
  return new URL(url).pathname;
}
