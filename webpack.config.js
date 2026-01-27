const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/renderer/main.ts",
  target: "web",
  output: {
    path: path.resolve(__dirname, "dist/renderer"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          appendTsSuffixTo: [/\.vue$/],
          configFile: path.resolve(__dirname, "tsconfig.renderer.json"),
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".vue"],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/renderer/index.html",
    }),
  ],
  stats: "errors-only",
  infrastructureLogging: {
    level: "warn",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist/renderer"),
    },
    port: 8080,
    hot: true,
  },
};
