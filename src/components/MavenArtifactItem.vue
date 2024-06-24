<script setup lang="ts">

import { computed, defineProps, withDefaults } from 'vue';
import type { SearchMavenArtifact } from '@/components/type';

interface Props {
    data?: SearchMavenArtifact
}
// 属性
const props = withDefaults(
    defineProps<Props>(),
    {
        data: undefined,
    }
)
// 完整的名字
const completeName = computed(() => {
    if (props.data === undefined) {
        return '';
    }
    return `${props.data.groupId}:${props.data?.artifactName}`
});

</script>

<template>

    <el-card v-if="props.data" shadow="hover">
        <el-tag>Artifact</el-tag>
        <el-text>{{ completeName }}</el-text>
        <br />
        <el-tag>最新版本</el-tag>
        <el-text> {{ props.data.version }}</el-text>

    </el-card>

</template>


<style lang="css" scoped>
.el-text {
    padding-left: 10px;
}
</style>