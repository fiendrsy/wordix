export function extractDomain(url, domainLevel) {
  if (!URL.canParse(url)) return "";
  let hostname = new URL(url).hostname;
  if (!domainLevel) return hostname;
  let domains = hostname.split(".").map(_normalizeDomain);
  return _selectDomain(domains, domainLevel);
}

function _normalizeDomain(domain) {
  if (typeof domain !== "string") return domain;
  return domain.toLowerCase().trim();
}

function _selectDomain(domains, domainLevel) {
  let thirdDomain = domains.length > 2 ? domains.shift() : "";
  switch (domainLevel) {
    case "top":
      return domains[1];
    case "second":
      return domains[0];
    case "third":
      return thirdDomain;
  }
}

export function extractPath(url) {
  if (!URL.canParse(url)) return "";
  return new URL(url).pathname;
}
