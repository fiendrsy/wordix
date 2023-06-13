"use strict";

import getActiveTab from "../helpers/get-active-tab.js";
import getCurrentDate from "../helpers/get-current-date.js";
import parseUrlDomain from "../helpers/parse-url-domain.js";
import parseUrlPath from "../helpers/parse-url-path.js";
import tabsSendMessage from "../helpers/tabs-send-message.js";
import readFromStorage from "../storage/read-from-storage.js";
import saveToStorage from "../storage/save-to-storage.js";

browser.tabs.onUpdated.addListener(tabsUpdateHandler);

async function tabsUpdateHandler(idUpdatedTab, changeInfo) {
	if (changeInfo.status === "complete") {
		let activeTab = await getActiveTab();
		let tabId = activeTab.id;
		let tabUrl = activeTab.url;
		if (tabId === idUpdatedTab) {
			const urlData = collectUrlData(tabUrl);
			let storageData = await readFromStorage(urlData.secondDomain);
			await autoUpdate(storageData, tabId, urlData);
			if (!storageData) {
				let response = await tabsSendMessage(tabId, {});
				let wordFrequency = JSON.parse(response);
				const initialData = generateInitialData(
					urlData.secondDomain,
					urlData.thirdDomain,
					wordFrequency
				);
				initialData[urlData.secondDomain].content.paths.push(urlData.path);
				await saveToStorage(initialData);
			}
		}
	}
}

async function autoUpdate(storageData, tabId, currUrlData) {
	if (!storageData) {
		return;
	}
	const currDate = getCurrentDate();
	const { wordFrequencyFromStorage, pathsFromStorage, thirdDomainFromStorage } =
		getStorageContent(storageData);
	let response = await tabsSendMessage(tabId, {});
	let wordFrequency = JSON.parse(response);
	const words = [];
	const missingWords = [];
	const matchedWords = {};
	for (let [word, _] of wordFrequencyFromStorage) {
		words.push(word);
	}
	for (let [word, count] of wordFrequency) {
		if (!words.includes(word)) {
			missingWords.push([word, count]);
		} else if (
			currUrlData.thirdDomain !== thirdDomainFromStorage ||
			!pathsFromStorage.includes(currUrlData.path)
		) {
			matchedWords[word] = count;
		}
	}

	if (!missingWords.length) {
		return;
	}
	const result = updateWordFrequencyWithMissing(
		missingWords,
		matchedWords,
		wordFrequencyFromStorage
	);
	const initialData = generateInitialData(
		currUrlData.secondDomain,
		currUrlData.thirdDomain,
		wordFrequencyFromStorage
	);
	const { content } = initialData[currUrlData.secondDomain];
	content.wordFrequency = result;
	content.updatedAt = [currDate];
	content.paths.push(...pathsFromStorage, currUrlData.path);
	await saveToStorage(initialData);
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

function generateInitialData(secondDomain, thirdDomain, wordFrequency) {
	const currDate = getCurrentDate();
	const result = {
		[secondDomain]: {
			createdAt: [currDate],
			favorite: [],
			content: {
				updatedAt: [],
				wordFrequency,
				paths: [],
				thirdDomain,
			},
		},
	};
	return result;
}

function collectUrlData(tabUrl) {
	let thirdDomain = parseUrlDomain(tabUrl, "third");
	let path = parseUrlPath(tabUrl);
	let secondDomain = parseUrlDomain(tabUrl, "second");
	const result = {
		thirdDomain,
		secondDomain,
		path,
	};
	return result;
}

function getStorageContent(storageData) {
	const content = storageData.content;
	let wordFrequencyFromStorage = content.wordFrequency;
	let pathsFromStorage = content.paths;
	let thirdDomainFromStorage = content.thirdDomain;
	const result = {
		wordFrequencyFromStorage,
		pathsFromStorage,
		thirdDomainFromStorage,
	};
	return result;
}
