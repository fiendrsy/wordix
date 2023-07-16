"use strict";

import getActiveTab from "../helpers/get-active-tab.js";
import getCurrentDate from "../helpers/get-current-date.js";
import parseUrlDomain from "../helpers/parse-url-domain.js";
import parseUrlPath from "../helpers/parse-url-path.js";
import tabsSendMessage from "../helpers/tabs-send-message.js";
import readFromStorage from "../storage/read-from-storage.js";
import saveToStorage from "../storage/save-to-storage.js";

// [ ] fix createAt logic 

const BAD_DOMAINS = ["twitch", "youtube"];

async function tabsUpdateHandler(idUpdatedTab, changeInfo) {
	let activeTab = await getActiveTab();
	let urlData = collectUrlData(activeTab.url);
	if (
		changeInfo.status !== "complete" ||
		activeTab.id !== idUpdatedTab ||
		BAD_DOMAINS.includes(urlData.secondDomain)
	) {
		return;
	}
	let storageData = await readFromStorage(urlData.secondDomain);
	await autoUpdate(storageData, activeTab.id, urlData);
}

async function autoUpdate(storageData, tabId, currUrlData) {
	if (!storageData) {
		addNewContent(tabId, currUrlData);
		return;
	}
	processing(getStorageContent(storageData), currUrlData, tabId);
}

function updateWordFrequencyWithMissing(
	missingWords,
	matchedWords,
	oldWordFrequency
) {
	const updatedWordFrequency = oldWordFrequency.map(([word, count]) => {
		if (word in matchedWords) {
			let sum = count + matchedWords[word];
			return [word, sum];
		}
		return [word, count];
	});
	updatedWordFrequency.push(...missingWords);
	return updatedWordFrequency;
}

function generateInitialData(secondDomain, wordFrequency) {
	const currDate = getCurrentDate();
	return {
		[secondDomain]: {
			createdAt: [currDate],
			selectedWords: [],
			wordFrequency,
			paths: [],
			thirdDomains: [],
		},
	};
}

function collectUrlData(tabUrl) {
	let thirdDomain = parseUrlDomain(tabUrl, "third");
	let path = parseUrlPath(tabUrl);
	let secondDomain = parseUrlDomain(tabUrl, "second");
	return {
		thirdDomain,
		secondDomain,
		path,
	};
}

function getStorageContent(storageData) {
	// change the function name
	let wordFrequencyFromStorage = storageData.wordFrequency;
	let pathsFromStorage = storageData.paths;
	let thirdDomainsFromStorage = storageData.thirdDomains;
	return {
		wordFrequencyFromStorage,
		pathsFromStorage,
		thirdDomainsFromStorage,
	};
}

async function addNewContent(
	tabId,
	{ secondDomain, path, thirdDomain } = urlData
) {
	let response = await tabsSendMessage(tabId, {});
	let wordFrequency = JSON.parse(response);
	const initialData = generateInitialData(secondDomain, wordFrequency);
	initialData[secondDomain].paths.push(path);
	initialData[secondDomain].thirdDomains.push(thirdDomain);
	await saveToStorage(initialData);
}

async function updateContent(
	updatedWordFrequency,
	initialData,
	secondDomain,
	path,
	thirdDomainsFromStorage,
	pathsFromStorage
) {
	initialData[secondDomain].wordFrequency = updatedWordFrequency;
	initialData[secondDomain].paths = [...pathsFromStorage, path];
	initialData[secondDomain].thirdDomains = [...thirdDomainsFromStorage];
	await saveToStorage(initialData);
}

async function processing(
	{
		wordFrequencyFromStorage,
		pathsFromStorage,
		thirdDomainsFromStorage,
	} = storageData,
	{ path, secondDomain } = currUrlData,
	tabId
) {
	let response = await tabsSendMessage(tabId, {});
	let wordFrequency = JSON.parse(response);
	const wordsFromStorage = [];
	const missingWords = [];
	const matchedWords = {};
	for (let [word] of wordFrequencyFromStorage) {
		wordsFromStorage.push(word);
	}
	for (let [word, count] of wordFrequency) {
		if (!wordsFromStorage.includes(word)) {
			missingWords.push([word, count]);
		} else if (!pathsFromStorage.includes(path)) {
			matchedWords[word] = count;
		}
	}
	if (!missingWords.length && !Object.values(matchedWords).length) {
		return;
	}
	updateContent(
		updateWordFrequencyWithMissing(
			missingWords,
			matchedWords,
			wordFrequencyFromStorage
		),
		generateInitialData(secondDomain, wordFrequencyFromStorage),
		secondDomain,
		path,
		thirdDomainsFromStorage,
		pathsFromStorage
	);
}

browser.tabs.onUpdated.addListener(tabsUpdateHandler);
