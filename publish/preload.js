const fs = require("fs");
const request = require("request");
const { clipboard } = require("electron");
const clipboardListener = require("clipboard-event");
const defaultConfig = {
  "config-filename": {
    id: "config-filename",
    value: "uTools_YYYY-MM-DD_HH-mm-SS",
  },
  "config-silence": {
    id: "config-silence",
    value: true,
  },
  "config-pictype": {
    id: "config-pictype",
    value: "origin",
  },
  "config-picencode": {
    id: "config-picencode",
    value: "base64", // origin: may occur network error but can keep the original size
  },
  "config-autosave": {
    id: "config-autosave",
    value: true,
  },
  "config-path": {
    id: "config-path",
    value: utools.getPath("downloads"),
  },
  "config-matchrule": {
    id: "config-matchrule",
    value: false,
  },
  "config-rules": {
    id: "config-rules",
    value: [
      {
        suffix: "cs",
        rule: "using .*;$",
      },
      {
        suffix: "java",
        rule: "^package.*;$",
      },
      {
        suffix: "html",
        rule: "(? i)&lt;!DOCTYPE html",
      },
      {
        suffix: "cpp",
        rule: "^#include.*",
      },
    ],
  },
};

console.log(clipboardListener);
clipboardListener.startListening();
clipboardListener.on("change", (event) => {
  // console.log(event);
	// let item = pbpaste();
	// if (!item) return;
});

utools.onPluginEnter(({ code, type, payload }) => {
  // utools.hideMainWindow();
  if (code === "直接粘贴") {
    utools.readCurrentFolderPath().then((res) => {
    });
  } else if (code === "自动保存") {
  }
});

window.getFileName = function getFileName() {
  let config = readConfig();
  let rtnContent = new Date().format(config["config-filename"].value);
  return rtnContent;
};

function getFilePath() {
  let config = readConfig();
  return config["config-path"].value;
}

function DOMParse(string) {
  let div = document.createElement("div");
  div.innerHTML = string;
  return div.firstChild;
}

Date.prototype.format = function (fmt) {
  let ret;
  const opt = {
    "Y+": this.getFullYear().toString(),
    "M+": (this.getMonth() + 1).toString(),
    "D+": this.getDate().toString(),
    "H+": this.getHours().toString(),
    "m+": this.getMinutes().toString(),
    "S+": this.getSeconds().toString(),
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      );
    }
  }
  return fmt;
};

window.updateConfig = function updateConfig(config) {
  utools.dbStorage.setItem("config", JSON.stringify(config));
  mdui.snackbar({
    message: "设置已更新",
    position: "right-bottom",
  });
};

window.readConfig = function () {
  let data = utools.dbStorage.getItem("config");
  return JSON.parse(data);
};

window.getDefaultConfig = function () {
  return defaultConfig;
};

window.fileNamePreview = function (originContent) {
  customFileNameConfigs.forEach((config) => {
    let times = originContent.split(config).length - 1; // more than one replacement character
    for (let i = 0; i < times; i++) {
      originContent = originContent.replace(config, replacement(config));
    }
  });
  return originContent;
};

window.checkIllegalCharacter = function (str) {
  return str.search('[\\\\/:*?"<>|]');
};

window.initlizeConfig = function initlizeConfig() {
  if (readConfig() === null) {
    utools.dbStorage.setItem("config", JSON.stringify(defaultConfig));
    return;
  }
  let config = readConfig();
  let configs = Object.getOwnPropertyNames(config);
  let defaultConfigs = Object.getOwnPropertyNames(defaultConfig);
  let removedConfigs = configs.filter((item) => {
    return defaultConfigs.indexOf(item) === -1;
  });
  let newConfigs = defaultConfigs.filter((item) => {
    return configs.indexOf(item) === -1;
  });
  if (newConfigs.length === 0 && removedConfigs.length === 0) return;
  console.log(newConfigs);
  console.log(removedConfigs);
  removedConfigs.forEach((item) => {
    delete config[item];
  });
  newConfigs.forEach((item) => {
    config[item] = defaultConfig[item];
  });
  updateConfig(config);
};
