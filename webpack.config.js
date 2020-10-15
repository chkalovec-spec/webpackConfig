const path = require('path')
const webpack = require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'

const optimization = () => {
  config = {
    splitChunks: {
      chunks: 'all',
    },
  }
  if (isProd) config.minimizer = [new OptimizeCssAssetsPlugin(), new TerserWebpackPlugin()]

  return config
}

const filename = ext => (isProd ? `[name]_[contentHash].${ext}` : `[name].${ext}`)

const cssloaders = extra => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDev,
        reloadAll: true,
      },
    },
    'css-loader',
  ]

  if (extra) loaders.push(extra)

  return loaders
}

const babelOPtions = preset => {
  const options = {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-proposal-class-properties'],
  }

  if (preset) options.presets.push(preset)

  return options
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    // main: ['@babel/polyfill', './index.js'],
    main: ['@babel/polyfill', './index.jsx'],
    analitycs: './analitycs.ts',
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.wasm', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  optimization: optimization(),
  devServer: {
    clientLogLevel: 'silent',
    port: 9000,
  },
  devtool: isDev ? 'source-map' : '',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelOPtions(),
        },
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelOPtions('@babel/preset-typescript'),
        },
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: babelOPtions('@babel/preset-react'),
        },
      },
      {
        test: /\.css$/,
        use: cssloaders(),
      },
      {
        test: /\.less$/,
        use: cssloaders('less-loader'),
      },
      {
        test: /\.s[ac]ss$/,
        use: cssloaders('sass-loader'),
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/i,
        use: ['file-loader'],
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ['file-loader'],
      },
      {
        test: /\.xml$/,
        use: ['xml-loader'],
      },
      {
        test: /\.csv$/,
        use: ['csv-loader'],
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      favicon: path.resolve(__dirname, './src/assets/webpack-logo.png'),
      template: './index.html',
      minify: {
        collapseWhitespace: isProd,
      },
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: filename('css'),
    }),
    new webpack.DefinePlugin({
      __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })',
    }),
  ],
}
