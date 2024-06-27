import { defineStore } from 'pinia'


export type Collection = {
    /** 加入收藏的时间 */
    createTimestamp: number,

    /** 对应的 Artifact 的 GroupId */
    groupId: string,

    /** 对应的 Artifact 的 name */
    artifactName: string,

    /** 对应的 Artifact 的 version */
    version: string
}

// 没有版本的收藏，也就是整个 artifact 进行设置
export type NoVersionCollection = Omit<Collection, 'version'> & {

}

export type VersionCollection = Collection & {

}


export const useCollectionStore = defineStore('collect', () => {




    return {

    }
})
