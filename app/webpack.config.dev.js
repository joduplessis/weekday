const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = env => {
  return {
    mode: 'development',
    devtool: 'source-map',
    entry: {
      index: path.resolve(__dirname, './src/js/index.js'),
    },
    resolve: {
      alias: {
        react: path.resolve('./node_modules/react'),
      },
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.[name].js',
      publicPath: '/',
      chunkFilename: 'bundle.[name].[contenthash].js',
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    plugins: [
      // new BundleAnalyzerPlugin(),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './src/index.html'),
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css',
      }),
      new webpack.NormalModuleReplacementPlugin(/src\/js\/environment\.js/, 'environment.dev.js'),
      new WorkboxPlugin.InjectManifest({
        swSrc: './src/js/sw.staging.js',
        swDest: 'sw.js',
      }),
      new CopyPlugin([{ from: 'src/assets', to: '' }]),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
          },
        },
      },
    },
    resolve: {
      symlinks: true,
      extensions: ['*', '.js', '.jsx', '.less', '.scss'],
      alias: {
        'styled-components': path.resolve('./node_modules', 'styled-components'),
      },
    },
    devServer: {
      contentBase: path.resolve(__dirname, 'dist'),
      historyApiFallback: true,
    },
    module: {
      rules: [
        /*
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
          enforce: "pre",
          options: {}
        },
        */
        {
          test: /.htaccess/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '.htaccess',
              },
            },
          ],
        },
        {
          test: /manifest.webmanifest/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'manifest.webmanifest',
              },
            },
          ],
        },
        {
          test: /\.(svg|png|jpe?g|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: '',
              },
            },
          ],
        },
        /*
        {
          test: /\.(css)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[contenthash].[ext]',
              },
            },
            'extract-loader',
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        */
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(woff|woff2|ttf|otf|eot)$/,
          loader: 'file-loader',
          include: [/fonts/],
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts',
          },
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.less$/,
          loader: 'style-loader!css-loader!less-loader',
        },
        {
          test: /\.scss$/,
          loader: 'style-loader!css-loader!sass-loader',
        },
      ],
    },
  }
}
