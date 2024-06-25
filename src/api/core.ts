// import 'utools-api-types';
import { parseMavenArtifactWebContent, parseMavenSearchWebContent } from '@/api/parse'
import axios, { type AxiosInstance } from 'axios'
import type { ArtifactInfo, SearchResult } from '@/api/type'


/**
 * 首次访问 https://mvnrepository.com 需要带上普通浏览器中的请求头；
 * 在本次回应中会有 set-cookie 字段，该字段需要在一段时间的请求中内带上；
 * 否则会触发 403；
 *
 */

axios.defaults.withCredentials = true
// axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'
axios.defaults.headers.common['Accept'] = '*/*'
axios.defaults.headers.common['Content-Encoding'] = 'gzip, deflate, br, zstd'


const Axios = axios.create({
    baseURL: '',
    timeout: 50000,
})


export function fetchMavenSearchWebSite(searchValue: string, pageNo: number = 1): Promise<SearchResult> {
    return new Promise((resolve, reject) => {
        Axios.get('/maven/search', {
            params: {
                q: searchValue, // 搜索内容
                p: pageNo, // 页码
            },
        })
            .then(res => {
                if (res.status == 200) {
                    resolve(parseMavenSearchWebContent(res.data))
                }
            })
            .catch(err => {
                reject(err)
            })
    })
}


/**
 * 查找指定名称的依赖信息
 */
export function fetchMavenArtifactInfo(groupId: string, artifactName: string): Promise<ArtifactInfo> {
    return new Promise((resolve, reject) => {
        Axios.get(`/maven/artifact/${groupId}/${artifactName}`, {})
            .then(res => {
                if (res.status == 200) {
                    resolve(parseMavenArtifactWebContent(res.data))
                }
            })
            .catch(err => {
                reject(err)
            })
    })
}