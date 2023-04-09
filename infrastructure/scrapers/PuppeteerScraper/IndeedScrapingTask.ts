import { BrowserContext, ElementHandle, Page } from 'puppeteer'

import { ScraperSettings } from './PuppeteerScraper'
import { PageFactory } from './PageFactory'

type ScrapingTaskParams = {
    page: Page
    data: {
        site: string
        searchTerm: string
    }
    worker: {
        id: number
    }
}

const settings: ScraperSettings = {
    searchUrl: 'https://co.indeed.com/jobs?q=%SEARCH_TERM%',
    list: {
        listSelector: '#mosaic-jobResults',
        listItemsSelector: 'ul.jobsearch-ResultsList > li > .result',
        nextPageSelector: '[data-testid="pagination-page-next"]'
    }
}

export class IndeedScrapingTask {
    private page: Page
    private constructor(
        private browserContext: BrowserContext,
        private readonly asignedWorkerId: number,
        private readonly searchTerm: string
    ) { }

    private async clickNextPageLink() {
        await Promise.all([
            this.page.waitForNavigation(),
            this.page.click(settings.list.nextPageSelector),
        ])
        await this.page.waitForSelector(settings.list.listSelector)
        console.log('foo')
    }

    private async scrapeItem(item: ElementHandle) {
        const reference = await (await item.$('h2.jobTitle > a'))?.evaluate(node => node.dataset.jk)
        const title = await (await item.$('h2.jobTitle'))?.evaluate(node => node.textContent)
        const companyName = await (await item.$('.companyName'))?.evaluate(node => node.textContent)
        const url = await (await item.$('h2.jobTitle > a'))?.evaluate(node => node.href)
        const countryCode = 'CO'
        const grossSalary = await (await item.$('.salary-snippet-container'))?.evaluate(node => node.textContent)
        const location = await (await item.$('.companyLocation'))?.evaluate(node => node.textContent)


        await item.$eval('a', (b) => b.click())
        await new Promise(r => setTimeout(r, 200))
        await this.page.waitForSelector('#jobDescriptionText')
        const description = await (await this.page.$('#jobDescriptionText'))?.evaluate(node => node.textContent)
    
        return {
            reference,
            title,
            url,
            companyName,
            countryCode,
            grossSalary,
            location,
            description
        }
    }

    private async * scrapeList() {
        const listItems = await this.page.$$(settings.list.listItemsSelector)

        for (const [i, item] of listItems.entries()) {
            const itemData = this.scrapeItem(item)

            if (i === listItems.length - 1) {
                return itemData
            }
            
            yield itemData
        }
    }

    public async * doTask() {
        this.page = await PageFactory.newPage(this.browserContext)
        await this.page.goto(settings.searchUrl.replace('%SEARCH_TERM%', this.searchTerm))
        await this.page.waitForSelector(settings.list.listSelector)
        const listIterator = this.scrapeList()

        while (true) {
            const { value, done } = await listIterator.next()
            
            if (done) return value
            yield value
        }
        // await this.clickNextPageLink()
        console.log(`Worker ${this.asignedWorkerId} is free now!`)
    }

    static async create(taskParams: ScrapingTaskParams) {
        const { page, data, worker } = taskParams
        const browser = page.browser()
        const proxyServer = browser.process()?.spawnargs.find(it => it.startsWith("--proxy-server"))?.split("=")[1] || undefined
        const browserContext = await browser.createIncognitoBrowserContext({ proxyServer })
        return new IndeedScrapingTask(browserContext, worker.id, data.searchTerm)
    }
}