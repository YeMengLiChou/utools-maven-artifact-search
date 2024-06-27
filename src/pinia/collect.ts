import { defineStore } from 'pinia'
import type { LocalDB } from '@/api/type'

export type Collection = {
    /** 加入收藏的时间 */
    createTimestamp: number

    /** 对应的 Artifact 的 GroupId */
    groupId: string

    /** 对应的 Artifact 的 name */
    artifactName: string

    /** 对应的 Artifact 的 version */
    version: string

    /** 对应的 Artifact 的类似 runtime 这种,以 Maven 的为准 */
    action: string

    /** 使用方式 */
    usage: string

    id: number
}

// 文件夹
export type CollectionDirectory = {
    /** 创建时间 */
    createTimestamp: number

    /** 最近更新时间 */
    updateTimestamp: number

    /** 标识符 */
    id: number

    /** 名字，位移 */
    name: string

    /** 描述 */
    description: string

    /** 是否设置为默认，默认加入该文件夹 */
    isDefault: boolean

    /** 内部收藏子项 */
    collections: Array<Collection>
}

const DefaultCollectDirId = 1

// 默认的收藏集
const DefaultCollectDirectory: CollectionDirectory = {
    createTimestamp: -1,
    updateTimestamp: -1,
    id: DefaultCollectDirId,
    name: '我的收藏集',
    description: '默认的收藏集',
    isDefault: true,
    collections: [],
}

export const useCollectionStore = defineStore('collect', () => {
    const COLLECTION_KEY = 'collections'
    const COLLECTION_IDS_KEY = 'collections_ids'

    // 所有文本
    const collectionDirs = ref<Array<CollectionDirectory>>([])
    const collectionIds = ref<Set<number>>(new Set())

    const collectionMaxId = ref(0)
    const collectionDefaultDirId = ref(-1)

    let localDB: LocalDB | undefined = undefined

    // 设置存储的对象位置
    function setLocalDB(db: LocalDB) {
        localDB = db
    }

    // 从存储对象中加载存储内容
    function load(db: LocalDB) {
        // 读取 collections
        const value = db.getItem(COLLECTION_KEY)
        if (value == null) {
            collectionDirs.value.push(DefaultCollectDirectory)
        } else {
            const collections = JSON.parse(value) as Array<CollectionDirectory>
            collectionDirs.value.push(...collections)
        }
        // 读取 ids
        const idsValue = db.getItem(COLLECTION_IDS_KEY)
        if (idsValue) {
            collectionIds.value = JSON.parse(idsValue) as Set<number>
        } else {
            for (let dir of collectionDirs.value) {
                for (let collection of dir.collections) {
                    collectionIds.value.add(collection.id)
                }
                // 更新默认文件夹的id
                if (dir.isDefault) {
                    collectionDefaultDirId.value = dir.id
                }
            }
        }
        for (let id of collectionIds.value) {
            collectionMaxId.value = Math.max(id, collectionMaxId.value)
        }
    }

    /**
     * 创建新的收藏
     * */
    function createCollection(
        groupId: string,
        artifactName: string,
        version: string,
        action: string,
        usage: string,
    ): Collection {
        return {
            groupId,
            artifactName,
            version,
            action,
            usage,
            createTimestamp: new Date().getMilliseconds(),
            id: ++collectionMaxId.value,
        }
    }

    /**
     * 保存到db中
     * */
    function save() {
        localDB?.setItem(COLLECTION_KEY, JSON.stringify(collectionDirs.value))
        localDB?.setItem(COLLECTION_IDS_KEY, JSON.stringify(collectionIds.value))
    }

    /**
     * 查找 dirId 对应的对象
     * */
    function findDistDir(dirId: number): CollectionDirectory | null {
        let distDir: CollectionDirectory | null = null
        for (let dir of collectionDirs.value) {
            if (dir.id == dirId) {
                distDir = dir
                break
            }
        }
        return distDir
    }

    /**
     * 新建收藏集
     * */
    function createCollectionDir(name: string, description: string, isDefault: boolean) {
        let id = 1
        for (let dir of collectionDirs.value) {
            id = Math.max(dir.id, id)
        }
        id++
        const time = new Date().getMilliseconds()
        const collection: CollectionDirectory = {
            collections: [],
            createTimestamp: time,
            description: description,
            id: id,
            isDefault: isDefault,
            name: name,
            updateTimestamp: time,
        }
        // 如果是默认的，就将原本为默认的取消
        if (isDefault) {
            for (let dir of collectionDirs.value) {
                if (dir.isDefault) {
                    dir.isDefault = false
                    break
                }
            }
            collectionDefaultDirId.value = collection.id
        }
        collectionDirs.value.push(collection)

        save()
    }

    /**
     * 移除多个文件夹
     * */
    function removeCollectionDirs(...ids: number[]) {
        const removeIds = new Set<number>()
        ids.forEach((id) => removeIds.add(id))
        collectionDirs.value = collectionDirs.value.filter((dir) => {
            return !removeIds.has(dir.id)
        })
        // 更新默认值
        if (removeIds.has(collectionDefaultDirId.value)) {
            const defaultDir = findDistDir(DefaultCollectDirId)
            if (!defaultDir) {
                throw new Error('系统默认文件夹不存在！')
            }
            defaultDir.isDefault = true
            collectionDefaultDirId.value = DefaultCollectDirId
        }
        save()
    }

    /**
     * 添加到默认的收藏集中
     * */
    function addCollectionToDefaultDir(collection: Collection) {
        if (collectionDefaultDirId.value == -1) {
            throw new Error('未设置默认文件夹!')
        }
        addCollectionToDir(collectionDefaultDirId.value, collection)
    }

    /**
     * 添加新的 collection
     * */
    function addCollectionToDir(dir: number, collection: Collection) {
        let distDir = findDistDir(dir)

        if (!distDir) {
            throw new Error('不存在该收藏集' + dir)
        }
        distDir.collections.push(collection)
        save()
    }

    /**
     * 从指定收藏集移除指定的 collection
     * */
    function removeCollectionFrom(dirId: number, collectId: number) {
        const distDir = findDistDir(dirId)
        if (!distDir) {
            throw new Error('不存在该收藏集' + dirId)
        }
        distDir.collections = distDir.collections.filter((item) => {
            return item.id != collectId
        })
        save()
    }

    /**
     * 判断某个Artifact 是否收藏了
     * */
    function isArtifactCollected(groupId: string, artifactName: string, version: string): boolean {
        for (let dir of collectionDirs.value) {
            for (let collection of dir.collections) {
                if (
                    collection.version != version ||
                    collection.artifactName != artifactName ||
                    collection.groupId != groupId
                ) {
                    continue
                }
                return true
            }
        }
        return false
    }

    return {
        collectionDirs,
    }
})
