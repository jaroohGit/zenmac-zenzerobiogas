module.exports = {
  publicPath: '/',
  transpileDependencies: ["@vueform"],
  configureWebpack: {
    resolve: {
      conditionNames: ['import', 'module', 'webpack', 'development', 'browser', 'require', 'default'],
    },
  },
};
