<script setup lang="ts">
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { ElNotification } from 'element-plus';
import { fetchDependencies } from "@/api/core";
import type { SearchMavenArtifact } from '@/components/type';
import MavenArtifactItem from '@/components/MavenArtifactItem.vue';

const searchValue = ref("");

const loading = ref(false)

// 防抖
let searchDebounceTimerId = -1;
// 搜索结果
const searchArtifactResult = ref<SearchMavenArtifact[]>([
  {
    groupId: "com.google.android",
    artifactName: "android",
    version: "1.0.0",
    timestamp: 1234
  },
]);

for (let i = 0; i < 20; i++) {
  searchArtifactResult.value.push({
    groupId: "com.google.android",
    artifactName: "android",
    version: "1.0.0",
    timestamp: 1234
  });
}

// 搜索依赖
const searchDependencies = () => {
  // 防抖操作
  if (searchDebounceTimerId != -1) {
    clearTimeout(searchDebounceTimerId);
  }
  searchDebounceTimerId = setTimeout(() => {
    loading.value = true;
    if (searchValue.value) {
      fetchDependencies(searchValue.value).then(res => {
        // 拿到数据进行转换
        console.log(res)
        searchArtifactResult.value = res.response.docs.map((item) => {
          return {
            groupId: item.g,
            artifactName: item.a,
            version: item.latestVersion,
            timestamp: parseInt(item.timestamp),
          } satisfies SearchMavenArtifact;
        });
      }).catch(err => {
        ElNotification({
          title: '网络错误',
          message: '请重试',
          type: 'error',
        });
      }).finally(() => {
        loading.value = false;
      });
    } else {
      ElNotification({
        title: 'Warning',
        message: '请输入内容！',
        type: 'warning',
      })
    }
  }, 300);
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
        <el-empty v-if="searchArtifactResult.length == 0 && !loading"
                  description="暂无数据" />
        <div v-if="loading">
          <el-skeleton :rows="1"
                       v-for="i in 10"
                       :key="i"
                       style="margin: 20px 20px" />
        </div>
        <MavenArtifactItem v-if="searchArtifactResult.length > 0 && !loading"
                           v-for="item in searchArtifactResult"
                           :key="item.groupId"
                           :data="item"
                           class="item" />
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
