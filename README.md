<div align="center" class="mdui-typo title">
  <img src="https://cdn.jsdelivr.net/gh/ZiuChen/FileSaver-uTools/publish/logo.png" alt="logo" />
  <h3>超级粘贴</h3>
  <h4><em>Super Paste</em></h4>
</div>

### :sparkles: 核心功能

* 将剪切板内容直接粘贴为文件，并自动保存到指定路径
* 支持保存图片、文本

### :gear: 可配置项

* **文件命名**：文件保存时的文件名，支持时间生成字符串。
* **静默模式**：静默模式下，监听模式通知、自动保存弹窗、文件收集功能弹窗将被隐藏不显示。
* **匹配拓展名规则** `(Comming Soon)`：根据复制内容匹配保存文件的拓展名，支持正则表达式。
* **图片格式**：保存的图片文件将转为此格式。
  * `ORIGIN`: 保持原格式，支持从网页复制的动态GIF；
  * `其他`: 转为此格式保存，不支持动态GIF；
* **文本编码方式**：
  * `TEXT`: 将文本转为**不同拓展名**的文件；
  * `HTML`: 将文本转为带样式的 `.html` 文件，未来将支持文本转图片，如代码转图片美化；
* **图片保存方式** `(Experimental)`：
  * `BASE64`: 直接使用BASE64编码，无额外网络请求，不支持动态GIF；
  * `REQUEST`: 有额外网络请求，支持从网页复制的动态GIF；
* **监听模式**：将剪切板内容实时转为文件并重新写入剪切板。
* **监听内容**：选择监听剪切板中的哪些内容，不建议全时间监听文本内容，可能影响正常输入。
* **自动保存**：在监听模式开启下，自动把复制过的内容保存到指定目录。
* **自动保存目录**：自动保存目录，默认为系统下载目录。
* **收集文件功能**：不操作剪切板，直接从uTools框匹配文本并收集到自动保存目录，支持匹配文本/图片/文件。
* **直接粘贴功能** `(Comming Soon)`：搭配全局快捷键使用，实现 `Ctrl+V` 粘贴原剪切板内容，使用其他快捷键粘贴文件。

### :hammer: 自定义文件名生成语法

注意自定义文件名中不能含有非法字符 ` \ / : * ? " < > | `。

日期格式化语法：

| 符号 | 说明 |
| ------ | ------ |
| YYYY | 年 (四位数) |
| MM | 月份 (01-12) |
| M | 月份 (1-12) |
| DD | 日期 (01-31) |
| D | 日期 (1-31) |
| HH | 时 (00-23) |
| H | 时 (0-23) |
| mm | 分 (00-59) |
| m | 分 (0-59) |
| SS | 秒 (00-59) |
| S | 秒 (0-59) |
