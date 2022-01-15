const fs = require("fs");

window.exports = {
  保存为文件: {
    mode: "none",
    args: {
      enter: (action) => {
        window.utools.hideMainWindow();
        const configPath = utools.dbStorage.getItem("config-path");
        const configSilence = utools.dbStorage.getItem("config-silence");
        let folderPath =
          configPath === null ? utools.getPath("downloads") : configPath; // conditional operator
        let fileType
        let fileName
        let fullPath
        let writeInData
        if(action.type === "img") {
          fileType = action.payload.split("image/")[1].split(";base64,")[0]; // get the picture type
          fileName = `uTools_${new Date().valueOf()}.${fileType}`;
          fullPath = `${folderPath}\\${fileName}`;
          let base64Data = action.payload.replace(/^data:image\/\w+;base64,/, ""); // remove the prefix
          writeInData = Buffer.from(base64Data, "base64"); // to Buffer
        } else if (action.type === "over") {
          fileType = "txt"
          fileName = `uTools_${new Date().valueOf()}.${fileType}`;
          fullPath = `${folderPath}\\${fileName}`;
          writeInData = action.payload
        }
        fs.writeFile(fullPath, writeInData, (err) => {
          if (err !== null) {
            utools.showNotification(err);
          } else {
            // no error reported
            if (configSilence === null) {
              // first time enter
              utools.dbStorage.setItem("config-silence", "false");
            } else if (configSilence === "true") {
              return;
            } else {
              utools.shellShowItemInFolder(fullPath);
            }
          }
        });
        window.utools.outPlugin();
      },
    },
  },
  修改设置: {
    mode: "list",
    args: {
      enter: (action, callbackSetList) => {
        callbackSetList([
          {
            title: "设置路径",
            description: "修改文件默认保存的位置",
            icon: "./src/icon/folder.png",
            type: "config-path",
          },
          {
            title: "静默保存",
            description: "保存时不弹出新窗口",
            icon: "./src/icon/file.png",
            type: "config-silence",
          },
        ]);
      },
      select: (action, itemData, callbackSetList) => {
        const configPath = utools.dbStorage.getItem("config-path");
        const configSilence = utools.dbStorage.getItem("config-silence");
        let type = itemData.type;
        if (type === "config-path") {
          window.utools.hideMainWindow();
          let newPath = utools.showOpenDialog({
            title: "设置文件保存位置",
            defaultPath: utools.getPath("downloads"),
            buttonLabel: "选择",
            properties: ["openDirectory", "createDirectory", "promptToCreate"],
          });
          if (newPath === null) return;
          else {
            utools.dbStorage.setItem("config-path", newPath);
            utools.showNotification(`已修改文件保存位置：${newPath}`);
          }
        } else if (type === "config-silence") {
          if (configSilence === null || configSilence === "false") {
            utools.dbStorage.setItem("config-silence", "true");
            utools.showNotification("静默模式开启");
          } else {
            utools.dbStorage.setItem("config-silence", "false");
            utools.showNotification("静默模式关闭");
          }
        }
        window.utools.outPlugin();
      },
    },
  },
};
