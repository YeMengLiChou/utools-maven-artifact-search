# Utools-Maven-Artifact-Search
基于 [Maven Repository](https://mvnrepository.com/) 网站所开发的插件：
- 搜索 Maven Repository 的依赖，查看其对应的版本以及用法
- 收藏依赖（开发中）

> 因为搜索结果依赖于网站的响应，所以等待时间取决于网速，有概率会遇到网络问题（Maven网站返回403）
---


# 打包安装

1. 先进行打包，打包生成的内容会在 `dist` 文件夹中
    ```sh
    npm install
    npm run build
    ```
2. 使用 Utools 开发者工具定位到 `dist/plugin.json` 文件，然后打包为 `xxx.upx` 文件，
3. 最后拖进 Utools 进行安装即可