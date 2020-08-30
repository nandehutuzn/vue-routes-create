# vue-routes-create
模仿nuxt路由自动生成功能，根据项目目录结构生成 vue-router 中的 routes

### 示例
```
src/pages

|   REAMME.md
|   package.json
|---src
|   |---pages
|       |   index.vue
|       |   login.vue
|       |---workbench
|           |   index.vue
|           |   my.vue  
|           |---me
|               |   index.vue
|               |   _id.vue
|               |   your.vue

```
```

src/router/index.js

import Router from 'vue-router'
const craete = require('vue-routes-create')

const rootFile = '../pages'
const rc = require.context(rootFile, true, /\.vue$/)

export default new Router({
  routes: create({ rc, rootFile})
})

```

生成的 routes 为
```
routes = [
  {
    path: '/',
    name: 'home',
    component: [Object Function]
  },
  {
    path: '/login', 
    name: 'login', 
    component: [Object Function]
  },
  {
    path: '/workbench',
    name: 'workbench',
    component: [Object Function],
    children: [ 
      {
        path: '/workbench/my',
        name: 'my',
        component: [Object Function],
      },
      {
        path: '/workbench/me',
        name: 'me',
        component: [Object Function],
        children: [
          {
            path: '/workbench/me/:id',
            name: 'id',
            component: [Object Function],
          }
          {
            path: '/workbench/me/your',
            name: 'your',
            component: [Object Function],
          }
        ]
      }
    ]
  }
]
```
