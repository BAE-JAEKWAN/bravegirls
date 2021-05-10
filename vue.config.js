const path = require('path');
const vueSrc = './src';

module.exports = {
	publicPath: '',
	configureWebpack: {
		resolve: {
			alias: {
				'~': path.resolve(__dirname, vueSrc)
			},
			extensions: ['*', '.js', '.vue', '.json']
		}
	},
	outputDir: path.resolve(__dirname, "./dist"),
}