import { JobOffer } from '@domain/JobOffer'
import { SiteRepository } from '@domain/SiteRepository'
import vanillaPuppeteer from 'puppeteer'
import { Cluster } from 'puppeteer-cluster'
import { addExtra } from 'puppeteer-extra'
import { IndeedScrapingTask } from './IndeedScrapingTask'

export type ScraperSettings = {
    searchUrl: string
    list: {
        listSelector: string,
        listItemsSelector: string,
        nextPageSelector: string
    }
}

export class PuppeteerScraper implements SiteRepository {

    private constructor(private browsersCluster: Cluster) { }

    static async create() {
        const puppeteer = addExtra(vanillaPuppeteer)

        const browsersCluster = await Cluster.launch({
            retryLimit: 5,
            retryDelay: 5000,
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            timeout: 3000000,
            maxConcurrency: 1,
            puppeteer,
            puppeteerOptions: {
                // headless: false,
                slowMo: 250 // in ms
                // args: ['--proxy-server=socks5://127.0.0.1:9050']
            },
            // monitor: true,
            workerCreationDelay: 100
        })
        browsersCluster.on('taskerror', (err, data, willRetry) => {
            if (willRetry) {
                console.warn(`Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried`)
                console.error(err)
            } else {
                console.error(`Failed to crawl ${data}: ${err.message}`)
            }
        })
        return new PuppeteerScraper(browsersCluster)
    }

    async findJobOffers(site: string, searchTerm: string): Promise<Array<JobOffer>> {
        this.browsersCluster.queue({ site, searchTerm }, async (params) => {
            const task = await IndeedScrapingTask.create(params)
            const doTaskIterator = task.doTask()

            while(true) {
                const { value, done } = await doTaskIterator.next()
                console.log(value)
                if (done) return
                doTaskIterator.next()
            }
        })

        return [
            JobOffer.create('id1', 'https://jsodmas.com')
        ]
    }
}