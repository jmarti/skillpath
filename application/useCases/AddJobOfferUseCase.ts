import { JobOffer } from '@domain/JobOffer'
import { JobOfferRepository } from '@domain/JobOfferRepository'

type AddJobOfferDTO = {
    id: string
    url: string
}

export class AddJobOfferUseCase {
    constructor(private jobOfferRepository: JobOfferRepository) { }

    execute(req: AddJobOfferDTO) {
        const jobOffer = JobOffer.create(
            req.id,
            req.url
        )

        this.jobOfferRepository.add(jobOffer)
    }
}