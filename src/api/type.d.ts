/**
 * 单个搜索结果
 * */
export type SearchResultItem = {
    index: number,
    artifactName: string,
    groupIdName: string,
    groupIdLink: string,
    lastReleaseTime: string,
    name: string,
    link: string,
    description: string,
};

export type SearchResult = {
    total: number,
    pageNo: number,
    data: Array<SearchResultItem>
};


export type ArtifactVersion = {
    version: string,
    repository: string,
    releaseDate: string,
}

export type ArtifactInfo = {
    name: string,
    description: string,
    categories: string,
    tags: Array<string>,
    versions: Array<ArtifactVersion>,
}

export type ArtifactUsage = {
    maven: string,
    gradle: string,
    gradleShort: string,
    gradleKotlin: string,
    sbt: string,
    ivy: string,
    grape: string,
    leiningen: string,
    buildr: string,
}