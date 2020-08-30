const requireContext = require('require-context')
const create = require('../src/index')
const { resolve } = require('path')

const rootFile = resolve(__dirname, './pages')
const routes = create({ 
  rc: requireContext(rootFile, true, /\.vue$/), 
  rootFile: rootFile
})

console.log(routes)