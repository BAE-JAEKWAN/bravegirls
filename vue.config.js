const path = require('path');
const vueSrc = './src';

module.exports = {
	publicPath: '',
	configureWebpack: {
		resolve: {
			alias: {
				'~': path.resolve(__dirname, vueSrc)
			},
			extensions: ['.vue']
		}
	}
}