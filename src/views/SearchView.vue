<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import { fetchMavenSearchWebSite } from '@/api/core'
import MavenArtifactItem from '@/components/MavenArtifactItem.vue'
import type { SearchResult } from '@/api/type'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchValue = ref('')

const loading = ref(false)

// 防抖
let searchDebounceTimerId = -1
// 搜索结果
const searchArtifactResult = ref<SearchResult>()

// 数据是否为空
const isResultEmpty = computed(() => {
    return searchArtifactResult.value === undefined || searchArtifactResult.value!.data.length === 0
})

// 搜索依赖
const searchDependencies = () => {
    // 防抖操作
    if (searchDebounceTimerId != -1) {
        clearTimeout(searchDebounceTimerId)
    }
    searchDebounceTimerId = setTimeout(() => {
        loading.value = true
        if (searchValue.value) {
            fetchMavenSearchWebSite(searchValue.value).then(res => {
                console.log(res)
                searchArtifactResult.value = res
            })
                .catch(err => {
                    console.log('searchDependencies', err)
                    ElNotification({
                        title: '网络错误',
                        message: '请重试',
                        type: 'error',
                    })
                }).finally(() => {
                loading.value = false
            })
        } else {
            ElNotification({
                title: 'Warning',
                message: '请输入内容！',
                type: 'warning',
            })
        }
    }, 300)
}

function navigateToArtifactView(groupId: string, artifactName: string) {
    router.push({
        path: `artifact/${groupId}/${artifactName}`,
    })
}

</script>

<template>
    <div>
        <div class="main-content">
            <div class="search-box">
                <el-input v-model="searchValue"
                          style="width: 240px"
                          size="large"
                          placeholder="请输入查找内容"
                          :prefix-icon="Search"
                          @keyup.enter="searchDependencies" />
            </div>
            <div class="search-result">
                <!-- 无数据提示 -->
                <el-empty v-if="isResultEmpty && !loading"
                          description="暂无数据" />
                <!-- 加载时显示 -->
                <div v-if="loading">
                    <el-skeleton :rows="1"
                                 v-for="i in 10"
                                 :key="i"
                                 style="margin: 20px 20px" />
                </div>
                <!-- 展示结果 -->
                <template v-if="!isResultEmpty && !loading">
                    <MavenArtifactItem
                        v-for="item in searchArtifactResult!.data"
                        :key="item.index"
                        :data="item"
                        class="item"
                        @item-click="navigateToArtifactView"
                    />
                </template>

            </div>
        </div>
    </div>
</template>

<style scoped lang="css">
/* 通过fixed定位固定搜索框 */
.search-box {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    /* 设置z-index以确保搜索框在最上层 */
    display: flex;
    justify-content: center;
    /* 水平居中 */
    padding: 10px;
    /* 根据需要调整内外边距 */
    background-color: #fff;
    /* 背景颜色，确保与下方内容区分 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    /* 可选，增加阴影效果 */
}

.main-content {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    /* 使主要内容区域至少填充整个视口高度 */
    padding-top: 60px;
    /* 保证搜索框下方有足够的空间 */
    justify-content: center;
    /* 垂直居中对齐子元素 */
    align-items: center;
    width: 100vw;
}

.search-result {
    width: 50%;
}

.item {
    margin: 8px 8px;
}
</style>
