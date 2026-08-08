import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '../utils/logger';

export class BasePage {
    protected page: Page;
    public url: string = '';
    protected logger: Logger;

    constructor(page: Page) {
        this.page = page;
        this.logger = new Logger(this.constructor.name);
    }

    protected _getSelector(locator: Locator | string): string {
        return typeof locator === 'string' ? locator : String(locator);
    }

    public getUrl(): string {
        return this.page.url();
    }

    async goto(): Promise<void> {
        this.logger.info(`Navigating to ${this.url}`);
        await this.page.goto(this.url, { waitUntil: 'networkidle' });
    }

    async waitForPageLoad(): Promise<void> {
        this.logger.info('Waiting for page load');
        await this.page.waitForLoadState('networkidle');
    }

    async click(locator: Locator | string, options?: any): Promise<void> {
        const selector = this._getSelector(locator);
        this.logger.info(`Clicking element: ${selector}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await element.waitFor({ state: 'visible' });
        await element.click(options);
    }

    async fill(locator: Locator | string, text: string): Promise<void> {
        const selector = this._getSelector(locator);
        this.logger.info(`Filling element: ${selector} with text: ${text}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await element.waitFor({ state: 'visible' });
        await element.fill(text);
    }

    async type(locator: Locator | string, text: string, options?: any): Promise<void> {
        const selector = this._getSelector(locator);
        this.logger.info(`Typing into element: ${selector}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await element.waitFor({ state: 'visible' });
        await element.pressSequentially(text, options);
    }

    async getText(locator: Locator | string): Promise<string> {
        const selector = this._getSelector(locator);
        this.logger.debug(`Getting text from element: ${selector}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await element.waitFor({ state: 'visible' });
        return await element.textContent() || '';
    }

    async getInputValue(locator: Locator | string): Promise<string> {
        const selector = this._getSelector(locator);
        this.logger.debug(`Getting input value from element: ${selector}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await element.waitFor({ state: 'visible' });
        return await element.inputValue();
    }

    async isVisible(locator: Locator | string, timeout?: number): Promise<boolean> {
        const selector = this._getSelector(locator);
        this.logger.debug(`Checking visibility for element: ${selector}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        try {
            await element.waitFor({ state: 'visible', timeout: timeout || 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async exists(locator: Locator | string): Promise<boolean> {
        const selector = this._getSelector(locator);
        this.logger.debug(`Checking existence of element: ${selector}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        const count = await element.count();
        return count > 0;
    }

    async getElementCount(locator: Locator | string): Promise<number> {
        const selector = this._getSelector(locator);
        this.logger.debug(`Getting element count for: ${selector}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        return await element.count();
    }

    async waitForElement(locator: Locator | string, timeout?: number): Promise<void> {
        const selector = this._getSelector(locator);
        this.logger.debug(`Waiting for element: ${selector}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await element.waitFor({ state: 'visible', timeout });
    }

    async waitForElementHidden(locator: Locator | string, timeout?: number): Promise<void> {
        const selector = this._getSelector(locator);
        this.logger.debug(`Waiting for element to be hidden: ${selector}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await element.waitFor({ state: 'hidden', timeout });
    }

    async scrollIntoView(locator: Locator | string): Promise<void> {
        const selector = this._getSelector(locator);
        this.logger.debug(`Scrolling element into view: ${selector}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await element.scrollIntoViewIfNeeded();
    }

    async pressKey(key: string): Promise<void> {
        this.logger.info(`Pressing key: ${key}`);
        await this.page.keyboard.press(key);
    }

    async selectOption(locator: Locator | string, value: string | { value?: string, label?: string, index?: number }): Promise<void> {
        const selector = this._getSelector(locator);
        this.logger.info(`Selecting option in element: ${selector}`);
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await element.waitFor({ state: 'visible' });
        await element.selectOption(value);
    }

    async takeScreenshot(name: string): Promise<void> {
        this.logger.info(`Taking screenshot: ${name}`);
        const timestamp = new Date().getTime();
        await this.page.screenshot({ path: `screenshots/${name}-${timestamp}.png` });
    }

    async assertElementVisible(locator: Locator | string, message?: string): Promise<void> {
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await expect(element, message).toBeVisible();
    }

    async assertElementNotVisible(locator: Locator | string): Promise<void> {
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await expect(element).not.toBeVisible();
    }

    async assertElementContains(locator: Locator | string, text: string): Promise<void> {
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await expect(element).toContainText(text);
    }

    async assertElementText(locator: Locator | string, text: string): Promise<void> {
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await expect(element).toHaveText(text);
    }

    async assertPageUrl(expectedUrl: string | RegExp): Promise<void> {
        await expect(this.page).toHaveURL(expectedUrl);
    }

    async assertPageTitle(expectedTitle: string | RegExp): Promise<void> {
        await expect(this.page).toHaveTitle(expectedTitle);
    }

    async assertElementAttribute(locator: Locator | string, attribute: string, value: string | RegExp): Promise<void> {
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await expect(element).toHaveAttribute(attribute, value);
    }

    async assertElementEnabled(locator: Locator | string): Promise<void> {
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await expect(element).toBeEnabled();
    }

    async assertElementDisabled(locator: Locator | string): Promise<void> {
        const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
        await expect(element).toBeDisabled();
    }

    async close(): Promise<void> {
        this.logger.info('Closing page');
        await this.page.close();
    }
}
