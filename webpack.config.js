'use strict';

global.__DEV__              = process.env.NODE_ENV == 'development';
const pkg                   = require('./package.json');
const webpack               = require('webpack');
const path                  = require('path');
const HtmlWebpackPlugin     = require('html-webpack-plugin');
const BrowserSyncPlugin     = require('browser-sync-webpack-plugin');
const ExtractCssChunks      = require('extract-css-chunks-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const CompressionPlugin     = require('compression-webpack-plugin');
const CleanWebpackPlugin    = require('clean-webpack-plugin');
const autoprefixer          = require('autoprefixer');
const cssMqpacker           = require('css-mqpacker');

const mainConfig = {
	context: path.join(process.cwd(), 'src'),

	watchOptions: {
		poll: true,
		aggregateTimeout: 100,
		ignored: /node_modules/
	},
	devtool: __DEV__ ? 'eval-source-map' : 'source-map',
	devServer: {
		port: 4000,
		hot: __DEV__,
		contentBase: path.join(__dirname, 'src'),
		watchContentBase: true
	},
	resolve: {
		modules: ['node_modules', 'bower_components'],
		extensions: ['.js', '.jsx', '.less', '.styl', '.scss']
	},
	resolveLoader: {
		modules: ['node_modules', 'bower_components'],
		extensions: ['.js', '.jsx', '.less', '.styl', '.scss']
	},
	performance: {
		hints: false,
		maxEntrypointSize: 400000,
		maxAssetSize: 250000,
		assetFilter: function (assetFilename) {
			return !(/\.map$/.test(assetFilename));
		}
	},
	module: {
		noParse: [/jquery/],
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules|widget/,
				loader: 'babel-loader',
				query: {
					presets: [['env', {'modules': false}], 'stage-0'],
					plugins: [
						'transform-runtime',
						'transform-decorators-legacy',
						'transform-decorators-legacy'
					]

				}
			},
			{
				test: /\.css$/,
				use: ExtractCssChunks.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							query: {
								sourceMap: true,
								minimize: !__DEV__,
								modules: false,
								importLoaders: 1

							}
						},
						{
							loader: 'postcss-loader',
							options: {
								plugins: [
									autoprefixer({ browsers: ['last 3 version', 'ie >= 11'] }),
									cssMqpacker({ sort: true })
								],
								sourceMap: true
							}
						}
					]
				})
			},
			{
				test: /\.less?$/,
				use: ExtractCssChunks.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							query: {
								sourceMap: true,
								minimize: !__DEV__,
								modules: false,
								importLoaders: 2

							}
						},
						{
							loader: 'postcss-loader',
							options: {
								plugins: [
									autoprefixer({ browsers: ['last 3 version', 'ie >= 11'] }),
									cssMqpacker({ sort: true })
								],
								sourceMap: true
							}
						},
						'less-loader'
					]
				})
			},
			{
				test: /\.scss$/,
				use: ExtractCssChunks.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							query: {
								sourceMap: true,
								minimize: !__DEV__,
								modules: false,
								importLoaders: 2

							}
						},
						{
							loader: 'postcss-loader',
							options: {
								plugins: [
									autoprefixer({ browsers: ['last 3 version', 'ie >= 11'] }),
									cssMqpacker({ sort: true })
								],
								sourceMap: true
							}
						},
						'sass-loader'
					]
				})
			},
			{
				test: /\.styl$/,
				use: ExtractCssChunks.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							query: {
								sourceMap: true,
								minimize: !__DEV__,
								modules: false,
								importLoaders: 2

							}
						},
						{
							loader: 'postcss-loader',
							options: {
								plugins: [
									autoprefixer({ browsers: ['last 3 version', 'ie >= 11'] }),
									cssMqpacker({ sort: true })
								],
								sourceMap: true
							}
						},
						'stylus-loader'
					]
				})
			},
			{
				test: /\.(png|jpg|jpeg|svg|ttf|eot|woff|woff2)$/i,
				use: [
					{
						loader: 'url-loader',
						query: {
							name: (__DEV__ ? '[path][name]' : '[path][name].[hash:6]') + '.[ext]',
							limit: 4096
						}
					},
					{
						loader: 'image-webpack-loader',
						query: {
							mozjpeg: {
								progressive: true
							},
							gifsicle: {
								interlaced: false
							},
							optipng: {
								optimizationLevel: 7
							},
							pngquant: {
								quality: '65-90',
								speed: 4
							}
						}
					}
				]
			}
		]
	},
	plugins: [
		new webpack.NoEmitOnErrorsPlugin(),

		new webpack.HotModuleReplacementPlugin(),

		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		}),

		new ExtractCssChunks({
			filename: __DEV__ ? '[name].css' : '[contenthash:8].css'
		}),

		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
			__DEV__: JSON.stringify(__DEV__),
			API_KEY: JSON.stringify('string' == typeof process.env.API_KEY ? process.env.API_KEY : false)
		})
	]
};

let widgetConfig = Object.assign({}, mainConfig);
let demoConfig = Object.assign({}, mainConfig);

widgetConfig.entry = {
	widget: ['./widget.js']
};

widgetConfig.output = {
	path: path.resolve(__dirname, 'dist'),
	publicPath: __DEV__ ? '/' : './',
	library: 'Widget',
	libraryExport: 'default',
	libraryTarget: 'umd',
	filename: '[name].js',
	chunkFilename: __DEV__ ? '[id].js' : '[id].[chunkhash:8].js'
};

demoConfig.entry = {
	index: ['./index.js']
};

demoConfig.output = {
	path: path.resolve(__dirname, 'dist'),
	publicPath: __DEV__ ? '/' : './',
	filename: __DEV__ ? '[name].js' : '[hash].[name].js',
	chunkFilename: __DEV__ ? '[id].js' : '[id].[chunkhash:8].js'
};

demoConfig.plugins = demoConfig.plugins.map(p => p);

demoConfig.plugins.push(new FaviconsWebpackPlugin({
	logo: path.join(process.cwd(), 'src/logo.jpg'),
	prefix: '[hash:6]/[hash:6].[ext]',
	inject: true,
	emitStats: true,
	statsFilename: 'favicons.json',
	background: '#fff',
	title: pkg.name,
	appName: pkg.name,
	appDescription: pkg.description,
	developerName: pkg.author.name,
	developerURL: pkg.author.url,
	index: pkg.homepage,
	url: pkg.homepage,
	silhouette: false,
	icons: {
		android: true,
		appleIcon: true,
		appleStartup: true,
		coast: true,
		favicons: true,
		firefox: true,
		opengraph: true,
		twitter: true,
		yandex: true,
		windows: true
	}
}));
demoConfig.plugins.push(new HtmlWebpackPlugin({
		template: 'index.html',
		chunks: ['index'],
		filename: 'index.html'
	})
);

module.exports = [
	widgetConfig,
	demoConfig
];


if (__DEV__) {
	module.exports[1].plugins.push(new webpack.NamedModulesPlugin());

	module.exports[1].plugins.push(
		new BrowserSyncPlugin(
			{
				ui: {
					port: 8090
				},
				host: 'localhost',
				port: 8080,
				// proxy the Webpack Dev Server endpoint
				// (which should be serving on http://localhost:8080/)
				// through BrowserSync
				cors: false,
				proxy: {
					target: 'http://localhost:4000',
					ws: true
				}
			},
			{
				// prevent BrowserSync from reloading the page
				// and let Webpack Dev Server take care of this
				reload: false
			}
		)
	)
} else {
	module.exports[1].plugins.push(
		new CleanWebpackPlugin([path.resolve(__dirname, 'dist')], {
			exclude: ['.gitkeep']
		})
	);

	module.exports[1].plugins.push(new webpack.HashedModuleIdsPlugin({
		hashFunction: 'sha256',
		hashDigest: 'hex',
		hashDigestLength: 20
	}));

	module.exports.forEach(m => {
		m.plugins.push( // NO NEED IF -p in CLI
			new webpack.optimize.UglifyJsPlugin({
				test: /\.js$/,
				compress: {
					warnings: false,
					drop_console: true,
					unsafe: true
				}
			})
		);
	});

	module.exports.forEach(m => {
		m.plugins.push(
			new CompressionPlugin({
				asset: '[path].gz[query]',
				algorithm: 'gzip',
				test: /\.js$|\.css$/,
				minRatio: 0.8
			})
		);
	});
}