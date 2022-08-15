const fs = require('fs')
const request = require('request')
const { clipboard } = require('electron')
const clip = clipboard
const clipboardListener = require('clipboard-event')
const features = {
  collectfiles: {
    code: '收集文件',
    explain: '保存到指定路径',
    cmds: [
      {
        type: 'img',
        label: '收集文件'
      },
      {
        type: 'over',
        label: '收集文件'
      },
      {
        type: 'files',
        label: '收集文件',
        fileType: 'file',
        minLength: 1
      }
    ]
  },
  directpaste: {
    code: '直接粘贴',
    explain: '粘贴到当前文件夹',
    cmds: [
      {
        type: 'window',
        label: '直接粘贴',
        match: {
          app: ['Finder.app', 'explorer.exe', 'SearchApp.exe'],
          class: ['CabinetWClass', 'ExploreWClass']
        }
      }
    ]
  }
}
const defaultConfig = {
  'config-filename': {
    id: 'config-filename',
    value: 'uTools_YYYY-MM-DD_HH-mm-SS'
  },
  'config-silence': {
    id: 'config-silence',
    value: false
  },
  'config-pictype': {
    id: 'config-pictype',
    value: 'origin'
  },
  'config-picencode': {
    id: 'config-picencode',
    value: 'base64' // request: send request
  },
  'config-textencode': {
    id: 'config-textencode',
    value: 'text' // html: with colorful style
  },
  'config-listenmode': {
    id: 'config-listenmode',
    value: true
  },
  'config-listenimg': {
    id: 'config-listenimg',
    value: true
  },
  'config-listentext': {
    id: 'config-listentext',
    value: false
  },
  'config-autosave': {
    id: 'config-autosave',
    value: false
  },
  'config-path': {
    id: 'config-path',
    value: utools.getPath('downloads')
  },
  'config-collectfiles': {
    id: 'config-collectfiles',
    value: false
  },
  'config-directpaste': {
    id: 'config-directpaste',
    value: false
  },
  'config-rules': {
    id: 'config-rules',
    value: [
      {
        suffix: 'cs',
        rule: 'using .*;$'
      },
      {
        suffix: 'java',
        rule: '^package.*;$'
      },
      {
        suffix: 'cpp',
        rule: '^#include.*'
      }
    ]
  }
}

utools.onPluginEnter(({ code, type, payload }) => {
  console.log(code, type, payload)
  initDarkMode()
  if (code === '监听模式') {
    let config = readConfig()
    if (config['config-listenmode'].value === true) {
      toggleListenModeState(false, false, false)
      config['config-listenmode'].value = false
    } else {
      toggleListenModeState(true, false, false)
      config['config-listenmode'].value = true
    }
    updateConfig(config)
    utools.hideMainWindow()
  } else if (code === '超级粘贴设置') {
    // Nothing to do
  } else if (code === '收集文件') {
    let config = readConfig()
    // as long as not file object, not listen mode
    if (type === 'over') {
      let content = payload
      if (config['config-textencode'].value === 'html') {
        let DOMBuffer = Buffer.from(clip.readHTML(), 'utf8') // to Buffer
        content = DOMBuffer
      }
      let path = `${config['config-path'].value}\\${getFileName()}.${getTextSuffix(payload)}`
      fs.writeFile(path, content, (err) => {
        if (err !== null) {
          utools.showNotification(err)
          return
        } else {
          // success
          if (config['config-silence'].value === true) {
            return
          } else {
            utools.shellShowItemInFolder(path)
          }
          return path
        }
      })
    } else if (type === 'img') {
      let base64Data = payload.replace(/^data:image\/\w+;base64,/, '') // remove the prefix
      let buffer = Buffer.from(base64Data, 'base64') // to Buffer
      let suffix = getPicType() !== 'origin' ? getPicType() : getPicSuffix(payload)
      let path = `${config['config-path'].value}\\${getFileName()}.${suffix}`
      fs.writeFile(path, buffer, (err) => {
        if (err !== null) {
          utools.showNotification(err)
          return
        } else {
          // success
          if (config['config-silence'].value === true) {
            return
          } else {
            utools.shellShowItemInFolder(path)
          }
        }
      })
    } else if (type === 'files') {
      payload.forEach((item) => {
        let suffix = item.name.split('.').pop()
        copyFile(item.path, `${config['config-path'].value}\\${getFileName()}.${suffix}`)
      })
    }
  } else if (code === '直接粘贴') {
    // comming soon
  }
})

function getItem() {
  let config = readConfig()
  if (!clip.readImage().isEmpty()) {
    // image
    if (clip.readHTML() === '') {
      // not fit to src
      return {
        type: 'base64',
        origin: getPicSuffix(),
        content: getPicBase64()
      }
    } else {
      // have src
      if (config['config-picencode'].value === 'request') {
        if (getPicSrc().indexOf('base64') !== -1) {
          // src content is base64
          return {
            type: 'base64',
            origin: getPicSuffix(getPicSrc()),
            content: getPicSrc()
          }
        }
        return {
          type: 'imgURL',
          origin: 'none',
          content: getPicSrc()
        }
      } else {
        // still use base64
        return {
          type: 'base64',
          origin: getPicSuffix(),
          content: getPicBase64()
        }
      }
    }
  } else {
    if (clip.readText() !== '') {
      // text
      // TODO: ADD Custom Matching Rules
      if (config['config-textencode'].value === 'text') {
        return {
          type: 'plainText',
          origin: getTextSuffix(clip.readText()),
          content: clip.readText()
        }
      } else {
        return {
          type: 'DOMElement',
          origin: getTextSuffix(clip.readHTML()),
          content: clip.readHTML()
        }
      }
    } else {
      // files
      return {
        type: 'filePath',
        origin: 'none',
        content: clipboard
          .readBuffer('FileNameW')
          .toString('ucs2')
          .replace(new RegExp(String.fromCharCode(0), 'g'), '')
      }
    }
  }
}

window.InitFeatures = function () {
  let config = readConfig()
  toggleFeatures('collectfiles', config['config-collectfiles'].value)
  toggleFeatures('directpaste', config['config-directpaste'].value)
}

window.toggleFeatures = function (feature, param) {
  if (param) {
    // true
    utools.setFeature(features[feature])
  } else {
    utools.removeFeature(features[feature].code)
  }
}

window.InitListenMode = function () {
  let config = readConfig()
  if (config['config-listenmode'].value === true) {
    toggleListenModeState(true, true)
  }
  clipboardListener.on('change', () => {
    clipboardListenerCallBack()
  })
}

function clipboardListenerCallBack() {
  // hide plugin but dont exit
  let item = getItem()
  console.log(item)
  item2Object(item)
}

function item2Object(item) {
  let config = readConfig()
  let img = config['config-listenimg'].value
  let text = config['config-listentext'].value
  switch (item.type) {
    case 'base64':
      if (!img) return
      let base64Data = item.content.replace(/^data:image\/\w+;base64,/, '') // remove the prefix
      let ImgBuffer = Buffer.from(base64Data, 'base64') // to Buffer
      saveFileAsTemp(ImgBuffer, item.origin, 'copy')
      break
    case 'imgURL':
      if (!img) return
      requestFileAsTemp(item.content, item.origin)
      break
    case 'plainText':
      if (!text) return
      saveFileAsTemp(item.content, item.origin, 'copy')
      break
    case 'DOMElement':
      if (!text) return
      let DOMBuffer = Buffer.from(item.content, 'utf8') // to Buffer
      saveFileAsTemp(DOMBuffer, item.origin, 'copy')
      break
    case 'filePath':
      // nothing to do
      break
    default:
      break
  }
}

function requestFileAsTemp(url, suffix) {
  // TODO: add progress bar
  // TODO: processing file url
  let req = request
    .get({ url: url, rejectUnauthorized: false })
    .on('response', (response) => {
      suffix = response.headers['content-type']
      suffix = suffix.substring(suffix.lastIndexOf('/') + 1)
      if (getPicType() !== 'origin') {
        suffix = getPicType()
      }
      let path = `${utools.getPath('temp')}\\${getFileName()}.${suffix}`
      req.pipe(fs.createWriteStream(path))
      req.on('close', (err) => {
        utools.copyFile(path)
        let config = readConfig()
        if (config['config-autosave'].value === true) {
          copyFile(path, `${config['config-path'].value}\\${getFileName()}.${suffix}`)
        }
        if (err) {
          utools.showNotification(err)
          return
        }
        return path
      })
    })
    .on('error', (err) => {
      utools.showNotification(err)
    })
}

function saveFileAsTemp(content, suffix, callBack) {
  if (suffix === 'none' || getPicType() !== 'origin') {
    suffix = getPicType()
  }
  let path = `${utools.getPath('temp')}\\${getFileName()}.${suffix}`
  // TODO: integrate all files into one folder
  // TODO: onPluginEnter clear Temp folder
  fs.writeFile(path, content, (err) => {
    if (err !== null) {
      utools.showNotification(err)
      return
    } else {
      // success
      switch (callBack) {
        case 'copy':
          utools.copyFile(path)
          let config = readConfig()
          if (config['config-silence'].value === false) {
            utools.showNotification('已复制到剪切板')
          }
          break
      }
      let config = readConfig()
      if (config['config-autosave'].value === true) {
        copyFile(path, `${config['config-path'].value}\\${getFileName()}.${suffix}`)
      }
      return path
    }
  })
}

function copyFile(src, target) {
  let config = readConfig()
  fs.copyFile(src, target, (err) => {
    if (err) {
      utools.showNotification(err)
    }
    if (config['config-silence'].value === true) {
      return
    } else {
      utools.shellShowItemInFolder(target)
    }
  })
}

window.toggleListenModeState = function (param, blockNotice, fromConfig) {
  if (param) {
    // true
    clipboardListener.startListening()
    if (!blockNotice) {
      if (fromConfig) {
        utools.showNotification('监听模式已开启，请不要退出插件，或按ESC将插件隐藏到后台。')
      } else {
        utools.showNotification('监听模式已开启，插件已隐藏至后台运行。')
      }
    }
  } else {
    // false
    clipboardListener.stopListening()
    if (!blockNotice) {
      utools.showNotification('监听模式已关闭。')
    }
  }
}

function getTextSuffix(text) {
  let config = readConfig()
  if (config['config-textencode'].value === 'html') {
    return 'html'
  } else {
    let suffix = matchRules(text)
    if (suffix !== '') return suffix
    else return 'txt'
  }
}

function matchRules(text) {
  let config = readConfig()
  let rules = config['config-rules'].value
  let rtnSuffix = ''
  rules.forEach((item) => {
    if (text.search(item.rule) !== -1) {
      rtnSuffix = item.suffix
    }
  })
  return rtnSuffix
}

function getPicSuffix(base64) {
  if (base64 !== undefined) {
    return base64.split('data:image/')[1].split(';base64,')[0]
  } else {
    return getPicBase64().split('data:image/')[1].split(';base64,')[0]
  }
}

function getPicBase64() {
  return clip.readImage().toDataURL()
}

function getPicSrc() {
  return DOMParse(clip.readHTML()).src
}

window.getFileName = function getFileName() {
  let config = readConfig()
  let rtnContent = new Date().format(config['config-filename'].value)
  return rtnContent
}

function getPicType() {
  let config = readConfig()
  return config['config-pictype'].value
}

function DOMParse(string) {
  let div = document.createElement('div')
  div.innerHTML = string
  return div.firstChild
}

function DOMParse(string) {
  let div = document.createElement('div')
  div.innerHTML = string
  return div.firstChild
}

Date.prototype.format = function (fmt) {
  let ret
  const opt = {
    'Y+': this.getFullYear().toString(),
    'M+': (this.getMonth() + 1).toString(),
    'D+': this.getDate().toString(),
    'H+': this.getHours().toString(),
    'm+': this.getMinutes().toString(),
    'S+': this.getSeconds().toString()
  }
  for (let k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'))
    }
  }
  return fmt
}

function initDarkMode() {
  if (utools.isDarkColors()) {
    document.body.classList.add('mdui-theme-layout-dark')
  } else {
    document.body.classList.remove('mdui-theme-layout-dark')
  }
}

window.updateConfig = function updateConfig(config) {
  utools.dbStorage.setItem('config', JSON.stringify(config))
  mdui.snackbar({
    message: '设置已更新',
    position: 'right-bottom'
  })
}

window.readConfig = function () {
  let data = utools.dbStorage.getItem('config')
  return JSON.parse(data)
}

window.getDefaultConfig = function () {
  return defaultConfig
}

window.fileNamePreview = function (originContent) {
  customFileNameConfigs.forEach((config) => {
    let times = originContent.split(config).length - 1 // more than one replacement character
    for (let i = 0; i < times; i++) {
      originContent = originContent.replace(config, replacement(config))
    }
  })
  return originContent
}

window.checkIllegalCharacter = function (str) {
  return str.search('[\\\\/:*?"<>|]')
}

window.initlizeConfig = function initlizeConfig() {
  if (readConfig() === null) {
    utools.dbStorage.setItem('config', JSON.stringify(defaultConfig))
    return
  }
  let config = readConfig()
  let configs = Object.getOwnPropertyNames(config)
  let defaultConfigs = Object.getOwnPropertyNames(defaultConfig)
  let removedConfigs = configs.filter((item) => {
    return defaultConfigs.indexOf(item) === -1
  })
  let newConfigs = defaultConfigs.filter((item) => {
    return configs.indexOf(item) === -1
  })
  if (newConfigs.length === 0 && removedConfigs.length === 0) return
  removedConfigs.forEach((item) => {
    delete config[item]
  })
  newConfigs.forEach((item) => {
    config[item] = defaultConfig[item]
  })
  updateConfig(config)
}
