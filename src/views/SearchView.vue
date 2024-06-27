<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Position, Search } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import { fetchMavenSearchWebSite } from '@/api/core'
import MavenArtifactItem from '@/components/MavenArtifactItem.vue'
import type { SearchResult } from '@/api/type'
import {  useRouter } from 'vue-router'
import _ from 'lodash'
import { useGlobalConfigStore } from '@/pinia/config'

const router = useRouter()

const globalConfigStore = useGlobalConfigStore()

const loading = ref(false)

// 搜索栏的值（可变）
const searchValue = ref('')
// 已经搜索的值，不可变
const finalSearchValue = ref('')
// 防抖
let searchDebounceTimerId = -1
// 搜索结果
const searchArtifactResult = ref<SearchResult>()
// 搜索的页码数
const searchPageNo = ref(1)
// 是否存在数据（还没开始搜索）
const isStartedSearch = ref(false)
// 数据是否为空
const isResultEmpty = computed(() => {
    return searchArtifactResult.value === undefined || searchArtifactResult.value!.data.length === 0
})

// 从插件带进来的payload，直接搜索
watch(
    () => globalConfigStore.searchValue,
    () => {
        if (globalConfigStore.searchValue) {
            searchValue.value = globalConfigStore.searchValue
            searchDependencies()
        }
    },
    { immediate: true },
)

// 搜索依赖
function searchDependencies() {
    // 当搜索的值相同时，取消
    if (finalSearchValue.value === searchValue.value) {
        return
    }
    // 防抖操作
    if (searchDebounceTimerId != -1) {
        clearTimeout(searchDebounceTimerId)
    }
    searchDebounceTimerId = setTimeout(() => {
        loading.value = true
        isStartedSearch.value = true
        // 更新该次搜索的值
        finalSearchValue.value = searchValue.value
        // 重置页码数为1
        searchPageNo.value = 1
        if (searchValue.value) {
            fetchMavenSearchWebSite(searchValue.value, searchPageNo.value)
                .then((res) => {
                    console.log(res)
                    searchArtifactResult.value = res
                })
                .catch((err) => {
                    console.log('searchDependencies', err)
                    finalSearchValue.value = '' // 确保能重新搜索
                    ElNotification({
                        title: '网络错误',
                        message: '请重试',
                        type: 'error',
                    })
                })
                .finally(() => {
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

// =========================== 结果列表加载更多 ========================================

// 是否正在加载更多
const loadingMore = ref(false)

// 是否存在更多未加载的数据
const hasMoreResult = computed<boolean>(() => {
    // 存在剩余未加载数据
    if (searchArtifactResult.value) {
        return searchArtifactResult.value.data.length < searchArtifactResult.value.total
    }
    return false
})

// 是否允许加载更多内容
const loadingMoreEnable = computed<boolean>(() => {
    // 不在加载中 && 存在未加载的数据
    return !loadingMore.value && hasMoreResult.value
})

// 无限加载的加载更多
function loadingMoreResult() {
    if (!searchArtifactResult.value) {
        throw new Error('非法行为：还没搜索就开始加载其他数据')
    }
    if (loadingMore.value) {
        return
    }
    loadingMore.value = true
    fetchMavenSearchWebSite(finalSearchValue.value, searchPageNo.value + 1)
        .then((res) => {
            // 获取到数据后才更新页码数
            searchPageNo.value += 1
            const result = _.cloneDeep(searchArtifactResult.value)!
            result.pageNo = searchPageNo.value
            result.data.push(...res.data)
            searchArtifactResult.value = result
        })
        .catch((err) => {
            console.log('loadingMore Error', err)
            ElMessage({
                message: '加载失败',
                type: 'error',
            })
        })
        .finally(() => {
            loadingMore.value = false
        })
}

// ================ 路由跳转 =================
// 跳转到对应的详细页面
function navigateToArtifactView(groupId: string, artifactName: string) {
    router.push({
        path: `/artifact/${groupId}/${artifactName}`,
    })
}
</script>

<template>
    <el-container class="container">
        <el-header :class="{ 'search-box': true, 'has-result': isStartedSearch }">
            <el-space direction="vertical" size="large">
                <el-space>
                    <el-text size="large">搜索Maven Repository 依赖：</el-text>
                    <el-input
                        v-model="searchValue"
                        style="width: 240px"
                        size="large"
                        placeholder="请输入查找内容"
                        :prefix-icon="Search"
                        @keyup.enter="searchDependencies"
                    >
                    </el-input>
                    <el-button type="primary" @click="searchDependencies" :disabled="loading"
                        >搜索
                    </el-button>
                </el-space>
                <el-text type="info" v-if="!isStartedSearch">
                    本插件基于
                    <el-link href="https://mvnrepository.com/" type="primary"
                        >Maven Repository
                        <el-icon>
                            <Position />
                        </el-icon>
                    </el-link>
                    网页获取数据
                </el-text>
            </el-space>
        </el-header>
        <el-main class="main-container" v-if="isStartedSearch">
            <!-- 无数据提示 -->
            <el-empty v-if="isResultEmpty && !loading" description="暂无数据" class="result" />
            <!-- 加载时显示 -->
            <el-space v-if="loading" class="result" direction="vertical">
                <div style="width: 100%">
                    <el-skeleton :rows="5" animated style="width: 100%" />
                    <el-text type="info">
                        本插件基于
                        <el-link href="https://mvnrepository.com/" type="primary"
                            >Maven Repository
                            <el-icon>
                                <Position />
                            </el-icon>
                        </el-link>
                        网页获取数据，等待时间可能较长，请稍等
                    </el-text>
                </div>
            </el-space>
            <!-- 搜索结果 -->

            <el-scrollbar v-if="!isResultEmpty && !loading" class="result">
                <MavenArtifactItem
                    v-infinite-scroll="loadingMoreResult"
                    :infinite-scroll-distance="50"
                    :infinite-scroll-disabled="!loadingMoreEnable"
                    v-for="item in searchArtifactResult!.data"
                    :key="item.index"
                    :data="item"
                    class="item"
                    @item-click="navigateToArtifactView"
                />

                <div class="loading-tips" v-if="loadingMore">
                    <el-space direction="horizontal" size="large">
                        <div class="spinner"></div>
                        <div>加载中...请稍等</div>
                    </el-space>
                </div>
                <div v-if="!hasMoreResult" class="loading-tips">没有更多数据</div>
            </el-scrollbar>
        </el-main>
    </el-container>
</template>

<style scoped lang="less">
/* 整体的大小，并居中 */
.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    margin: 0 auto;
}

/* 普通情况下居中 */
.search-box {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 1rem;
    transition: all 1s ease;
}

/* 有结果后使其位于顶部 */
.has-result {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #fff;
    /* 背景颜色，确保与下方内容区分 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    height: auto;
}

/* 包含搜索内容的容器 */
.main-container {
    width: 100%;
    display: flex;

    .result {
        width: 100%;
    }

    .el-card {
        margin: 12px 0;
        width: calc(100% - 10px);
    }

    /* 加载中的转圈圈 */

    .spinner {
        border: 2px solid rgba(0, 0, 0, 0.1);
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border-left-color: var(--el-color-primary); /* 转圈颜色 */
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .loading-tips {
        margin: 20px 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
