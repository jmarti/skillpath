import { JobOffer } from './JobOffer'

export interface SiteRepository {
    findJobOffers(site: string, searchTerm: string): Promise<Array<JobOffer>>
}