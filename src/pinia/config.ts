import { defineStore } from 'pinia'
import type { LocalDB } from '@/api/type'

export interface CustomUsage {
    /** 模板文本 */
    templateText: string
    /** 这种生成方式的名字 */
    toolName: string
    /** 创建时间 */
    createTimestamp: number
}

export interface Config {
    /** 默认显示的平台名字 */
    defaultToolName: string
    /** 显示的平台名字，第一个是优先级，数字越小优先级越高，即越先显示 */
    showToolsName: Array<[number, string]>
    /** 用户自定义的生成方式 */
    customGenerate: Array<CustomUsage>
}

function testTemplate(template: string): string {
    const result = template.replace(/\${groupId}/g, 'TestGroupId')
    return result
}

// 返回的数据支持的语言
const mavenRepositorySupportToolNames = [
    'Maven',
    'Gradle',
    'GradleKotlin',
    'GradleShort',
    'Grape',
    'Buildr',
    'Sbt',
    'Leiningen',
    'Ivy',
]

const defaultConfig: Config = {
    defaultToolName: 'Maven',
    showToolsName: [
        [0, 'Maven'],
        [1, 'Gradle'],
        [2, 'GradleKotlin'],
        [3, 'GradleShort'],
        [4, 'Grape'],
        [5, 'Buildr'],
        [6, 'Sbt'],
        [7, 'Leiningen'],
        [8, 'Ivy'],
    ],
    customGenerate: [],
}

export const useGlobalConfigStore = defineStore('config', () => {
    const STORAGE_KEY = 'config'

    // ============= state ==============

    const config = ref<Config>()

    /** 插件搜索值 */
    const searchValue = ref('')


    // ============= getters ============



    // ============= actions ============
    /** 存储到 db 中 */
    function save(db: LocalDB) {
        db.setItem(STORAGE_KEY, JSON.stringify(config.value))
    }

    /**
     * 从 db 中加载
     * */
    function load(db: LocalDB) {
        const value = db.getItem(STORAGE_KEY)
        if (value) {
            config.value = JSON.parse(value)
            console.log('loaded:', config.value)
        } else {
            config.value = defaultConfig
            console.log('not loaded and set default config ')
        }
    }

    /** 设置搜索框的值，仅用于插件传值 */
    function setSearchValue(value: string) {
        if (value && value !== searchValue.value) {
            searchValue.value = value
        }
    }

    return {
        config,
        searchValue,
        save,
        load,
        setSearchValue
    }
})
