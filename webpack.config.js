const webpack = require('webpack');
const {resolve} = require('path');
const {getIfUtils, removeEmpty} = require('webpack-config-utils');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');


module.exports = (env, argv) => {
  const {ifProduction} = getIfUtils(argv.mode || 'development');
  //console.log(JSON.stringify(argv));
  const {entryFile = 'constructor'} = argv;
  return {
    stats: {
      colors: true
    },
    devtool: 'source-map',

    // context: resolve('./src'),

    entry: {
      app: `./src/${entryFile}.tsx`
    },
    watch: argv.mode !== 'production',
    output: {
      filename: `${entryFile}${argv.mode === 'production' ? '.min' : ''}.js`,
      path: resolve('./docs'),
      libraryTarget: 'umd',
      library: entryFile,
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: `ts-loader`,
        },
        {
          test: /\.scss$/,
          loader: `style-loader!css-loader?importLoaders=1&sourceMap!postcss-loader?sourceMap!sass-loader?sourceMap`,
        },
        {
          test: /\.css$/,
          loader: `style-loader!css-loader?importLoaders=1!postcss-loader`,
        }
      ],
    },

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      modules: [path.resolve(__dirname, '../'), 'node_modules']
    },

    plugins: removeEmpty([
      // new webpack.DefinePlugin({
      //   'process.env': {
      //     'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      //   }
      // }),
      ifProduction(new webpack.optimize.OccurrenceOrderPlugin(true)),
    ]),
    optimization: {
      minimizer: [new TerserPlugin()],
    },
  };
};

