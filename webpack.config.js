const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "development",
    entry: {
        main: path.join(__dirname, "src", "ts", "index.ts"),
        pi: path.join(__dirname, "src", "ts", "pi.ts")
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
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: path.join(__dirname, "src", "static"), to: "." }
            ]
        }),
        new HtmlWebpackPlugin({
            title: "me.theapplefreak.octoprintcontrol",
            template: path.resolve(__dirname, "./src/html/index.html"),
            filename: "index.html"
        })
    ]
}