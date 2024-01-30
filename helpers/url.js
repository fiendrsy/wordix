export const DomainLevels = {
  TOP: "top",
  SECOND: "second",
  THIRD: "third",
};

export function extractDomain(url, domainLevel) {
  if (!URL.canParse(url)) return "";
  const hostname = new URL(url).hostname;
  if (!domainLevel) return hostname;
  const domains = hostname.split(".").map(_normalizeDomain);
  return _selectDomain(domains, domainLevel);
}

function _normalizeDomain(domain) {
  if (typeof domain !== "string") return domain;
  return domain.toLowerCase().trim();
}

function _selectDomain(domains, domainLevel) {
  const thirdDomain = domains.length > 2 ? domains.shift() : "";
  switch (domainLevel) {
    case DomainLevels.TOP:
      return domains[1];
    case DomainLevels.SECOND:
      return domains[0];
    case DomainLevels.THIRD:
      return thirdDomain;
  }
}

export function compose(url) {
  const thirdDomain = extractDomain(url, DomainLevels.THIRD);
  const path = extractPath(url);
  const secondDomain = extractDomain(url, DomainLevels.SECOND);
  return {
    thirdDomain,
    secondDomain,
    path,
  };
}

export function extractPath(url) {
  if (!URL.canParse(url)) return "";
  return new URL(url).pathname;
}
