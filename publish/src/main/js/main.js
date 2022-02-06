const $ = mdui.$;

utools.onPluginReady(() => {
  console.log("插件装配完成，已准备好");
  initConfig();
  addLisenter();
});

function initConfig() {
  if (readConfig() === null) {
    updateConfig(true);
  }
  let config = readConfig();
  $(".config-path").val(config["config-path"].value);
  $(".config-filename").val(config["config-filename"].value);
  $(".config-filename-preview").html(
    new Date("2022-01-01").format(config["config-filename"].value)
  );
  $(".config-silence")[0].checked = config["config-silence"].value;
  $(".config-pictype").val(config["config-pictype"].value);
  console.log($(".config-pictype"));
  new mdui.Select(".config-pictype")
  .handleUpdate();
}

function addLisenter() {
  let defaultConfig = getDefaultConfig();
  $(".source-code").on("click", (e) => {
    utools.shellOpenExternal("https://github.com/ZiuChen/FileSaver-uTools");
  });
  Object.getOwnPropertyNames(defaultConfig).forEach((id) => {
    $(`.${id}`).on("change", (e) => {
      tableUpdateCallBack(e);
    });
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
  } else if (event.target.className.indexOf("config-silence") !== -1) {
    config["config-silence"].value = event.target.checked;
  }
  updateConfig(false, config);
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
