/**
 * @author Gerardo Jaramillo
 * 
 */

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const styleRules = {
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
}

const jsRules = {
    test: /\.(?:js|mjs|cjs)$/,
    exclude: /node_modules/,
    use: {
        loader: 'babel-loader',
        options: {
            sourceType: 'module',
            targets: 'defaults',
            presets: [['@babel/preset-env']]
        }
    }
}

const rules = [styleRules, jsRules]

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        clean: true
    },
    module: { rules: rules },
    resolve: { extensions: ['.js', '.css'] },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/world/world-5p.geojson'),
                    to: 'world-5p.geojson'
                }
            ]
        })
    ],
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist')
        },
        host: '0.0.0.0',
        port: '8080',
        open: true,
        hot: true
    }

}