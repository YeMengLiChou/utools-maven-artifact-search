<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { fetchMavenArtifactInfo } from '@/api/core'
import { ElNotification } from 'element-plus'
import type { ArtifactInfo } from '@/api/type'
import MavenArtifactUsage from '@/components/MavenArtifactUsage.vue'
import { Star } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const artifactInfo = ref<ArtifactInfo>()
const groupId = ref<string>()
const artifactName = ref<string>()

// 包名称： groupId:artifactName形式
const artifactCompleteName = computed<string>(() => {
    if (groupId.value && artifactName.value) {
        return `${groupId.value}:${artifactName.value}`
    }
    return ''
})

// 获取 ArtifactInfo 的信息
function fetchArtifactInfo(group: string, artifactName: string) {
    loading.value = true
    fetchMavenArtifactInfo(group, artifactName)
        .then((res) => {
            console.log('artifactInfo', res)
            artifactInfo.value = res
        })
        .catch((err) => {
            console.log('fetchArtifactInfo Error', err)
            ElNotification({
                type: 'error',
                title: '网络错误',
                message: '请重试!',
            })
        })
        .finally(() => {
            loading.value = false
        })
}

// 进来时先获取对应信息
onMounted(() => {
    groupId.value = route.params['groupId'] as string
    artifactName.value = route.params['artifactName'] as string
    fetchArtifactInfo(groupId.value, artifactName.value)
})
// 可能被缓存，不会加载 onMounted 因此需要在 activated时加载
onActivated(() => {
    const routeGroupId = route.params['groupId'] as string
    const routeArtifactName = route.params['artifactName'] as string
    // 不相同时才执行更新
    if (routeGroupId != groupId.value || routeArtifactName != artifactName.value) {
        groupId.value = routeGroupId
        artifactName.value = routeArtifactName
        fetchArtifactInfo(groupId.value, artifactName.value)
    }
})

// 处理点击 back 时的
function onBack() {
    router.back()
}

// 已经选中的版本（时间线上面的）
const selectedVersionItemIndex = ref(-1)
// 选中的版本信息（用于加载对应的数据）
const selectedItem = ref<{
    groupId: string
    artifact: string
    version: string
}>()

// 判断是否选中
function isSelected(index: number) {
    return index == selectedVersionItemIndex.value
}

// 处理时间线上面子项的点击
function handleSelectVersionItem(index: number) {
    selectedVersionItemIndex.value = index
    selectedItem.value = {
        groupId: groupId.value!,
        artifact: artifactName.value!,
        version: artifactInfo.value!.versions[index].version,
    }
    console.log('clicked', index)
}
</script>

<template>
    <el-container v-loading="loading" direction="vertical" class="main-container">
        <el-header>
            <!--  页头，显示面板屑和相关信息  -->
            <el-page-header @back="onBack">
                <template #breadcrumb>
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item :to="{ name: 'Search' }" class="font-large">
                            搜索
                        </el-breadcrumb-item>
                        <el-breadcrumb-item class="font-large" :to="{}" style="font-weight: bolder">
                            {{ artifactCompleteName }}
                        </el-breadcrumb-item>
                    </el-breadcrumb>
                </template>
                <template #content>
                    <el-space>
                        <el-tag v-if="artifactInfo?.categories" size="large" type="success"
                            >{{ artifactInfo?.categories }}
                        </el-tag>
                        <el-text size="large" truncated line-clamp="1" style="align-items: center">
                            {{ artifactInfo?.description }}
                        </el-text>
                    </el-space>
                </template>
                <template #extra>
                    <!-- 加入收藏   -->
                    <el-button type="primary" size="large">
                        <template #icon>
                            <el-icon>
                                <Star />
                            </el-icon>
                        </template>
                        收藏该 Artifact
                    </el-button>
                </template>
            </el-page-header>
        </el-header>
        <el-container class="inner-container">
            <!-- 侧边显示时间线和版本           -->
            <el-aside width="auto">
                <el-scrollbar>
                    <el-timeline>
                        <el-timeline-item
                            v-for="(item, index) in artifactInfo?.versions"
                            :key="item.version"
                            :timestamp="item.releaseDate"
                            @click="handleSelectVersionItem(index)"
                            :type="isSelected(index) ? 'primary' : 'info'"
                            :class="{
                                'timeline-item': true,
                                'first-item': index == 0,
                            }"
                        >
                            <el-badge value="new" class="item" :hidden="index != 0">
                                <el-space>
                                    <el-text
                                        size="default"
                                        :type="isSelected(index) ? 'primary' : 'info'"
                                        :class="{ 'selected-item': isSelected(index) }"
                                        class="timeline-item-text"
                                        >{{ item.version }}
                                    </el-text>
                                    <el-tag size="small">
                                        {{ item.repository }}
                                    </el-tag>
                                </el-space>
                            </el-badge>
                        </el-timeline-item>
                    </el-timeline>
                </el-scrollbar>
            </el-aside>
            <el-main>
                <el-scrollbar>
                    <el-empty :description="'请选中一个版本'" v-if="!selectedItem"></el-empty>
                    <MavenArtifactUsage
                        v-else
                        :group-id="selectedItem.groupId"
                        :artifact="selectedItem.artifact"
                        :version="selectedItem.version"
                    />
                </el-scrollbar>
            </el-main>
        </el-container>
    </el-container>
</template>

<style lang="less" scoped>
@inner-container-margin-top: 16px;
@inner-container-height: 100% - @inner-container-margin-top;

.main-container {
    height: 100%;
}

/*侧边栏*/
.el-aside {
    height: 100%;

    /* 时间线 */

    .el-timeline {
        margin-right: 10px; /* 腾出位置给滚动条 */
    }

    .first-item {
        margin-top: 12px; /* 第一个时间项腾出位置给 badge */
    }

    /* 时间线子项的文本 */

    .timeline-item-text {
        transition: all 0.3s ease;
    }

    /* 时间线上被选中的子项 */

    .selected-item {
        font-weight: bold;
        font-size: large;
        transition: all 0.3s ease;
    }
}

/* 底部的container */
.inner-container {
    margin-top: @inner-container-margin-top;
    height: @inner-container-height;
}

.font-large {
    font-size: large !important;
}
</style>
