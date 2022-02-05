const $ = mdui.$;

utools.onPluginReady(() => {
  console.log("插件装配完成，已准备好");
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
});

function updateTable() {}
