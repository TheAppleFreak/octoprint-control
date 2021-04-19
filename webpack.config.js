const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: false,
    entry: {
        main: path.join(__dirname, "src", "ts", "index.ts"),
        "property-inspector": path.join(__dirname, "src", "ts", "pi.ts")
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "[name].[contenthash].js",
        assetModuleFilename: "[name][ext]"
    },
    module: {
        rules: [
            // Source code
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: ["ts-loader"]
            },
            // Images
            {
                test: /\.(?:ico|gif|png|jpe?g|svg)$/i,
                type: "asset/resource"
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js", ".json"]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: path.join(__dirname, "src", "static"), to: "." }
            ]
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./src/html/index.html"),
            filename: "index.html",
            inject: "body",
            chunks: ["main"]
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./src/html/property-inspector.html"),
            filename: "property-inspector.html",
            inject: "body",
            chunks: ["property-inspector"]
        })
    ]
}