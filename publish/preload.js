const fs = require("fs");
const defaultConfig = {
    "config-path": {
        id: "config-path",
        value: utools.getPath("downloads")
    },
    "config-filename": {
        id: "config-filename",
        value: "uTools_" + "{ms_time_stamp}"
    },
    "config-silence": {
        id: "config-silence",
        value: {"paddingVertical":"0px","paddingHorizontal":"0px","backgroundImage":null,"backgroundImageSelection":null,"backgroundMode":"color","backgroundColor":"rgba(171, 184, 195, 1)","dropShadow":true,"dropShadowOffsetY":"50px","dropShadowBlurRadius":"68px","theme":"vscode","windowTheme":"sharp","language":"javascript","fontFamily":"IBM Plex Mono","fontSize":"18px","lineHeight":"142%","windowControls":true,"widthAdjustment":true,"lineNumbers":true,"firstLineNumber":1,"exportSize":"2x","watermark":false,"squaredImage":false,"hiddenCharacters":false,"name":"","width":680}
    }
};

window.exports = {
    保存为文件: {
        mode: "none",
        args: {
            enter: (action) => {
                window.utools.hideMainWindow()
                if (utools.dbStorage.getItem("config") === null) { // init config
                    utools.dbStorage.setItem("config", JSON.stringify(defaultConfig))
                }
                const config = JSON.parse(utools.dbStorage.getItem("config"))
                let filePath = config["config-path"].value
                let fileName = getFileName(config["config-filename"].value) // read replacement character
                let fullPath
                let writeInData
                if (action.type === "img") {
                    let fileType = action.payload.split("image/")[1].split(";base64,")[0] // get the picture type
                    // fullPath = `${filePath}\\${fileName}.${fileType}`
                    fullPath = `${filePath}\\${fileName}.gif`
                    let base64Data = action.payload.replace(
                        /^data:image\/\w+;base64,/,
                        ""
                    ) // remove the prefix
                    writeInData = Buffer.from(base64Data, "base64") // to Buffer
                } else if (action.type === "over") {
                    let fileType = "txt"
                    fullPath = `${filePath}\\${fileName}.${fileType}`
                    writeInData = action.payload
                }
                fs.writeFile(fullPath, writeInData, (err) => {
                    if (err !== null) {
                        utools.showNotification(err)
                        return
                    } else {
                        // no error reported
                        if (config["config-silence"].value === true) {
                            return
                        } else {
                            utools.shellShowItemInFolder(fullPath)
                        }
                    }
                })
                window.utools.outPlugin()
                function getFileName(configFilename) {
                    const customConfigs = ["{Y}", "{M}", "{D}", "{h}", "{m}", "{s}", "{ms_time_stamp}", "{s_time_stamp}"]
                    customConfigs.forEach(config => {
                        let times = configFilename.split(config).length - 1 // more than one replacement character
                        for (let i = 0; i < times; i++) {
                            configFilename = configFilename.replace(config, replacement(config))
                        }
                    })
                    return configFilename
                }
                function replacement(config) {
                    let date = new Date()
                    switch (config) {
                        case "{Y}": return date.getFullYear()
                        case "{M}": return date.getMonth() + 1
                        case "{D}": return date.getDay()
                        case "{h}": return date.getHours()
                        case "{m}": return date.getMinutes()
                        case "{s}": return date.getSeconds()
                        case "{ms_time_stamp}": return date.getTime()
                        case "{s_time_stamp}": return parseInt(date.getTime() / 1000)
                    }
                }
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
                        description: "修改默认保存位置",
                        icon: "./src/icon/path.png",
                        type: "config-path",
                    },
                    {
                        title: "设置文件名",
                        description: "修改保存的文件名",
                        icon: "./src/icon/filename.png",
                        type: "config-filename",
                    },
                    {
                        title: "静默保存",
                        description: "开启状态下，保存时不弹出窗口",
                        icon: "./src/icon/silence.png",
                        type: "config-silence",
                    },
                    {
                        title: "重置设置",
                        description: "恢复初始设置",
                        icon: "./src/icon/restore.png",
                        type: "config-restore",
                    },
                ])
            },
            select: (action, itemData, callbackSetList) => {
                if (utools.dbStorage.getItem("config") === null) { // init config
                    utools.dbStorage.setItem("config", JSON.stringify(defaultConfig))
                }
                let config = JSON.parse(utools.dbStorage.getItem("config"))
                let type = itemData.type
                if (type === "config-path") {
                    window.utools.hideMainWindow()
                    let newPath = utools.showOpenDialog({
                        title: "设置文件保存位置",
                        defaultPath: utools.getPath("downloads"),
                        buttonLabel: "选择",
                        properties: ["openDirectory", "createDirectory", "promptToCreate"],
                    })
                    if (newPath === null) return
                    else {
                        config["config-path"].value = newPath
                        utools.showNotification(`已修改文件保存位置：${newPath}`)
                    }
                    window.utools.outPlugin()
                } else if (type === "config-filename") {
                    utools.setSubInput((obj) => {
                        config["config-filename"].value = obj.text + "_{ms_time_stamp}"
                        utools.dbStorage.setItem("config", JSON.stringify(config))
                    }, "输入内容将实时写入设置", true)
                } else if (type === "config-silence") {
                    window.utools.hideMainWindow()
                    if (config["config-silence"].value === false) {
                        config["config-silence"].value = true
                        utools.showNotification("静默模式开启")
                    } else {
                        config["config-silence"].value = false
                        utools.showNotification("静默模式关闭")
                    }
                    window.utools.outPlugin()
                } else if (type === "config-restore") {
                    window.utools.hideMainWindow()
                    utools.dbStorage.setItem("config", JSON.stringify(defaultConfig))
                    utools.showNotification("已恢复初始设置")
                    window.utools.outPlugin()
                }
                utools.dbStorage.setItem("config", JSON.stringify(config))
            },
        },
    },
};
