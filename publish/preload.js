const fs = require("fs");
const defaultConfig = {
  "config-path": {
    id: "config-path",
    value: utools.getPath("downloads"),
  },
  "config-filename": {
    id: "config-filename",
    value: "uTools_YYYY-mm-dd_HH:MM",
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

window.getFileName = function getFileName() {
  let config = readConfig();
  let rtnContent = new Date().format(config["config-filename"].value);
  return rtnContent;
};

function getFilePath() {
  let config = readConfig();
  return config["config-path"].value;
}

Date.prototype.format = function (fmt) {
  let ret;
  const opt = {
    "Y+": this.getFullYear().toString(),
    "m+": (this.getMonth() + 1).toString(),
    "d+": this.getDate().toString(),
    "H+": this.getHours().toString(),
    "M+": this.getMinutes().toString(),
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
    return str.search("[\\\\/:*?\"<>|]")
}