import { JobOffer } from './JobOffer'


export interface JobOfferRepository {
    add(jobOffer: JobOffer): void
}