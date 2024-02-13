"use strict";

import * as dom from "./dom.js";

const openTab = function (ev, tabName) {
  const tabContent = dom.qSl(".tabcontent", true);
  const tabLinks = dom.qSl(".tablinks", true);
  const activeTab = dom.qSl("#" + tabName);

  tabContent.forEach((el) => el.style.display = "none");
  tabLinks.forEach((el) => el.className = el.className.replace(" active", ""));

  activeTab.style.display = "block"
  ev.target.className += " active";
};

dom.addLis(document, "click", (ev) => {
  switch (ev.target.id) {
    case "parseTab":
      openTab(ev, "parse-tab");
      break;
    case "sessionTab":
      openTab(ev, "session-tab");
      break;
  }
});

dom.qSl("#parseTab").click();

