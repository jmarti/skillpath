import { FindJobOffersUseCase } from './application/useCases/FindJobOffersUseCase'
import { PuppeteerScraper } from './infrastructure/scrapers/PuppeteerScraper'

;(async function() {
    const siteRepo = await PuppeteerScraper.create()
    const findJobUseCase = new FindJobOffersUseCase(siteRepo)
    findJobUseCase.execute({ site: 'co.indeed.com', searchTerm: 'frontend'})
})()