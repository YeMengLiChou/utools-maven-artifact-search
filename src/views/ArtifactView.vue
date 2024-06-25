<script lang="ts" setup>

import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { fetchMavenArtifactInfo } from '@/api/core'
import { ElNotification } from 'element-plus'
import type { ArtifactInfo } from '@/api/type'

const route = useRoute()

const loading = ref(false)
const artifactInfo = ref<ArtifactInfo>()

function fetchArtifactInfo(group: string, artifactName: string) {
    loading.value = true
    fetchMavenArtifactInfo(group, artifactName)
        .then(res => {
            console.log('artifactInfo', res)
            artifactInfo.value = res
        })
        .catch(err => {
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


onMounted(() => {
    console.log(route.params)
    fetchMavenArtifactInfo(route.params['groupId'] as string, route.params['artifactName'] as string)
})

</script>

<template>
    <div class="about">
        <h1>This is an about page</h1>
    </div>
</template>

<style lang="css" scoped>

</style>
