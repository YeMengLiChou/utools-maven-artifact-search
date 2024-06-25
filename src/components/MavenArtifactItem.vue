<script setup lang="ts">

import { computed, defineProps, withDefaults } from 'vue'
import type { SearchResultItem } from '@/api/type'

interface Props {
    data?: SearchResultItem
}

// 属性
const props = withDefaults(
    defineProps<Props>(),
    {
        data: undefined,
    },
)

const emits = defineEmits<{
    'item-click': [
        groupId: string,
        artifactName: string,
    ]
}>()

// 完整的名字
const completeName = computed(() => {
    if (props.data === undefined) {
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
        <p>
            <el-text>{{ props.data.index }}</el-text>
            <el-text>{{ props.data.name }}</el-text>
        </p>
        <p>
            <el-text>{{ completeName }}</el-text>
        </p>
        <p>
            <el-text> {{ props.data.description }}</el-text>
        </p>
        <p>
            <el-text>{{ props.data.lastReleaseTime}}</el-text>
        </p>
    </el-card>

</template>


<style lang="css" scoped>
.el-text {
    padding-left: 10px;
}
</style>