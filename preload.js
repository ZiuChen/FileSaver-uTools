const fs = require("fs");
const path = require("path");

window.exports = {
  保存为文件: {
    mode: "none",
    args: {
      enter: (action) => {
        window.utools.hideMainWindow();
        let folderPath =
          utools.dbStorage.getItem("path") === null
            ? utools.getPath("downloads")
            : utools.dbStorage.getItem("path");
        let fileName = `uTools_${new Date().valueOf()}.${
          action.payload.split("image/")[1].split(";base64,")[0]
        }`;
        let fullPath = `${folderPath}\\${fileName}`;
        let base64Data = action.payload.replace(/^data:image\/\w+;base64,/, "");
        let dataBuffer = Buffer.from(base64Data, "base64");
        fs.writeFile(
          fullPath,
          dataBuffer,
          (err) => {
            if (err === null) {
              utools.shellShowItemInFolder(fullPath);
              utools.showNotification(fileName);
            } else utools.showNotification(err);
          }
        );
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
            description: "修改文件默认保存的位置，默认为下载路径",
            icon: "./src/icon/folder.png", // 图标
            type: "path",
          },
          {
            title: "设置文件名",
            description: "修改文件保存时的文件名，默认为uTools与时间戳组合",
            icon: "./src/icon/file.png", // 图标
            type: "filename",
          },
        ]);
      },
      select: (action, itemData, callbackSetList) => {
        let type = itemData.type;
        if (type === "path") {
          window.utools.hideMainWindow();
          let newPath = utools.showOpenDialog({
            title: "设置文件保存位置",
            defaultPath: utools.getPath("downloads"),
            buttonLabel: "选择",
            properties: ["openDirectory", "createDirectory", "promptToCreate"],
          });
          if (newPath === null) return;
          else {
            utools.dbStorage.setItem("path", newPath);
            utools.showNotification(`已修改文件保存位置：${newPath}`);
          }
        } else if (type === "filename") {
        }
        window.utools.outPlugin();
      },
      // 子输入框为空时的占位符，默认为字符串"搜索"
      // placeholder: "搜索",
    },
  },
};
