const $ = mdui.$;
const selects = [
  new mdui.Select(".config-pictype"),
  new mdui.Select(".config-picencode"),
  new mdui.Select(".config-textencode"),
];

utools.onPluginReady(() => {
  initConfig();
  addLisenter();
  InitListenMode();
  InitFeatures();
});

function initConfig() {
  initlizeConfig();
  let config = readConfig();
  $(".config-path").val(config["config-path"].value);
  $(".config-filename").val(config["config-filename"].value);
  $(".config-filename-preview").html(
    new Date("2022-01-01").format(config["config-filename"].value)
  );
  $(".config-silence")[0].checked = config["config-silence"].value;
  $(".silence-state").html(config["config-silence"].value);
  $(".config-autosave")[0].checked = config["config-autosave"].value;
  $(".autosave-state").html(config["config-autosave"].value);
  $(".config-listenmode")[0].checked = config["config-listenmode"].value;
  $(".listenmode-state").html(config["config-listenmode"].value);
  $(".config-listenimg")[0].checked = config["config-listenimg"].value;
  $(".config-listentext")[0].checked = config["config-listentext"].value;
  $(".config-pictype").val(config["config-pictype"].value);
  $(".config-picencode").val(config["config-picencode"].value);
  $(".config-textencode").val(config["config-textencode"].value);
  $(".config-directpaste")[0].checked = config["config-directpaste"].value;
  $(".directpaste-state").html(config["config-directpaste"].value);
  $(".config-collectfiles")[0].checked = config["config-collectfiles"].value;
  $(".collectfiles-state").html(config["config-collectfiles"].value);
  selects.forEach((select) => {
    select.handleUpdate();
  });
}

function addLisenter() {
  let defaultConfig = getDefaultConfig();
  Object.getOwnPropertyNames(defaultConfig).forEach((id) => {
    $(`.${id}`).on("change", (e) => {
      tableUpdateCallBack(e);
    });
  });
  $(".restore").on("click", (e) => {
    mdui.dialog({
      title: "即将重置设置",
      content: "按下确认，设置将恢复为初始状态。",
      buttons: [
        {
          text: "取消",
        },
        {
          text: "确认",
          onClick: function (inst) {
            updateConfig(getDefaultConfig());
            initConfig();
            // FIXME: if listenmode || collectfiles || directpaste is off before restore,
            //       have to restart plugin to enable them.
            mdui.alert("设置已恢复初始值。");
          },
        },
      ],
    });
  });
  $(".source-code").on("click", (e) => {
    utools.shellOpenExternal("https://github.com/ZiuChen/FileSaver-uTools");
  });
  $(".usage-document").on("click", (e) => {
    utools.shellOpenExternal("https://github.com/ZiuChen/FileSaver-uTools");
  });
  $(".config-path-open-trigger").on("click", (e) => {
    filePathOpenCallBack(e);
  });
  $(".config-path-change-trigger").on("click", (e) => {
    filePathChangeCallBack(e);
  });
  $(".config-filename").on("input propertychange", (e) => {
    let rtn = checkIllegalCharacter(e.target.value);
    if (rtn !== -1) {
      $(".config-filename-preview").html(
        `有非法字符【${e.target.value[rtn]}】`
      );
      return;
    } else {
      $(".config-filename-preview").html(
        new Date("2022-01-01").format(e.target.value)
      );
    }
  });
}

function tableUpdateCallBack(event) {
  let config = readConfig();
  if (event.target.className.indexOf("config-path") !== -1) {
    config["config-path"].value = event.target.value;
  } else if (event.target.className.indexOf("config-filename") !== -1) {
    if (checkIllegalCharacter(event.target.value) !== -1) return;
    config["config-filename"].value = event.target.value;
  } else if (event.target.className.indexOf("config-pictype") !== -1) {
    config["config-pictype"].value = event.target.value;
  } else if (event.target.className.indexOf("config-picencode") !== -1) {
    config["config-picencode"].value = event.target.value;
  } else if (event.target.className.indexOf("config-textencode") !== -1) {
    config["config-textencode"].value = event.target.value;
  } else if (event.target.className.indexOf("config-silence") !== -1) {
    config["config-silence"].value = event.target.checked;
    $(".silence-state").html(event.target.checked);
  } else if (event.target.className.indexOf("config-autosave") !== -1) {
    config["config-autosave"].value = event.target.checked;
    $(".autosave-state").html(event.target.checked);
  } else if (event.target.className.indexOf("config-collectfiles") !== -1) {
    toggleFeatures("collectfiles", event.target.checked);
    config["config-collectfiles"].value = event.target.checked;
    $(".collectfiles-state").html(event.target.checked);
  } else if (event.target.className.indexOf("config-directpaste") !== -1) {
    toggleFeatures("directpaste", event.target.checked);
    config["config-directpaste"].value = event.target.checked;
    $(".directpaste-state").html(event.target.checked);
  } else if (event.target.className.indexOf("config-listenmode") !== -1) {
    toggleListenModeState(event.target.checked, false, true);
    config["config-listenmode"].value = event.target.checked;
    $(".listenmode-state").html(event.target.checked);
  } else if (event.target.className.indexOf("config-listenimg") !== -1) {
    config["config-listenimg"].value = event.target.checked;
  } else if (event.target.className.indexOf("config-listentext") !== -1) {
    config["config-listentext"].value = event.target.checked;
  }
  updateConfig(config);
}

function filePathOpenCallBack(event) {
  let config = readConfig();
  utools.hideMainWindow();
  utools.shellOpenPath(config["config-path"].value);
}

function filePathChangeCallBack(event) {
  utools.hideMainWindow();
  let newPath = utools.showOpenDialog({
    title: "设置文件保存位置",
    defaultPath: utools.getPath("downloads"),
    buttonLabel: "选择",
    properties: ["openDirectory", "createDirectory", "promptToCreate"],
  });
  if (newPath === null) return;
  else {
    $(".config-path").val(newPath[0]);
    $(".config-path").trigger("change");
  }
}
