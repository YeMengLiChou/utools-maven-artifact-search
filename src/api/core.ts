import { get } from './common'
import type { MavenSearchResult } from './type'

/**
 * 查找指定名称的依赖
 *
 */
export function fetchDependencies(value: string): Promise<MavenSearchResult> {
  return get<MavenSearchResult>('/maven/select', {
    params: {
      q: value,
      wt: 'json'
    }
  })
}

export function fetchSpecficAllVersion(artifactName: string, groupId: string, size: number = 20) {
  return get<any>('/maven/select', {
    params: {
      q: `g:${groupId}+AND+a:${artifactName}`,
      core: 'gav',
      wt: 'json',
      rows: size
    }
  });
}
