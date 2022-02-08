const fs = require("fs");
const request = require("request");
const { clipboard } = require("electron");
const clip = clipboard;
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
  "config-textencode": {
    id: "config-textencode",
    value: "text", // html: with colorful style
  },
  "config-autosave": {
    id: "config-autosave",
    value: false,
  },
  "config-path": {
    id: "config-path",
    value: utools.getPath("downloads"),
  },
  "config-listenmode": {
    id: "config-listenmode",
    value: true,
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

function getItem() {
  let config = readConfig();
  if (!clip.readImage().isEmpty()) {
    // image
    if (config["config-picencode"].value === "base64") {
      return {
        type: "base64",
        origin: getPicSuffix(),
        content: getPicBase64(),
      };
    } else {
      return {
        type: "imgURL",
        origin: "none",
        content: getPicSrc(),
      };
    }
  } else {
    if (clip.readText() !== "") {
      // text
      // TODO: ADD Custom Matching Rules
      if (config["config-textencode"].value === "text") {
        return {
          type: "plainText",
          origin: getTextSuffix(),
          content: clip.readText(),
        };
      } else {
        return {
          type: "DOMElement",
          origin: getHTMLSuffix(),
          content: clip.readHTML(),
        };
      }
    } else {
      // files
      return {
        type: "filePath",
        origin: "none",
        content: clipboard
          .readBuffer("FileNameW")
          .toString("ucs2")
          .replace(new RegExp(String.fromCharCode(0), "g"), ""),
      };
    }
  }
}

window.InitListenMode = function () {
  let config = readConfig();
  toggleListenModeState(config["config-listenmode"].value);
  clipboardListener.on("change", () => {
    // hide plugin but dont exit
    let item = getItem();
    // TODO: Decoupling acquisition pictures and saves
    switch (item.type) {
      case "base64":
        base64ToFile(item.content, item.origin);
        break;
      case "imgURL":
        // imgURLToFile(item.content);
        break;
      case "plainText":
        // textToFile(item.content, item.origin)
        break;
      case "DOMElement":
        // DOMElementToFile(item.content, item.origin);
        break;
      case "filePath":
        // nothing to do
        break;
      default:
        break;
    }
    console.log(item);
  });
};

function base64ToFile(base64, suffix) {
  let base64Data = base64.replace(/^data:image\/\w+;base64,/, ""); // remove the prefix
  let buffer = Buffer.from(base64Data, "base64"); // to Buffer
  let path = `${utools.getPath("temp")}\\${getFileName()}.${suffix}`;
  fs.writeFile(path, buffer, (err) => {
    if (err !== null) {
      utools.showNotification(err);
      return;
    } else {
      // success
      utools.copyFile(path);
    }
  });
}

function imgURLToFile(url) {
  // TODO: pass suffix dynamically
  // TODO: add progress bar
  // TODO: processing file url
  // TODO: Throw an exception
  //       exp: visit https://raw.githubusercontent.com/ZiuChen/FileSaver-uTools/v2/image/sample.gif
  let path = `${utools.getPath("temp")}\\${getFileName()}.gif`;
  let stream = fs.createWriteStream(path);
  request(url)
    .pipe(stream)
    .on("close", (err) => {
      utools.copyFile(path);
      if (err) {
        utools.showNotification(err);
      }
    });
}

function textToFile(text, suffix) {
  let path = `${utools.getPath("temp")}\\${getFileName()}.${suffix}`;
  fs.writeFile(path, text, (err) => {
    if (err !== null) {
      utools.showNotification(err);
      return;
    } else {
      // success
      utools.copyFile(path);
    }
  });
}

function DOMElementToFile(DOMElement, suffix) {
  let buffer = Buffer.from(DOMElement, "utf8"); // to Buffer
  let path = `${utools.getPath("temp")}\\${getFileName()}.${suffix}`;
  fs.writeFile(path, buffer, (err) => {
    if (err !== null) {
      utools.showNotification(err);
      return;
    } else {
      // success
      utools.copyFile(path);
    }
  });
}

window.toggleListenModeState = function (param) {
  if (param) {
    // true
    clipboardListener.startListening();
  } else {
    // false
    clipboardListener.stopListening();
  }
};

function getHTMLSuffix() {
  return "html";
}

function getTextSuffix() {
  return "txt";
}

function getPicSuffix() {
  return getPicBase64().split("data:image/")[1].split(";base64,")[0];
}

function getPicBase64() {
  return clip.readImage().toDataURL();
}

function getPicSrc() {
  return DOMParse(clip.readHTML()).src;
}

utools.onPluginEnter(({ code, type, payload }) => {
  // utools.hideMainWindow();
});

window.getFileName = function getFileName() {
  let config = readConfig();
  let rtnContent = new Date().format(config["config-filename"].value);
  return rtnContent;
};

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
  removedConfigs.forEach((item) => {
    delete config[item];
  });
  newConfigs.forEach((item) => {
    config[item] = defaultConfig[item];
  });
  updateConfig(config);
};
