import type { LocalDB } from '@/api/type'

export const BrowserDB: LocalDB = {
    getItem(key: string): string | null {
        return window.localStorage.getItem(key)
    },

    setItem(key: string, value: string): void {
        window.localStorage.setItem(key, value)
    },

    removeItem(key: string) {
        window.localStorage.removeItem(key)
    },

    clear() {
        window.localStorage.clear()
    },
}

export const UtoolsDB: LocalDB = {
    clear() {},

    getItem(key: string): string | null {
        return window.utools.dbStorage.getItem(key)
    },
    removeItem(key: string) {
        window.utools.dbStorage.removeItem(key)
    },
    setItem(key: string, value: string): void {
        window.utools.dbStorage.setItem(key, value)
    },
}

/**
 * 其他设备上的数据更改后同步到此处
 * */
export const onDbPull = (callback: () => void) => {
    window.utools.onDbPull(callback)
}

/**
 * 当插件退出时回调
 * */
export const onPluginOut = (callback: (processExit: boolean) => void) => {
    window.utools.onPluginOut(callback)
}

export type PluginEnterConfig = {
    code: string
    type: string
    payload: any
    option: any
}

/**
 * 当插件进入时回调
 * */
export const onPluginEnter = (callback: (config: PluginEnterConfig) => void) => {
    window.utools.onPluginEnter(callback)
}
