//这是项目发布阶段用到的babel插件
const prodPlugins = []
// 运行时会判断环境，如果是在发布阶段，则添加指令，移除所有log命令
//如果判断出是在开发环境，那么prodPlugins就是一个空数组

  if (process.env.NODE_ENV === 'production') {
    prodPlugins.push('transform-remove-console')
  }
  
  
module.exports = {
  
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    //扩展运算符
    ...prodPlugins,
      "@babel/plugin-syntax-dynamic-import"
    
  ]
}
