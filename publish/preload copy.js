const fs = require("fs");
const { clipboard } = require("electron");
const request = require('request');
const defaultConfig = {
  "config-path": {
    id: "config-path",
    value: utools.getPath("downloads"),
  },
  "config-filename": {
    id: "config-filename",
    value: "uTools_YYYY-MM-DD_HH-mm-SS",
  },
  "config-pictype": {
    id: "config-pictype",
    value: "origin",
  },
  "config-silence": {
    id: "config-silence",
    value: true,
  },
  "config-autosave": {
    id: "config-autosave",
    value: true,
  },
  "config-codingformat": {
    id: "config-codingformat",
    value: "BASE64", // 可选：直接用BASE64还是fetch链接
  },
};

utools.onPluginEnter(({ code, type, payload }) => {
  // utools.hideMainWindow();
  console.log(code);
  if (code === "直接粘贴") {
    utools.readCurrentFolderPath().then((res) => {
      console.log(res);
      // let url = "https://www.baidu.com/img/PC_880906d2a4ad95f5fafb2e540c5cdad7.png"
      // request(url).pipe(fs.createWriteStream("D:\\Downloads\\sample.gif"))
    });
  } else if (code === "自动保存") {
    if (type === "img") {
      savePicAsFile(type, payload, getFilePath());
    } else if (type === "over") {
      saveTextAsFile(type, payload, getFilePath());
    }
  }
});

function saveTextAsFile(type, payload, currentPath) {
  let config = readConfig();
  let path = `${currentPath}\\${getFileName()}.${getSuffix(type, payload)}`;
  let img = DOMParse(clipboard.readHTML());
  fs.writeFile(path, img, (err) => {
    if (err !== null) {
      utools.showNotification(err);
      return;
    } else {
      // no error reported
      if (config["config-silence"].value === true) {
        return;
      } else {
        utools.shellShowItemInFolder(path);
      }
    }
  });
}

function savePicAsFile(type, payload, currentPath) {
  let config = readConfig();
  let Image = clipboard.readImage().toDataURL();
  let base64Data = Image.replace(/^data:image\/\w+;base64,/, ""); // remove the prefix
  let buffer = Buffer.from(base64Data, "base64"); // to Buffer
  let path = `${currentPath}\\${getFileName()}.${getSuffix(type, payload)}`;
  fs.writeFile(path, img.toBitmap(), (err) => {
    if (err !== null) {
      utools.showNotification(err);
      return;
    } else {
      // no error reported
      if (config["config-silence"].value === true) {
        return;
      } else {
        utools.shellShowItemInFolder(path);
      }
    }
  });
}

function getSuffix(type, payload) {
  let config = readConfig();
  if (type === "img") {
    if (config["config-pictype"].value === "origin") {
      return payload.split("image/")[1].split(";base64,")[0];
    } else {
      return config["config-pictype"].value;
    }
  } else if (type === "over") {
    return "txt";
  } else if (type === "window") {
    let img = DOMParse(clipboard.readHTML());
    if (config["config-pictype"].value === "origin") {
      return img.src.split("/").pop().split(".").pop();
    } else {
      return config["config-pictype"].value;
    }
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
  return str.search('[\\\\/:*?"<>|]');
};
