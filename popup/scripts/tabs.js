document.addEventListener("click", e => {
	switch (e.target.id) {
		case "filterTab":
			openTab(e, "filter-tab");
			break;
		case "accountTab":
			openTab(e, "account-tab");
			break;
	}
});

document.querySelector("#filterTab").click();

function openTab(e, tabName) {
	let tabcontent = document.querySelectorAll(".tabcontent");
	let tablinks = document.querySelectorAll(".tablinks");
	for (let el of tabcontent) {
		el.style.display = "none";
	}
	for (let el of tablinks) {
		el.className = el.className.replace(" active", "");
	}
	document.getElementById(tabName).style.display = "block";
	e.target.className += " active";
}
