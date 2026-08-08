import { BasePage } from './base.page';
import { Page, Locator } from '@playwright/test';

export class DashboardPage extends BasePage {
    public url = 'https://cctv.malangkota.go.id/';

    readonly pageTitle: Locator;
    readonly mainLogo: Locator;
    readonly navigationMenu: Locator;
    readonly navLinks: Locator;
    readonly searchButton: Locator;
    readonly searchInput: Locator;
    readonly searchResults: Locator;
    readonly cameraCards: Locator;
    readonly cameraTitle: Locator;
    readonly cameraStatus: Locator;
    readonly cameraLocation: Locator;
    readonly filterButton: Locator;
    readonly sortDropdown: Locator;
    readonly statusFilter: Locator;
    readonly nextPageBtn: Locator;
    readonly prevPageBtn: Locator;
    readonly pageInfo: Locator;
    readonly modalDialog: Locator;
    readonly closeModalBtn: Locator;
    readonly errorMessage: Locator;
    readonly noResultsMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.pageTitle = page.locator('h1, .header-title, [role="heading"]').first();
        this.mainLogo = page.locator('img.logo, [data-testid="logo"], img[alt*="logo" i]').first();
        this.navigationMenu = page.locator('nav, [role="navigation"]');
        this.navLinks = page.locator('nav a, [role="navigation"] a');
        this.searchButton = page.locator('button[aria-label*="search" i], button[type="submit"], .search-btn').first();
        this.searchInput = page.locator('input[placeholder*="search" i], input[type="text"]').first();
        this.searchResults = page.locator('.search-result, .results-container');
        this.cameraCards = page.locator('.camera-card, [data-testid="camera-card"], .card, .bg-white.rounded-lg').filter({ hasText: '' });
        this.cameraTitle = page.locator('.camera-title, h3, .card-title, .font-bold');
        this.cameraStatus = page.locator('.status-badge, .badge, [data-testid="status"]');
        this.cameraLocation = page.locator('.location, .address, [data-testid="location"]');
        this.filterButton = page.locator('button:has-text("Filter"), [aria-label="filter"]');
        this.sortDropdown = page.locator('select.sort-dropdown, [aria-label="sort"]');
        this.statusFilter = page.locator('select.status-filter, [aria-label="status filter"]');
        this.nextPageBtn = page.locator('button[aria-label="next page" i], .pagination-next');
        this.prevPageBtn = page.locator('button[aria-label="previous page" i], .pagination-prev');
        this.pageInfo = page.locator('.pagination-info, .page-stats');
        this.modalDialog = page.locator('.modal, [role="dialog"]');
        this.closeModalBtn = page.locator('.close-btn, button[aria-label="close" i]');
        this.errorMessage = page.locator('.error-message, .alert-danger');
        this.noResultsMessage = page.locator('text=No results, .no-results, text=tidak ditemukan');
    }

    async navigateToDashboard(): Promise<void> {
        await this.goto();
        await this.waitForPageLoad();
    }

    async verifyDashboardLoaded(): Promise<void> {
        this.logger.info('Verifying dashboard is loaded');
        await this.assertElementVisible(this.pageTitle, 'Page title should be visible');
        await this.assertElementVisible(this.navigationMenu, 'Navigation menu should be visible');
    }

    async verifyPageTitle(expectedTitle: string | RegExp): Promise<void> {
        this.logger.info(`Verifying page title matches: ${expectedTitle}`);
        await this.assertPageTitle(expectedTitle);
    }

    async searchCamera(cameraName: string): Promise<void> {
        this.logger.info(`Searching for camera: ${cameraName}`);
        await this.fill(this.searchInput, cameraName);
        await this.pressKey('Enter');
        await this.waitForPageLoad();
        await this.page.waitForTimeout(1000); 
    }

    async clearSearch(): Promise<void> {
        this.logger.info('Clearing search input');
        await this.fill(this.searchInput, '');
        await this.pressKey('Enter');
        await this.waitForPageLoad();
        await this.page.waitForTimeout(1000);
    }

    async getSearchResultsCount(): Promise<number> {
        this.logger.info('Getting search results count');
        return await this.cameraCards.count();
    }

    async verifySearchResultsContain(text: string): Promise<void> {
        this.logger.info(`Verifying search results contain text: ${text}`);
        const count = await this.cameraCards.count();
        if (count > 0) {
            await this.assertElementContains(this.cameraCards.first(), text);
        }
    }

    async getCameraCount(): Promise<number> {
        this.logger.info('Getting total camera count on page');
        return await this.cameraCards.count();
    }

    async getCameraNames(): Promise<string[]> {
        this.logger.info('Getting all camera names');
        const count = await this.cameraCards.count();
        const names: string[] = [];
        for (let i = 0; i < count; i++) {
            const text = await this.cameraCards.nth(i).locator(this.cameraTitle).textContent();
            if (text) names.push(text.trim());
        }
        return names;
    }

    async clickCameraByIndex(index: number): Promise<void> {
        this.logger.info(`Clicking camera at index: ${index}`);
        await this.cameraCards.nth(index).click();
        await this.waitForPageLoad();
    }

    async clickCameraByName(cameraName: string): Promise<void> {
        this.logger.info(`Clicking camera by name: ${cameraName}`);
        const camera = this.cameraCards.filter({ hasText: cameraName }).first();
        await camera.click();
        await this.waitForPageLoad();
    }

    async getCameraDetails(index: number): Promise<{name: string, location: string, status: string}> {
        this.logger.info(`Getting camera details for index: ${index}`);
        const card = this.cameraCards.nth(index);
        const name = await card.locator(this.cameraTitle).first().textContent() || '';
        const location = await card.locator(this.cameraLocation).first().textContent() || '';
        const status = await card.locator(this.cameraStatus).first().textContent() || '';
        
        return {
            name: name.trim(),
            location: location.trim(),
            status: status.trim()
        };
    }

    async filterByStatus(status: string): Promise<void> {
        this.logger.info(`Filtering by status: ${status}`);
        if (await this.isVisible(this.filterButton)) {
            await this.click(this.filterButton);
        }
        await this.selectOption(this.statusFilter, status);
        await this.waitForPageLoad();
    }

    async sortBy(sortOption: string): Promise<void> {
        this.logger.info(`Sorting by: ${sortOption}`);
        await this.selectOption(this.sortDropdown, sortOption);
        await this.waitForPageLoad();
    }

    async resetFilters(): Promise<void> {
        this.logger.info('Resetting filters');
        if (await this.isVisible('button:has-text("Reset")')) {
            await this.click('button:has-text("Reset")');
            await this.waitForPageLoad();
        }
    }

    async goToNextPage(): Promise<void> {
        this.logger.info('Going to next page');
        if (await this.isVisible(this.nextPageBtn)) {
            await this.click(this.nextPageBtn);
            await this.waitForPageLoad();
        }
    }

    async goToPreviousPage(): Promise<void> {
        this.logger.info('Going to previous page');
        if (await this.isVisible(this.prevPageBtn)) {
            await this.click(this.prevPageBtn);
            await this.waitForPageLoad();
        }
    }

    async verifyErrorMessage(expectedMessage: string): Promise<void> {
        this.logger.info(`Verifying error message: ${expectedMessage}`);
        await this.assertElementVisible(this.errorMessage);
        await this.assertElementContains(this.errorMessage, expectedMessage);
    }

    async verifyNoResultsMessage(): Promise<void> {
        this.logger.info('Verifying no results message is shown');
        await this.assertElementVisible(this.noResultsMessage);
    }

    async handleError(): Promise<void> {
        this.logger.info('Handling error if any');
        if (await this.isVisible(this.errorMessage, 2000)) {
            this.logger.warn('Error message found on page');
        }
    }

    async closeModal(): Promise<void> {
        this.logger.info('Closing modal if open');
        if (await this.isVisible(this.modalDialog, 2000)) {
            await this.click(this.closeModalBtn);
        }
    }

    async scrollToBottom(): Promise<void> {
        this.logger.info('Scrolling to bottom of the page');
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.waitForPageLoad();
    }
}
