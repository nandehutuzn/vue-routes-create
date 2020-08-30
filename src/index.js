const { resolve } = require('path')
const { error } = require('console')

// rc 参数通过 rc = require.context(dir, true, /\.vue$/) 方式获得
module.exports = ({ rc, rootFile }) => {
  if (!rc) {
    throw new Error('rc not null')
  }

  const routes = [] // 保存最终路由结构
  const allRouters = {}

  const routerFileAndLen = rc.keys().map(fileName => {
    // fileName 格式为 ./AA/BB/CC.vue
    // 这里移除前面的 ./ 和最后的 .vue   取 AA/BB/CC
    const realFileName = fileName.replace(/^\.\//, '').replace(/\.\w+$/, '')
    // 根据 realFileName 生成路由
    const path = `/${realFileName === 'index' ? '' : realFileName}` // 如果是根目录下的 index.vue 文件，则作为默认首页
      .replace(/[\\\/]/g, '/') // 兼容多系统路径
      .replace(/\/index$/, '') // AA/BB/CC/index  它的 path 对应为 /AA/BB/CC
      .replace(/\/_/g, '/:') // 设置动态路由 AA/BB/_CC 它的 path 对应为 /AA/BB/:CC
    // 获取路由名字 取路由最后一部分 AA/BB/CC  则 name=CC
    const name = path.substring(path.lastIndexOf('\/') + 1).replace(':', '') || 'home'
    
    return {
      fileName,
      path,
      name,
      routerComponent: resolve(rootFile, fileName),
      fileLen: path.match(/\//g).length  // 路由层级，后面用来组合父子路由要用到 /AA/BB/CC 则 fileLen 为 3
    }
  }).sort((i, j) => i.fileLen - j.fileLen) // 按路由层级排序

  let maxLen = 0
  // 生成各个路由对象
  routerFileAndLen.map(r => {
    const obj = {
      name: r.name,
      path: r.path,
      component: rc(r.fileName).default,
      children: []
    }
    maxLen = r.fileLen
    const key = `len${maxLen}`
    if(Array.isArray(allRouters[key])) {
      allRouters[key].push(obj)
    } else {
      allRouters[key] = [obj]
    }
  })

  // 这里只需将第一层的路由放进去即可，后面层级路由皆在第一层的子路由中
  routes.push(...allRouters.len1)

  // 将各个路由对象按正确父子关系组合
  // 从最深目录开始
  for(let index = maxLen; index > 1; index--) {
    const preIndex = index - 1
    allRouters[`len${index}`].forEach(item => {
      // 遍历 index 层路由，并寻找它们的负路由（根据路由前缀查找）
      let parent = allRouters[`len${preIndex}`].find(i => item.path.startsWith(i.path))
      if(parent) {
        // 在上一层目录找到父路由
        parent.children.push(item)
      } else {
        // 没有找到就加入一个空对象作为父路由，并加入上一层路由
        parent = {
          path: item.path.substring(0, item.path.lastIndexOf('\/')),
          children: [item]
        }
        allRouters[`len${preIndex}`].push(parent)
      }
    })
  }

  // 移除路由中没用的children字段
  const deleteChildrenFun = arr => {
    arr.map(r => {
      if(r.children.length > 0) {
        deleteChildrenFun(r.children)
      } else {
        delete r.children
      }
    })
  }
  deleteChildrenFun(routes)

  return routes
}