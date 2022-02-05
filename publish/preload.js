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

window.updateConfig = function (isInit, config) {
  if(isInit) {
    utools.dbStorage.setItem("config", JSON.stringify(defaultConfig));
  }
  else {
    utools.dbStorage.setItem("config", JSON.stringify(config));
  }
  mdui.snackbar({
    message: '设置已更新',
    position: 'right-bottom',
  });
};

window.readConfig = function () {
  const data = utools.dbStorage.getItem("config");
  return JSON.parse(data);
};

window.getDefaultConfig = function () {
  return defaultConfig
}