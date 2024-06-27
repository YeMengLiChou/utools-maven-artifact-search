<script setup lang="ts">
import { computed } from 'vue'
import type { SearchResultItem } from '@/api/type'

interface Props {
    data?: SearchResultItem
}

// 属性
const props = withDefaults(defineProps<Props>(), {
    data: undefined,
})
// 声明组件事件
const emits = defineEmits<{
    'item-click': [groupId: string, artifactName: string]
}>()

// 完整的名字
const completeName = computed(() => {
    if (!props.data) {
        return ''
    }
    return `${props.data.groupIdName} : ${props.data?.artifactName}`
})

// 点击事件传递到父组件中
const handleClickItem = () => {
    emits('item-click', props.data!.groupIdName, props.data!.artifactName)
}
</script>

<template>
    <el-card v-if="props.data" shadow="hover" @click="handleClickItem">
        <template #header>
            <div class="header">
                <el-space size="large">
                    <el-text size="large" type="success" style="font-size: larger"
                        >{{ props.data.index }}
                    </el-text>
                    <el-text size="large" style="font-weight: bold">{{ props.data.name }}</el-text>
                </el-space>
                <el-text type="info">{{ props.data.lastReleaseTime }}</el-text>
            </div>
        </template>
        <template #default>
            <el-space direction="vertical" alignment="flex-start">
                <el-tag size="large" style="font-size: large;"
                    >{{ completeName }}
                </el-tag>
                <el-text
                    size="large"
                    :line-clamp="2"
                    :truncated="true"
                    style="width: 100%; height: auto; white-space: normal"
                >
                    {{ props.data.description }}
                </el-text>
            </el-space>
        </template>
    </el-card>
</template>

<style lang="css" scoped>
.el-text {
    padding-left: 10px;
}

.header {
    display: flex;
    justify-content: space-between;
}
</style>
