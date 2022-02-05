const fs = require("fs");
const defaultConfig = {
  "config-path": {
    id: "config-path",
    value: utools.getPath("downloads"),
  },
  "config-filename": {
    id: "config-filename",
    value: "uTools_" + "{ms_time_stamp}",
  },
  "config-pictype": {
    id: "config-pictype",
    value: "origin",
  },
  "config-silence": {
    id: "config-silence",
    value: false,
  },
};

const customFileNameConfigs = [
  "{Y}",
  "{M}",
  "{D}",
  "{h}",
  "{m}",
  "{s}",
  "{ms_time_stamp}",
  "{s_time_stamp}",
];

utools.onPluginEnter(({ code, type, payload }) => {
  // utools.hideMainWindow();
  console.log("用户进入插件", code, type, payload);
  if (type === "img") {
    savePicAsFile(payload);
  }
});

function savePicAsFile(payload) {
  let config = readConfig();
  let path = `${getFilePath()}\\${getFileName()}.${getSuffix(payload)}`;
  let base64Data = payload.replace(/^data:image\/\w+;base64,/, ""); // remove the prefix
  let buffer = Buffer.from(base64Data, "base64"); // to Buffer
  fs.writeFile(path, buffer, (err) => {
    if (err !== null) {
      utools.showNotification(err);
      return;
    } else {
      // no error reported
      if (config["config-silence"].value === true) {
        return;
      } else {
        utools.shellShowItemInFolder(fullPath);
      }
    }
  });
}

function getSuffix(payload) {
  let config = readConfig();
  if (config["config-pictype"].value === "origin") {
    return payload.split("image/")[1].split(";base64,")[0];
  } else {
    return config["config-pictype"].value;
  }
}

function getFilePath() {
  let config = readConfig();
  return config["config-path"].value;
}

function getFileName() {
  let config = readConfig();
  let originContent = config["config-filename"].value;
  customFileNameConfigs.forEach((config) => {
    let times = originContent.split(config).length - 1; // more than one replacement character
    for (let i = 0; i < times; i++) {
      originContent = originContent.replace(config, replacement(config));
    }
  });
  return originContent;
}

function replacement(config) {
  let date = new Date();
  switch (config) {
    case "{Y}":
      return date.getFullYear();
    case "{M}":
      return date.getMonth() + 1;
    case "{D}":
      return date.getDay();
    case "{h}":
      return date.getHours();
    case "{m}":
      return date.getMinutes();
    case "{s}":
      return date.getSeconds();
    case "{ms_time_stamp}":
      return date.getTime();
    case "{s_time_stamp}":
      return parseInt(date.getTime() / 1000);
  }
}

window.updateConfig = function (isInit, config) {
  if (isInit) {
    utools.dbStorage.setItem("config", JSON.stringify(defaultConfig));
  } else {
    utools.dbStorage.setItem("config", JSON.stringify(config));
  }
  mdui.snackbar({
    message: "设置已更新",
    position: "right-bottom",
  });
};

window.readConfig = function () {
  const data = utools.dbStorage.getItem("config");
  return JSON.parse(data);
};

window.getDefaultConfig = function () {
  return defaultConfig;
};
