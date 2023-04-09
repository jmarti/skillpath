export class JobOffer {
    private constructor(
        private id: string, 
        private url: string
    ) { }

    public static create(id: string, url: string) {
        return new JobOffer(id, url)
    }
}