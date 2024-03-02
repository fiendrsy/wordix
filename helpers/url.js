"use strict";

import { DomainLevels, FragmentsURL } from "../constants/constants.js";

const selectDomain = function (domains, domainLevel) {
  const thirdDomain = domains.length > 2 ? domains.shift() : "";

  switch (domainLevel) {
    case DomainLevels.TOP:
      return domains[1];
    case DomainLevels.SECOND:
      return domains[0];
    case DomainLevels.THIRD:
      return thirdDomain;
  }
};

const normalizeDomain = (domain) => domain.toString().toLowerCase().trim();

const extractDomain = function (url, domainLevel) {
  const hostname = new URL(url).hostname;

  if (!domainLevel)
    return hostname;

  const domains = hostname.split(".").map(normalizeDomain);

  return selectDomain(domains, domainLevel);
};

const extractPath = (url) => new URL(url).pathname + new URL(url).search;

const isLocalHost = (url) =>
  extractDomain(url) === FragmentsURL.LOCALHOST || extractDomain(url) === FragmentsURL.NUMERIC_HOST;

const isHTTP = (url) => url.startsWith(FragmentsURL.HTTP) || url.startsWith(FragmentsURL.HTTPS);

const isValidURL = (url) => URL.canParse(url) && isHTTP(url) && !isLocalHost(url);

export const composeParts = function (url) {
  if (!isValidURL(url))
    return null;

  const hostname = extractDomain(url);
  const thirdDomain = extractDomain(url, DomainLevels.THIRD);
  const secondDomain = extractDomain(url, DomainLevels.SECOND);
  const topDomain = extractDomain(url, DomainLevels.TOP);
  const path = extractPath(url);

  return {
    hostname,
    thirdDomain,
    secondDomain,
    topDomain,
    path,
  };
};
