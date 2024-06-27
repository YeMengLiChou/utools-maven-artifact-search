import type { ArtifactInfo, ArtifactUsage, ArtifactVersion, SearchResult, SearchResultItem } from '@/api/type'


/**
 * 解析出结果数量
 * */
function extractResultSize(value: string): number {
    const matches = value.match(/\d+/)
    return matches ? parseInt(matches[0], 10) : 0
}

/**
 * 提取出对应的序号
 * */
function extractIndex(value: string): number {
    const matches = value.match(/\d+/)
    return matches ? parseInt(matches[0], 10) : 0
}


/**
 * 解析出 div[class="im"] 中 Artifact 的信息
 *
 * */
function extractArtifactInfo(div: Element): SearchResultItem | null {
    const indexElement = div.querySelector('h2.im-title > span')
    // 如果不存在该元素，可能是存在广告元素，跳过
    if (indexElement == null) {
        return null
    }
    // 序号
    const index = extractIndex(indexElement.textContent ?? '')
    // 完整链接
    const link = div.querySelector('a')!.href!
    // 标题名称
    const name = div.querySelector('div.im-header > h2.im-title > a:nth-of-type(1)')!.textContent!

    const subtitlePElement = div.querySelector('div.im-header > p.im-subtitle')!
    // 所属组id
    const groupIdElement = subtitlePElement.querySelector('a:nth-of-type(1)')!
    const groupId = groupIdElement.textContent!
    const groupIdLink = (groupIdElement as HTMLAnchorElement).href!
    // Artifact名字
    const artifactElement = subtitlePElement.querySelector('a:nth-of-type(2)')!
    const artifactName = artifactElement.textContent!

    const descriptionElement = div.querySelector('div.im-description')!
    const innerReleaseElement = descriptionElement.querySelector('div.im-ann')!
    // 因为 textContent 会获取到子元素的值，所以需要先移除
    descriptionElement.removeChild(innerReleaseElement)
    // 描述
    const desc = descriptionElement.textContent!
    // 最新发布时间
    const lastReleaseTime = innerReleaseElement!.textContent!

    return {
        index: index,
        name: name,
        link: link,
        groupIdLink: groupIdLink,
        groupIdName: groupId,
        artifactName: artifactName,
        description: desc,
        lastReleaseTime: lastReleaseTime,
    }
}

/**
 * 解析搜索页面的内容
 * */
export function parseMavenSearchWebContent(html: string): SearchResult {
    const parser = new DOMParser()
    const doc: Document = parser.parseFromString(html, 'text/html')
    const h2: Element = doc.querySelector('body > div.page > main > div.content > h2')!
    const resultSize = extractResultSize(h2?.textContent ?? '')
    const items: Array<SearchResultItem> = []
    doc.querySelectorAll('body > div.page > main > div.content > div.im')
        .forEach((element) => {
            const info = extractArtifactInfo(element)
            if (info != null) {
                items.push(info)
            }
        })

    return {
        total: resultSize,
        data: items,
        pageNo: -1,
    }
}

/**
 * 解析 Artifact 的内容页
 * */
export function parseMavenArtifactWebContent(html: string): ArtifactInfo {
    const parser = new DOMParser()
    const doc: Document = parser.parseFromString(html, 'text/html')
    // 名字
    const title = doc.querySelector('body > div.page > main > div.content > div.im > div.im-header > h2 > a')!.textContent!
    // 描述
    const desc = doc.querySelector('body > div.page > main > div.content > div.im > div.im-description')!.textContent!
    // 顶部的一些信息
    const tableRows = doc.querySelectorAll('body > div.page > main > div.content > table > tbody > tr')
    let categories = ''
    const tags: Array<string> = []
    tableRows.forEach((row) => {
        const key = row.querySelector('th')!.textContent!
        if (key == 'Categories') {
            categories = row.querySelector('td > a')!.textContent!
        } else if (key == 'Tags') {
            const tagsElements = row.querySelectorAll('td > a')
            tagsElements.forEach((tag) => {
                tags.push(tag.textContent!)
            })
        }
    })

    const versionRows = doc.querySelectorAll('#snippets > div > div > div > table > tbody > tr')
    const versionsInfo: Array<ArtifactVersion> = []
    versionRows.forEach((row) => {
        // x.x.x 列, 需要判断是否存在，进行偏移
        const offset = row.querySelector('td:nth-of-type(1) > div') ? 1 : 0
        // 版本
        const version = row.querySelector(`td:nth-of-type(${1 + offset}) > a.vbtn`)!.textContent!
        // 所属仓库
        const repository = row.querySelector(`td:nth-of-type(${3 + offset}) > a.b.lic`)!.textContent!
        // 发布时间
        const date = row.querySelector('td.date')!.textContent!
        versionsInfo.push({
            version: version, repository: repository, releaseDate: date,
        })
    })

    return {
        name: title,
        description: desc,
        categories: categories,
        tags: tags,
        versions: versionsInfo,
    }
}

/**
 * 解析用法
 * */
export function parseMavenArtifactUsageWebContent(html: string): ArtifactUsage {
    const parser = new DOMParser()
    const doc: Document = parser.parseFromString(html, 'text/html')

    const maven = doc.querySelector('#maven-a')!.textContent!
    const gradle = doc.querySelector('#gradle-a')!.textContent!
    const gradleShort = doc.querySelector('#gradle-short-a')!.textContent!
    const gradleKotlin = doc.querySelector('#gradle-short-kotlin-a')!.textContent!
    const sbt = doc.querySelector('#sbt-a')!.textContent!
    const ivy = doc.querySelector('#ivy-a')!.textContent!
    const grape = doc.querySelector('#grape-a')!.textContent!
    const leiningen = doc.querySelector('#leiningen-a')!.textContent!
    const buildr = doc.querySelector('#buildr-a')!.textContent!
    return {
        maven, gradle, gradleKotlin, gradleShort, grape, buildr, sbt, leiningen, ivy
    }
}

