export type MavenSearchResult = {
  responseHeader: {
    status: number
    QTime: number
    params: {
      q: string
      core: string
      defType: string
      df: string
      indent: string
      spellcheck: string
      fl: string
      start: string
      'spellcheck.count': string
      sort: string
      rows: string
      wt: string
      version: string
    }
  }
  response: {
    numberFound: number
    start: 0
    docs: Array<{
      id: string
      g: string
      a: string
      latestVersion: string
      repositoryId: string
      p: string
      timestamp: string
      versionCount: number
      text: Array<string>
      ec: Array<string>
    }>
  }
  spellcheck: {
    suggestion: Array<any>
  }
}
