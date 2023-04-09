export class Site {
    constructor(private _searchUrl: string) { }

    get searchUrl() {
        return this._searchUrl
    }

    static create(searchUrl: string) {
        return new Site(searchUrl)
    }
}