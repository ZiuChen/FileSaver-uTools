const $ = mdui.$;

utools.onPluginReady(() => {
  console.log("插件装配完成，已准备好");
  initConfig();
  checkConfigTableUpdate();
});

function initConfig() {
  if (readConfig() === null) {
    updateConfig(true);
  }
  let config = readConfig();
  $(".config-path").val(config["config-path"].value);
  $(".config-filename").val(config["config-filename"].value);
  $(".config-silence")[0].checked = config["config-silence"].value;
  $(".config-pictype").val(config["config-pictype"].value);
  let inst = new mdui.Select(".config-pictype");
  inst.handleUpdate();
}

function checkConfigTableUpdate() {
  let defaultConfig = getDefaultConfig();
  Object.getOwnPropertyNames(defaultConfig).forEach((id) => {
    console.log(id);
    $(`.${id}`).on("change", (e) => {
      updateConfigCallBack(e);
    });
  });
}

function updateConfigCallBack(event) {
  let config = readConfig();
  if (event.target.className.indexOf("config-path") !== -1) {
    config["config-path"].value = event.target.value;
  } else if (event.target.className.indexOf("config-filename") !== -1) {
    config["config-filename"].value = event.target.value;
  } else if (event.target.className.indexOf("config-pictype") !== -1) {
    config["config-pictype"].value = event.target.value;
  } else if (event.target.className.indexOf("config-silence") !== -1) {
    config["config-silence"].value = event.target.checked;
  }
  updateConfig(false, config);
}
