import Map from "https://js.arcgis.com/4.22/@arcgis/core/Map.js";
import WebMap from "https://js.arcgis.com/4.22/@arcgis/core/WebMap.js";
import MapView from "https://js.arcgis.com/4.22/@arcgis/core/views/MapView.js";
import Home from "https://js.arcgis.com/4.22/@arcgis/core/widgets/Home.js";
import Legend from "https://js.arcgis.com/4.22/@arcgis/core/widgets/Legend.js";
import Search from "https://js.arcgis.com/4.22/@arcgis/core/widgets/Search.js";
import Expand from "https://js.arcgis.com/4.22/@arcgis/core/widgets/Expand.js";
import { whenFalseOnce } from "https://js.arcgis.com/4.22/@arcgis/core/core/watchUtils.js";

import { appConfig } from "./config.js";
import { appState } from "./state.js";

async function init() {
  // query for elements
  const resultsNode = document.getElementById("results");
  const attendanceNode = document.getElementById("attendance");
  const housingSectionNode = document.getElementById("housingSection");
  const housingNode = document.getElementById("housing");
  const programTypeNode = document.getElementById("programType");
  const schoolTypeNode = document.getElementById("schoolType");
  const resultBlockNode = document.getElementById("resultBlock");
  const paginationNode = document.getElementById("pagination");
  const filtersNode = document.getElementById("filters");
  const resetNode = document.getElementById("reset");
  const flowNode = document.getElementById("flow");
  const themeNode = document.getElementById("themeToggle");
  const darkThemeCss = document.getElementById("jsapi-theme-dark");
  const lightThemeCss = document.getElementById("jsapi-theme-light");

  async function getAttachment(objectId, result) {
    const campusImageContainerNode = document.getElementById(
      "campusImageContainer"
    );
    campusImageContainerNode.innerHTML = "";

    const attachments = await collegeLayer.queryAttachments({
      objectIds: [objectId],
      num: 1,
    });

    const attachmentGroup = attachments[objectId];

    if (attachmentGroup) {
      const attachment = attachmentGroup[0];
      const image = document.createElement("img");
      image.src = `${attachment.url}/${attachment.name}`;
      campusImageContainerNode.appendChild(image);
      return;
    }

    const container = document.createElement("div");
    container.id = "campusViewDiv";
    campusImageContainerNode.appendChild(container);

    const map = new Map({
      basemap: "satellite",
    });

    const view = new MapView({
      container,
      map,
      center: [result.geometry.longitude, result.geometry.latitude],
      zoom: 15,
    });

    view.ui.components = [];
  }

  // display requested item data
  // handle flow destroying dom of added panel...
  async function resultClickHandler(objectId) {
    appState.savedExtent = view.extent.clone();
    appState.activeItem = true;

    await whenFalseOnce(collegeLayerView, "updating");

    const { features } = await collegeLayerView.queryFeatures({
      returnGeometry: true,
      outSpatialReference: view.spatialReference,
      objectIds: [objectId],
      outFields: appConfig.collegeLayerOutFields,
    });

    const result = features[0];

    if (!result.geometry || !result.attributes) {
      return;
    }

    filtersNode.hidden = true;
    const attributes = result.attributes;
    const detailPanelNode = document.getElementById("detail-panel");
    
    // a janky way to replace content in a single panel vs appending entire new one each time
    if (!detailPanelNode) {
      const panel = document.createElement("calcite-panel");
      panel.heading = handleCasing(attributes["PlaceName"]);
      panel.summary = `${attributes["Rating"]} Stars(s)`;
      panel.id = "detail-panel";
      panel.addEventListener("calcitePanelBackClick", async () => {
        if (appState.savedExtent) {
          await view.goTo(appState.savedExtent);
          appState.savedExtent = null;
        }
        appState.activeItem = false;
        filtersNode.hidden = false;
      });

      const blockOne = document.createElement("calcite-block");
      blockOne.heading = "Restaurant Overview";
      blockOne.collapsible = true;
      blockOne.open = true;

      const blockTwo = document.createElement("calcite-block");
      blockTwo.heading = "Location";
      blockTwo.collapsible = true;
      blockTwo.open = true;

      const blockThree = document.createElement("calcite-block");
      blockThree.heading = "Business Information";
      blockThree.collapsible = true;
      blockThree.open = true;

      if (attributes["FileRoot"]) {
        const itemWebsite = document.createElement("calcite-button");
        itemWebsite.id = "detail-website-link";
        itemWebsite.iconEnd = "launch";
        itemWebsite.slot = "footer-actions";
        itemWebsite.scale = "l";
        itemWebsite.width = "full";
        itemWebsite.innerText = `StreetView Image`;
        itemWebsite.href = `https://www.eichcorp.com/views/${attributes["FileRoot"]}_pic.jpg`;
        itemWebsite.rel = `noref noreferrer`;
        itemWebsite.target = `blank`;
        panel.appendChild(itemWebsite);
      }

      const notice = document.createElement("calcite-notice");
      notice.active = true;
      notice.width = "full";

      const message = document.createElement("span");
      message.id = "overview-text";
      message.slot = "message";
      message.innerText = attributes["overview"]
        ? attributes["overview"]
        : "No overview available";

      notice.appendChild(message);
      blockOne.appendChild(notice);

      if (attributes["RestType"] && attributes["RestType"] >= 0) {
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Restaurant Type";
        const span = document.createElement("span");
        span.id = "detail-type";
        // TODO use config to translate code to string
        var myText = `Type ${attributes["RestType"]}`;
        span.innerText = myText;
        label.append(span);
        blockOne.appendChild(label);
      }

      // ------------------------------------------------------------------------------------
      // Location

      if (attributes["Place_addr"]) {
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Address";
        const span = document.createElement("span");
        span.id = "detail-total";
        span.innerText = `${attributes["Place_addr"]}`;
        label.append(span);
        blockTwo.appendChild(label);
      }

      if (attributes["Latitude"]) {
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Latitude";
        const span = document.createElement("span");
        span.id = "detail-ft";
        span.innerText = `${attributes["Latitude"]}`;
        label.append(span);
        blockTwo.appendChild(label);
      }

      if (attributes["Longitude"]) {
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Longitude";
        const span = document.createElement("span");
        span.id = "detail-pt";
        span.innerText = `${attributes["Longitude"]}`;
        label.append(span);
        blockTwo.appendChild(label);
      }

      // -----------------------------------------------------------------------------------
      // Business Information

      // TODO translate integer codes to strings using config.js

      if (attributes["Rating"] && attributes["Rating"] >=0) {
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Rating";
        const span = document.createElement("span");
        span.id = "detail-housing";
        span.innerText = `${attributes["Rating"]} Stars(s)`;
        label.append(span);
        blockThree.appendChild(label);
      }

      if (attributes["RestType"] && attributes["Rating"] >=0) {
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Restaurant Type";
        const span = document.createElement("span");
        span.id = "detail-housing";
        span.innerText = `Type ${attributes["RestType"]}`;
        label.append(span);
        blockThree.appendChild(label);
      }

      if (attributes["HasSeating"] && attributes["HasSeating"] >=0) {
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Has Seating";
        const span = document.createElement("span");
        span.id = "detail-housing";
        span.innerText = `${
          parseInt(attributes["HasSeating"]) === 0 ? "Yes" : "No"
        }`;
        label.append(span);
        blockThree.appendChild(label);
      }

      // TODO come back to this NumSeats = 0 fails this if
      // if (attributes["NumSeats"]) {
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Seats";
        const span = document.createElement("span");
        span.id = "detail-housing";
        span.innerText = `${attributes["NumSeats"]}`;
        label.append(span);
        blockThree.appendChild(label);
      // }

      // -----------------------------------------------------------------------------------

      panel.appendChild(blockOne);
      panel.appendChild(blockTwo);
      panel.appendChild(blockThree);

      flowNode.appendChild(panel);
    } else {
      detailPanelNode.heading = handleCasing(attributes["NAME"]);
      detailPanelNode.summary = `${handleCasing(attributes["CITY"])}, ${
        attributes["STATE"]
      }`;

      document.getElementById(
        "detail-website-link"
      ).href = `http://${attributes["WEBSITE"]}`;

      document.getElementById("overview-text").innerText = attributes[
        "overview"
      ]
        ? attributes["overview"]
        : "No overview available";

      document.getElementById(
        "detail-type"
      ).innerText = `${attributes["schoolType"]}`;

      document.getElementById("detail-total").innerText = `${parseInt(
        attributes["TOT_ENROLL"]
      ).toLocaleString()}`;

      document.getElementById("detail-ft").innerText = `${parseInt(
        attributes["FT_ENROLL"] === -999 ? "0" : attributes["FT_ENROLL"]
      ).toLocaleString()}`;

      document.getElementById("detail-pt").innerText = `${parseInt(
        attributes["PT_ENROLL"] === -999 ? "0" : attributes["PT_ENROLL"]
      ).toLocaleString()}`;

      document.getElementById("detail-housing-capac").innerText = `${
        parseInt(attributes["DORM_CAP"]) !== -999
          ? parseInt(attributes["DORM_CAP"]).toLocaleString()
          : "N/A"
      }`;
      document.getElementById("detail-housing").innerText = `${
        parseInt(attributes["DORM_CAP"]) !== -999 ? "Yes" : "No"
      }`;

      document.getElementById("detail-address").innerText = `${handleCasing(
        attributes["ADDRESS"]
      )}, ${handleCasing(attributes["CITY"])}, ${attributes["STATE"]}`;

      document.getElementById("detail-website").innerText = `${
        attributes["WEBSITE"] ? attributes["WEBSITE"] : "N/A"
      }`;

      document.getElementById("detail-phone").innerText = `${
        attributes["TELEPHONE"] ? attributes["TELEPHONE"] : "N/A"
      }`;
    }
    view.goTo(
      {
        center: [result.geometry.longitude, result.geometry.latitude],
        zoom: 13,
      },
      { duration: 400 }
    );
  }

  // uh probably do this elsewhere
  function handleCasing(string) {
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
      .join(" ");
  }

  function combineSQLStatements(where, sql, operator = "AND") {
    return where ? ` ${operator} (${sql})` : `(${sql})`;
  }

  function whereClause() {
    let where = appConfig.defaultWhereClause;

    if (appState.housing?.enabled) {
      where += combineSQLStatements(where, `HasSeating=1`);
      where += combineSQLStatements(
        where,
        `NumSeats > ${appState.housing.min}`
      );
      where += combineSQLStatements(
        where,
        `NumSeats < ${appState.housing.max}`
      );
    }

    if (appState.activeProgramTypes.length > 0) {
      let schoolWhere = "";
      const values = appState.activeProgramTypes.flat();
      values.forEach(
        (value) =>
          (schoolWhere += combineSQLStatements(
            schoolWhere,
            `Rating = ${value}`,
            "OR"
          ))
      );
      where += combineSQLStatements(where, schoolWhere);
    }

    const schoolTypeValue = schoolTypeNode.value;
    if (schoolTypeValue && schoolTypeValue !== appConfig.defaultSchoolType) {
      const values = schoolTypeValue.split(",");
      let schoolWhere = "";
      values.forEach(
        (value) =>
          (schoolWhere += combineSQLStatements(
            schoolWhere,
            `RestType = ${value}`,
            "OR"
          ))
      );
      where += combineSQLStatements(where, schoolWhere);
    }

    return where;
  }

  function resetFilters() {
    schoolTypeNode.value = appConfig.defaultSchoolType;
    appState.housing = { ...appConfig.housing };
    housingSectionNode.open = appConfig.housing.enabled;
    housingNode.minValue = appConfig.housing.min;
    housingNode.maxValue = appConfig.housing.max;
    appState.activeProgramTypes = [];
    [...document.querySelectorAll(`[data-type*="type"]`)].forEach(
      (item) => (item.color = "grey")
    );
    appState.hasFilterChanges = false;
    queryItems();
  }

  function filterMap() {
    if (!collegeLayerView) {
      return;
    }

    const where = whereClause();

    collegeLayerView.featureEffect = {
      filter: {
        where: where,
      },
      excludedEffect: "grayscale(80%) opacity(30%)",
    };
  }

  function displayNoResult() {
    const notice = document.createElement("calcite-notice");
    notice.active = true;
    notice.width = "full";

    const message = document.createElement("span");
    message.slot = "message";
    message.innerText = "Reset filters or move the map";

    const title = document.createElement("span");
    title.slot = "title";
    title.innerText = "No results in view";

    notice.appendChild(title);
    notice.appendChild(message);
    resultsNode.appendChild(notice);
  }

  function displayResult(result) {
    const attributes = result.attributes;
    const itemButton = document.createElement("button");
    itemButton.className = "item-button";
    const item = document.createElement("calcite-card");
    itemButton.appendChild(item);

    if (parseInt(attributes["HasSeating"]) === 1) {
      const chip = document.createElement("calcite-chip");
      chip.icon = "organization";
      chip.slot = "footer-trailing";
      chip.scale = "s";
      chip.innerText = "Seating";
      item.appendChild(chip);
    }

    const chipState = document.createElement("calcite-chip");
    chipState.slot = "footer-leading";
    chipState.scale = "s";
    chipState.icon = "star";
    chipState.innerText = `${attributes["Rating"]} Star(s)`;
    item.appendChild(chipState);

    const title = document.createElement("span");
    title.slot = "title";
    title.innerText = handleCasing(attributes["PlaceName"]);

    const summary = document.createElement("span");
    summary.slot = "subtitle";
    summary.innerText = handleCasing(attributes["Place_addr"]);

    item.appendChild(title);
    item.appendChild(summary);

    itemButton.addEventListener("click", () =>
      resultClickHandler(result.attributes[collegeLayer.objectIdField])
    );

    resultsNode.appendChild(itemButton);
  }

  async function queryItems(start = 0) {
    resetNode.hidden = !appState.hasFilterChanges;
    resetNode.indicator = appState.hasFilterChanges;

    if (!collegeLayerView) {
      return;
    }

    resultBlockNode.loading = true;

    const where = whereClause();

    collegeLayerView.featureEffect = {
      filter: {
        where: where,
      },
      excludedEffect: "grayscale(80%) opacity(30%)",
    };

    await whenFalseOnce(collegeLayerView, "updating");

    if (start === 0) {
      appState.count = await collegeLayerView.queryFeatureCount({
        geometry: view.extent.clone(),
        where,
      });
      paginationNode.total = appState.count;
      paginationNode.start = 1;
    }

    paginationNode.hidden = appState.count <= appConfig.pageNum;

    const results = await collegeLayerView.queryFeatures({
      start,
      num: appConfig.pageNum,
      geometry: view.extent.clone(),
      where: whereClause(),
      outFields: [
        ...appConfig.collegeLayerOutFields,
        collegeLayer.objectIdField,
      ],
    });

    resultBlockNode.loading = false;

    resultBlockNode.summary = `${appState.count} restaurants found within the map.`;

    resultsNode.innerHTML = "";
    if (results.features.length) {
      results.features.map((result) => displayResult(result));
    } else {
      displayNoResult();
    }
  }

  const map = new WebMap({
    portalItem: {
      id: appConfig.webmap,
    },
  });

  const view = new MapView({
    container: "viewDiv",
    map,
    highlightOptions: {
      fillOpacity: 0,
      haloColor: "#D0D0D0",
    },
  });

  view.ui.add(
    new Home({
      view,
    }),
    "top-left"
  );

  view.ui.move("zoom", "top-left");

  const search = new Search({
    view,
    resultGraphicEnabled: false,
    popupEnabled: false,
  });

  const searchExpand = new Expand({
    view,
    content: search,
  });

  view.ui.add(searchExpand, "top-left");

  const legend = new Legend({
    view,
  });

  const legendExpand = new Expand({
    view,
    content: legend,
  });

  view.ui.add(legendExpand, "top-left");

  await view.when();

  const collegeLayer = view.map.layers.find(
    (layer) => layer.url === appConfig.collegeLayerUrl
  );

  if (!collegeLayer) {
    return;
  }

  await collegeLayer.load();

  collegeLayer.outFields = [
    ...appConfig.collegeLayerOutFields,
    collegeLayer.objectIdField,
  ];
  const collegeLayerView = await view.whenLayerView(collegeLayer);

  // View clicking
  view.on("click", async (event) => {
    const response = await view.hitTest(event);

    const results = response.results.filter(
      (result) =>
        result.graphic.sourceLayer?.id === collegeLayer.id &&
        !result.graphic.isAggregate
    );

    if (!results.length) {
      return;
    }

    const graphic = results[0].graphic;

    resultClickHandler(graphic.attributes[collegeLayer.objectIdField]);
  });

  // Seating
  housingSectionNode.open = appConfig.housing.enabled;
  housingSectionNode.addEventListener("calciteBlockSectionToggle", (event) => {
    appState.housing.enabled = event.target.open;
    appState.hasFilterChanges = true;
    queryItems();
  });
  housingNode.min = appConfig.housing.min;
  housingNode.max = appConfig.housing.max;
  housingNode.minValue = appConfig.housing.min;
  housingNode.maxValue = appConfig.housing.max;
  housingNode.addEventListener("calciteSliderInput", (event) => {
    appState.housing.min = event.target.minValue;
    appState.housing.max = event.target.maxValue;
    appState.hasFilterChanges = true;
    filterMap();
  });
  housingNode.addEventListener("calciteSliderChange", (event) => {
    appState.housing.min = event.target.minValue;
    appState.housing.max = event.target.maxValue;
    appState.hasFilterChanges = true;
    queryItems();
  });

  // Restuarant type select
  for (const [key, value] of Object.entries(appConfig.schoolTypes)) {
    const option = document.createElement("calcite-option");
    option.value = value.join(",");
    option.innerText = key;
    schoolTypeNode.appendChild(option);
  }
  schoolTypeNode.addEventListener("calciteSelectChange", () => {
    appState.hasFilterChanges = true;
    queryItems();
  });

  // Rating chip select
  for (const [key, value] of Object.entries(appConfig.programTypes)) {
    const chip = document.createElement("calcite-chip");
    chip.tabIndex = 0;
    chip.dataset.type = "type";
    chip.value = value;
    chip.scale = "s";
    chip.innerText = key;
    chip.addEventListener("click", (event) =>
      handleMultipleChipSelection(event, value)
    );
    programTypeNode.appendChild(chip);
  }

  function handleMultipleChipSelection(event, value) {
    let items = appState.activeProgramTypes;
    if (!items.includes(value)) {
      items.push(value);
      event.target.color = "blue";
    } else {
      items = items.filter((item) => item !== value);
      event.target.color = "grey";
    }
    appState.activeProgramTypes = items;
    appState.hasFilterChanges = true;
    queryItems();
  }

  // handle theme swap
  themeNode.addEventListener("click", () => handleThemeChange());

  function handleThemeChange() {
    appState.activeItem = true;
    appState.theme = appState.theme === "dark" ? "light" : "dark";
    darkThemeCss.disabled = !darkThemeCss.disabled;
    if (appState.theme === "dark") {
      map.basemap = "dark-gray-vector";
      document.body.className = "calcite-theme-dark";
      themeNode.icon = "moon";
    } else {
      map.basemap = "gray-vector";
      document.body.className = "";
      themeNode.icon = "brightness";
    }
    setTimeout(() => {
      appState.activeItem = false;
    }, 1000);
  }

  // Pagination
  paginationNode.num = appConfig.pageNum;
  paginationNode.start = 1;
  paginationNode.addEventListener("calcitePaginationChange", (event) => {
    queryItems(event.detail.start - 1);
  });

  // Reset button
  resetNode.addEventListener("click", () => resetFilters());

  // View extent changes
  view.watch("center", () => !appState.activeItem && queryItems());

  queryItems();
}

init();
