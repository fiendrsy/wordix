import { DomainLevels } from "../constants/constants.js";

const normalizeDomain = (domain) =>
  typeof domain !== "string" ? domain : domain.trim().toLowerCase();

const isSystemURL = (url) =>
  url.startsWith("about:") ||
  url.startsWith("chrome:") ||
  url.startsWith("local:") ||
  url.startsWith("view-source:");

function selectDomain(domains, domainLevel) {
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

const extractPath = (url) => new URL(url).pathname;

function extractDomain(url, domainLevel) {
  const hostname = new URL(url).hostname;

  if (!domainLevel) return hostname;

  const domains = hostname.split(".").map(normalizeDomain);

  return selectDomain(domains, domainLevel);
}

export function isValidURL(url) {
  return URL.canParse(url) && !isSystemURL(url);
}

export function composeParts(url) {
  if (!isValidURL(url)) return {};

  const thirdDomain = extractDomain(url, DomainLevels.THIRD);
  const secondDomain = extractDomain(url, DomainLevels.SECOND);
  const topDomain = extractDomain(url, DomainLevels.TOP);
  const path = extractPath(url);

  return {
    thirdDomain,
    secondDomain,
    topDomain,
    path,
  };
}
