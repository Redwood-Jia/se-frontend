const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack') 
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
const ElementPlus = require('unplugin-element-plus/webpack')
// 自动引入icons
const Icons = require('unplugin-icons/webpack')
const IconsResolver = require('unplugin-icons/resolver') // 注意这里的修改

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
        AutoImport({
            resolvers: [
              ElementPlusResolver(),

              IconsResolver.default({
                prefix: 'Icon',
              }),
            ],

            // 将 TypeScript 声明文件设置为源代码目录下的 auto-imports.d.ts 文件
            // dts: path.resolve(pathSrc, 'auto-imports.d.ts'),

        }),
        Components({
            resolvers: [
              IconsResolver.default({
                enabledCollections: ['ep'],
              }),

              ElementPlusResolver()
            ],
        }),

        // default这个地方可参考：https://github.com/unplugin/unplugin-icons | Vue CLI一节
        Icons.default({
          autoInstall: true,
        }),
    
        ElementPlus(),
    ],
  },
  devServer : {
    port : 8080, //指定项目本地运行的 端口
  },
})
