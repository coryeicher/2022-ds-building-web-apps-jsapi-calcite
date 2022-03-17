 /*
    // a janky way to replace content in a single panel vs appending entire new one each time
    if (!detailPanelNode) {
      const panel = document.createElement("calcite-panel");
      panel.heading = handleCasing(attributes["NAME"]);
      panel.summary = `${handleCasing(attributes["CITY"])}, ${
        attributes["STATE"]
      }`;
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
      blockOne.heading = "Institution overview";
      blockOne.collapsible = true;
      blockOne.open = true;

      const blockTwo = document.createElement("calcite-block");
      blockTwo.heading = "Student body";
      blockTwo.collapsible = true;
      blockTwo.open = true;

      const blockThree = document.createElement("calcite-block");
      blockThree.heading = "Housing";
      blockThree.collapsible = true;
      blockThree.open = true;

      const blockFour = document.createElement("calcite-block");
      blockFour.heading = "Contact";
      blockFour.collapsible = true;
      blockFour.open = true;

      const campusImageNode = document.createElement("div");
      campusImageNode.id = "campusImageContainer";
      campusImageNode.className = "campus-image-container";

      blockOne.appendChild(campusImageNode);

      if (attributes["WEBSITE"]) {
        const itemWebsite = document.createElement("calcite-button");
        itemWebsite.id = "detail-website-link";
        itemWebsite.iconEnd = "launch";
        itemWebsite.slot = "footer-actions";
        itemWebsite.scale = "l";
        itemWebsite.width = "full";
        itemWebsite.innerText = `Learn more`;
        itemWebsite.href = `http://${attributes["WEBSITE"]}`;
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

      if (attributes["schoolType"]) {
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Institution Type";
        const span = document.createElement("span");
        span.id = "detail-type";
        span.innerText = `${handleCasing(attributes["schoolType"])}`;
        label.append(span);
        blockOne.appendChild(label);
      }

      if (attributes["TOT_ENROLL"]) {
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Total enrollment";
        const span = document.createElement("span");
        span.id = "detail-total";
        span.innerText = `${parseInt(
          attributes["TOT_ENROLL"]
        ).toLocaleString()}`;
        label.append(span);
        blockTwo.appendChild(label);
      }

      if (attributes["FT_ENROLL"]) {
        const count =
          attributes["FT_ENROLL"] === -999 ? "0" : attributes["FT_ENROLL"];
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Full time enrollment";
        const span = document.createElement("span");
        span.id = "detail-ft";
        span.innerText = `${parseInt(count).toLocaleString()}`;
        label.append(span);
        blockTwo.appendChild(label);
      }

      if (attributes["PT_ENROLL"]) {
        const count =
          attributes["PT_ENROLL"] === -999 ? "0" : attributes["PT_ENROLL"];
        const label = document.createElement("calcite-label");
        label.layout = "inline-space-between";
        label.innerText = "Part time enrollment";
        const span = document.createElement("span");
        span.id = "detail-pt";
        span.innerText = `${parseInt(count).toLocaleString()}`;
        label.append(span);
        blockTwo.appendChild(label);
      }

      const label = document.createElement("calcite-label");
      label.layout = "inline-space-between";
      label.innerText = "Offers housing";
      const span = document.createElement("span");
      span.id = "detail-housing";
      span.innerText = `${
        parseInt(attributes["DORM_CAP"]) !== -999 ? "Yes" : "No"
      }`;
      label.append(span);
      blockThree.appendChild(label);

      const labelCapacity = document.createElement("calcite-label");
      labelCapacity.layout = "inline-space-between";
      labelCapacity.innerText = "Dormitory capacity";
      const spanCapacity = document.createElement("span");
      spanCapacity.id = "detail-housing-capac";
      spanCapacity.innerText = `${
        parseInt(attributes["DORM_CAP"]) !== -999
          ? parseInt(attributes["DORM_CAP"]).toLocaleString()
          : "N/A"
      }`;

      labelCapacity.append(spanCapacity);
      blockThree.appendChild(labelCapacity);

      const labelAddress = document.createElement("calcite-label");
      labelAddress.layout = "inline-space-between";
      labelAddress.innerText = "Street Address";
      const spanAddress = document.createElement("span");
      spanAddress.id = "detail-address";
      spanAddress.innerText = `${handleCasing(
        attributes["ADDRESS"]
      )}, ${handleCasing(attributes["CITY"])}, ${attributes["STATE"]}`;
      labelAddress.append(spanAddress);
      blockFour.appendChild(labelAddress);

      const labelWebsite = document.createElement("calcite-label");
      labelWebsite.layout = "inline-space-between";
      labelWebsite.innerText = "Website";
      const spanWebsite = document.createElement("span");
      spanWebsite.id = "detail-website";
      spanWebsite.innerText = `${attributes["WEBSITE"]}`;
      labelWebsite.append(spanWebsite);
      blockFour.appendChild(labelWebsite);

      const labelPhone = document.createElement("calcite-label");
      labelPhone.layout = "inline-space-between";
      labelPhone.innerText = "Phone Number";
      const spanPhone = document.createElement("span");
      spanPhone.id = "detail-phone";
      spanPhone.innerText = `${attributes["TELEPHONE"]}`;
      labelPhone.append(spanPhone);
      blockFour.appendChild(labelPhone);

      panel.appendChild(blockOne);
      panel.appendChild(blockTwo);
      panel.appendChild(blockThree);
      panel.appendChild(blockFour);

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
    */