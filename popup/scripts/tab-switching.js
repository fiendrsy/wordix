"use strict";

document.addEventListener("click", (e) => {
	switch (e.target.id) {
		case "parseTab":
			openTab(e, "parse-tab");
			break;
		case "sessionTab":
			openTab(e, "session-tab");
			break;
	}
});

document.getElementById("parseTab").click();

function openTab(e, tabName) {
	const tabcontent = document.querySelectorAll(".tabcontent");
	const tablinks = document.querySelectorAll(".tablinks");
	for (let el of tabcontent) {
		el.style.display = "none";
	}
	for (let el of tablinks) {
		el.className = el.className.replace(" active", "");
	}
	document.getElementById(tabName).style.display = "block";
	e.target.className += " active";
}
