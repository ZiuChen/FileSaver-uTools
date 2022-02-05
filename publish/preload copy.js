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
    "config-pictype": {
        id: "config-pictype",
        value: "origin"
    },
    "config-silence": {
        id: "config-silence",
        value: false
    }
};

window.exports = {
    保存为文件: {
        mode: "none",
        args: {
            enter: (action) => {
                window.utools.hideMainWindow()
                Object.getOwnPropertyNames(defaultConfig).forEach((config) => {
                    if (utools.dbStorage.getItem(config) === null) {
                        utools.dbStorage.setItem(config, defaultConfig[config].value);
                    }
                });
                let filePath = utools.dbStorage.getItem("config-path")
                let fileName = getFileName(utools.dbStorage.getItem("config-filename")) // read replacement character
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
                        if (utools.dbStorage.getItem("config-silence") === true) {
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
                        title: "设置保存图片格式",
                        description: "修改保存的图片格式",
                        icon: "./src/icon/pictype.png",
                        type: "config-pictype",
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
                Object.getOwnPropertyNames(defaultConfig).forEach((config) => {
                    if (utools.dbStorage.getItem(config) === null) {
                        utools.dbStorage.setItem(config, defaultConfig[config].value);
                    }
                });
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
                        utools.dbStorage.setItem("config-path", newPath)
                        utools.showNotification(`已修改文件保存位置：${newPath}`)
                    }
                    window.utools.outPlugin()
                } else if (type === "config-filename") {
                    utools.setSubInput((obj) => {
                        utools.dbStorage.setItem("config-filename", obj.text + "_{ms_time_stamp}")
                    }, "输入内容将实时写入设置", true)
                } else if (type === "config-pictype") {
                    callbackSetList(getFileTypeArray())``
                    
                    function getFileTypeArray() {
                        let picTypes = ["png", "jpg", "webp", "gif"]
                        let rtnArray = []
                        picTypes.forEach(item => {
                            let typeObject = {
                                title: item,
                                description: `保存为 .${ item } 格式`,
                                icon: "./src/icon/pictype.png",
                                type: `config-pictype-${ item }`
                            }
                            rtnArray.push(typeObject)
                        })
                        return rtnArray
                    }
                } else if (type === "config-restore") {
                    window.utools.hideMainWindow()
                    utools.dbStorage.setItem("config", JSON.stringify(defaultConfig))
                    utools.showNotification("已恢复初始设置")
                    window.utools.outPlugin()
                }
                
            },
        },
    },
};
