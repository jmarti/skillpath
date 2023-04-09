import { BrowserContext, Page } from 'puppeteer'
import UserAgent from 'user-agents'

export class PageFactory {
    public static async newPage(browserContext: BrowserContext): Promise<Page> {
        const page = await browserContext.newPage()
        await page.setRequestInterception(true)
        const userAgent = new UserAgent({ deviceCategory: 'desktop' })
        page.setUserAgent(userAgent.toString())
        page.on('request', async (req) => {
            if (
                req.resourceType() == 'font' ||
                req.resourceType() == 'image'
            ) {
                req.abort()
            } else {
                req.continue()
            }
        })
        page.on('domcontentloaded', () => {
            console.log('DOM loaded.')
        })
        return page
    }
}