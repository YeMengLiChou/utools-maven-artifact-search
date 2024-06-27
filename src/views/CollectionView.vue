<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import { useCollectionStore } from '@/pinia/collect'
import { computed, type Ref, watch } from 'vue'
import type { FormRules } from 'element-plus'

const searchValue = ref('')

const collectionStore = useCollectionStore()

const collectionsDirs = computed(() => {
    return collectionStore.collectionDirs
})

// =================== 多选操作 ====================================
let selectStatus = ref<Map<number, Ref<boolean>>>(createNewStatus())

// 基于已有状态生成新的状态(用于更新
function createNewStatus(previous?: Map<number, Ref<boolean>>) {
    const result = new Map<number, Ref<boolean>>()
    if (!previous) {
        return result
    }
    for (let dir of collectionsDirs.value) {
        if (previous.has(dir.id)) {
            const preValue = previous.get(dir.id)!
            result.set(dir.id, preValue)
        } else {
            result.set(dir.id, ref(false))
        }
    }
    return result
}

// 当文件夹发生变化时，需要更新选中的状态
watch(
    () => collectionsDirs.value,
    () => {
        selectStatus.value = createNewStatus(selectStatus.value)
    },
    { deep: true, immediate: true },
)
// 是否应该显示选择框
const shouldShowSelect = ref(false)

// 是否已经全选中
const isAllSelected = computed(() => {
    let result = true
    for (let value of selectStatus.value.values()) {
        result = result && value.value
    }
    return result
})

// "操作" button: 显示全选
function handleAction(show: boolean) {
    shouldShowSelect.value = show
}

// 设置是否全选
function setAllSelected(selected: boolean) {
    for (let key of selectStatus.value.keys()) {
        selectStatus.value.get(key)!.value = selected
    }
}

// 处理单个子项的点击事件
function handleItemSelect(dirId: number, selected: boolean) {
    selectStatus.value.get(dirId)!.value = selected
}

// ================= 新建收藏集 ================

// 是否显示创建收藏集的信息
const shouldShowCreateDir = ref(false)

interface CreateDirForm {
    name: string
    description: string
    isDefault: boolean
}

// 创建收藏集的 modal
const createDirForm = ref<CreateDirForm>({
    name: '',
    description: '',
    isDefault: false,
})

const rules = reactive<FormRules<CreateDirForm>>({
    name: [
        { required: true, message: '请输入名称', trigger: 'blur' },
        { min: 1, max: 10, message: '长度应该在1到10之间', trigger: 'blur' },
    ],
    description: [{ max: 50, message: '最多50个字', trigger: 'blur' }],
})

// 设置显示
function setShouldShowCreateDir() {
    shouldShowCreateDir.value = true
}
</script>

<template>
    <el-container>
        <el-header>
            <el-space
                direction="horizontal"
                style="margin-top: 8px; justify-content: flex-end; width: 100%"
            >
                <el-input placeholder="搜索已收藏依赖" v-model="searchValue">
                    <template #prefix>
                        <el-icon>
                            <Search />
                        </el-icon>
                    </template>
                    <template #append>
                        <el-button>搜索</el-button>
                    </template>
                </el-input>
                <el-button type="primary" @click="setShouldShowCreateDir">新建收藏集</el-button>
                <el-button
                    type="danger"
                    v-if="shouldShowSelect"
                    @click="setAllSelected(!isAllSelected)"
                    >{{ isAllSelected ? '取消全选' : '全选' }}
                </el-button>
                <el-button
                    :type="shouldShowSelect ? 'info' : 'primary'"
                    @click="handleAction(!shouldShowSelect)"
                    >{{ shouldShowSelect ? '取消' : '选择' }}
                </el-button>
            </el-space>
        </el-header>
        <el-main>
            <el-row :gutter="20" justify="space-between" style="width: 90%; margin: 8px auto">
                <el-col v-for="item in collectionsDirs" :key="item.id" :span="6">
                    <el-card shadow="hover">
                        <template #header>
                            <el-space
                                style="width: 100%; justify-content: space-between; margin: 8px 0"
                            >
                                <el-text size="large" type="primary" style="font-weight: bold"
                                    >{{ item.name }}
                                </el-text>
                                <el-checkbox
                                    :disabled="item.id == 0"
                                    v-if="shouldShowSelect"
                                    :model-value="selectStatus.get(item.id)!.value!"
                                    @change="
                                        (selected) => handleItemSelect(item.id, selected as boolean)
                                    "
                                />
                            </el-space>
                        </template>
                        <template #default>
                            <div style="height: 80px">
                                <el-text>{{ item.description }}</el-text>
                            </div>
                            <el-text type="info">共有 {{ item.collections.length }} 项</el-text>
                        </template>
                    </el-card>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
    <el-dialog
        v-model="shouldShowCreateDir"
        title="新建收藏集"
        draggable
        :show-close="false"
        center
    >
        <el-form :model="createDirForm" label-position="right" label-width="auto" :rules="rules">
            <el-form-item label="收藏集名称" size="large">
                <el-input
                    v-model="createDirForm.name"
                    placeholder="请输入该收藏集的名称，不能重复喔~"
                >
                </el-input>
            </el-form-item>
            <el-form-item label="收藏集描述" size="large">
                <el-input
                    v-model="createDirForm.description"
                    placeholder="请输入该收藏集的描述~"
                    :rows="5"
                    type="textarea"
                >
                </el-input>
            </el-form-item>
            <el-form-item label="设置为默认收藏集" size="large">
                <el-switch v-model="createDirForm.isDefault" />
            </el-form-item>
            <el-form-item>
                <div style="width: 100%; display: flex; justify-content: flex-end">
                    <el-button type="info">取消</el-button>
                    <el-button type="primary">创建</el-button>
                </div>
            </el-form-item>
        </el-form>

        <template #footer></template>
    </el-dialog>
</template>

<style scoped lang="less"></style>
