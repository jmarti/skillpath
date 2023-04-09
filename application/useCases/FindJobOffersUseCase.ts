import { SiteRepository } from '@domain/SiteRepository'

type FindJobOffersDTO = {
    site: string,
    searchTerm: string
}

export class FindJobOffersUseCase {
    constructor(private siteRepository: SiteRepository) { }

    execute(req: FindJobOffersDTO) {
        return this.siteRepository.findJobOffers(req.site, req.searchTerm)
    }
}