<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { fetchMavenArtifactUsage } from '@/api/core'
import type { ArtifactUsage } from '@/api/type'
import { ElMessage, ElNotification } from 'element-plus'
import { Position, Star } from '@element-plus/icons-vue'

// 定义属性
const props = withDefaults(
    defineProps<{
        groupId: string
        artifact: string
        version: string
    }>(),
    {
        artifact: undefined,
        groupId: undefined,
        version: undefined,
    },
)
// 组件加载状态
const loading = ref(true)

// 缓存起来，在切换时无需重新加载
const cachedUsageResult = new Map()

// 当前需要加载的内容的key
const currentArtifactInfo = computed(() => {
    return `${props.groupId}:${props.artifact}:${props.version}`
})

const currentArtifactMavenLink = computed(() => {
    return `https://mvnrepository.com/artifact/${props.groupId}/${props.artifact}/ ${props.version}`
})

// 当发生变化时及时更新
// TODO: 考虑将已经加载过的内容缓存起来
watch(
    () => currentArtifactInfo.value,
    () => {
        fetchArtifactUsage(props.groupId, props.artifact, props.version)
    },
    {
        immediate: true,
    },
)

// 初次挂载
onMounted(() => {
    fetchArtifactUsage(props.groupId, props.artifact, props.version)
})

interface Usage {
    toolName: string
    usage: Array<string>
}

// 加载的结果
const usageResult = ref<Array<Usage>>([])

// TODO：设置偏好值，按照设置的偏好来设置
function transformVo(result: ArtifactUsage) {
    const usagesVo: Array<Usage> = Object.entries(result).map(([key, value]) => {
        const toolName = key.charAt(0).toUpperCase() + key.slice(1)
        return { toolName: toolName, usage: value.split('\n') }
    })
    return usagesVo
}

// 更新当前的数据
function updateCurrentData(res: ArtifactUsage) {
    usageResult.value = transformVo(res)
    // 更新tab默认显示
    activeTabName.value = usageResult.value.length > 0 ? usageResult.value[0].toolName : ''
    // 加入缓存
    if (!cachedUsageResult.has(currentArtifactInfo.value)) {
        cachedUsageResult.set(currentArtifactInfo.value, res)
    }
}

// 获取这些 artifact 的依赖用法
function fetchArtifactUsage(groupId: string, artifact: string, version: string) {
    // 从缓存中拿到数据
    if (cachedUsageResult.has(currentArtifactInfo.value)) {
        const cachedUsage = cachedUsageResult.get(currentArtifactInfo.value)
        updateCurrentData(cachedUsage)
        return
    }
    loading.value = true
    fetchMavenArtifactUsage(groupId, artifact, version)
        .then((res) => {
            updateCurrentData(res)
        })
        .catch((err) => {
            console.log('fetchArtifactUsage Error', err)
        })
        .finally(() => {
            loading.value = false
        })
}

// 当前激活的tab
// TODO: 根据设置中的来显示
const activeTabName = ref('')

// 处理 tab 点击事件
function handleTabClick() {}

// 将点击到的文本复制到剪切板
function handleTextClick(lines: Array<string>) {
    const usage = lines.join('/n')
    navigator.clipboard
        .writeText(usage)
        .then(() => {
            ElMessage({
                message: '复制成功！',
                type: 'success',
            })
        })
        .catch((err) => {
            console.log('copy to clipboard failed', err)
            ElMessage({
                message: '复制失败！请手动复制！',
                type: 'error',
            })
        })
}


function collectVersionArtifact() {
    ElNotification({
        message: '开发中...',
        type: 'info',
    })
}

</script>

<template>
    <el-container>
        <el-main>
            <el-popover placement="top" trigger="hover" width="300px" :disabled="loading">
                <template #reference>
                    <el-skeleton v-if="loading" :rows="5" animated />
                    <el-tabs
                        v-else
                        v-loading="loading"
                        v-model="activeTabName"
                        @tab-click="handleTabClick"
                        tab-position="right"
                        type="border-card"
                        stretch
                    >
                        <el-tab-pane
                            v-for="item in usageResult"
                            :label="item.toolName"
                            :name="item.toolName"
                            :key="item.toolName"
                            @click="handleTextClick(item.usage)"
                        >
                            <div style="height: 100%; width: 100%">
                                <p v-for="(line, index) in item.usage" :key="index">
                                    <el-text size="large">
                                        {{ line }}
                                    </el-text>
                                </p>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </template>
                <!-- 对该内容的一些操作 -->
                <div>
                    <el-space direction="vertical" style="align-items: center; display: flex">
                        <el-text>点击内容即可复制~</el-text>
                        <el-button type="primary" @click="collectVersionArtifact">
                            <template #icon>
                                <el-icon>
                                    <Star />
                                </el-icon>
                            </template>
                            收藏该版本({{ activeTabName }})
                        </el-button>
                    </el-space>
                </div>
            </el-popover>
            <div class="footer" style="margin-top: 10px">
                <el-space direction="vertical" size="large">
                    <el-text type="info"
                        >该内容基于
                        <el-link type="primary" :href="currentArtifactMavenLink" target="_blank"
                            >Maven Repository
                            <el-icon>
                                <Position />
                            </el-icon>
                        </el-link>
                        > 生成
                    </el-text>
                    <el-text v-if="loading" type="info">生成时间可能有点长~请稍等~</el-text>
                </el-space>
            </div>
        </el-main>
    </el-container>
</template>

<style scoped lang="css">
.footer {
    display: flex;
    flex-direction: column;
}
</style>
