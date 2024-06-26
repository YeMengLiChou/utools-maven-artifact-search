<script setup lang="ts"></script>

<template>
    <el-container class="container">
        <el-header>
            <el-menu mode="horizontal" default-active="1">
                <el-menu-item index="1">
                    <el-text size="large"> 搜索依赖</el-text>
                </el-menu-item>
                <el-menu-item index="2">
                    <el-text size="large"> 收藏</el-text>
                </el-menu-item>
            </el-menu>
        </el-header>
        <el-main>
            <RouterView v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </RouterView>
        </el-main>
    </el-container>
</template>

<style scoped lang="css">
.container {
    width: 100%;
    height: 100%;

    .el-header {
        display: flex;
        width: 100%;

        .el-menu {
            margin: 0 auto;
        }
    }

    :deep(.el-main) {
        padding: 0 !important;
    }
}
</style>
