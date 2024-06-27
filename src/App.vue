<script setup lang="ts">
import { useGlobalConfigStore } from '@/pinia/config'
// import { onPluginEnter, onPluginOut, UtoolsDB } from '@/api/utools'
import { CollectionTag, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const globalConfigStore = useGlobalConfigStore()
const router = useRouter()

onMounted(() => {
    // 将路由初始设置为搜索界面
    router.replace({
        name: 'Search'
    })
})

// onPluginEnter((config) => {
//     globalConfigStore.load(UtoolsDB)
//     if (config.code === "search" && config.payload) {
//         // 此时 payload 为打开插件时传入的值
//         globalConfigStore.setSearchValue(config.payload)
//     }
//     if (config.code == "collect") {
//         router.replace({
//             name: 'Collect'
//         })
//     }
// })
//
// onPluginOut(() => {
//     globalConfigStore.save(UtoolsDB)
// })

</script>

<template>
    <el-container class="container">
        <el-header>
            <el-menu mode="horizontal" default-active="1" router>
                <el-menu-item index="1" :route="{ name: 'Search' }">
                    <template #title>
                        <el-icon>
                            <Search />
                        </el-icon>
                        <span style="font-size: large">搜索</span>
                    </template>
                </el-menu-item>
                <el-menu-item index="2" :route="{ name: 'Collect' }">
                    <template #title>
                        <el-icon>
                            <CollectionTag />
                        </el-icon>
                        <span style="font-size: large">收藏</span>
                    </template>
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

<style scoped lang="less">
.container {
    width: 100%;
    height: 100%;

    .el-header {
        display: flex;
        width: 100%;

        .el-menu {
            width: 100%;
        }
    }

    :deep(.el-main) {
        padding: 0 !important;
    }
}
</style>
