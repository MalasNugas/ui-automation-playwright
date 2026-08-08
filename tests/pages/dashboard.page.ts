import { BasePage } from './base.page';
import { Page, Locator, expect } from '@playwright/test';

/**
 * DashboardPage - Page Object for CCTV Malang Map Dashboard
 * 
 * The site is a Leaflet-based interactive map showing CCTV camera clusters
 * across Kota Malang. Key UI elements:
 * - Kecamatan dropdown filter (SELURUH KECAMATAN, BLIMBING, KLOJEN, etc.)
 * - Location search input with search button
 * - Leaflet map with cluster markers (numbers showing camera count per area)
 * - Map controls (zoom in/out)
 * - Government logos at bottom-left
 */
export class DashboardPage extends BasePage {
    public url = 'https://cctv.malangkota.go.id/';

    // =========================================================================
    // LOCATORS - Based on actual CCTV Malang UI
    // =========================================================================

    // Kecamatan (District) Filter Dropdown
    readonly kecamatanDropdown: Locator;

    // Search Section
    readonly searchInput: Locator;
    readonly searchButton: Locator;

    // Map Elements (Leaflet)
    readonly mapContainer: Locator;
    readonly clusterMarkers: Locator;
    readonly mapPopup: Locator;
    readonly mapPopupContent: Locator;
    readonly mapPopupCloseButton: Locator;

    // Map Controls
    readonly zoomInButton: Locator;
    readonly zoomOutButton: Locator;

    // Logo / Branding
    readonly governmentLogos: Locator;

    // Leaflet Attribution
    readonly leafletAttribution: Locator;

    constructor(page: Page) {
        super(page);

        // Kecamatan dropdown - the <select> element for district filtering
        this.kecamatanDropdown = page.locator('select').first();

        // Search input and button
        this.searchInput = page.locator('input[placeholder*="Cari" i], input[type="text"]').first();
        this.searchButton = page.locator('button:near(input)').first();

        // Leaflet map container
        this.mapContainer = page.locator('.leaflet-container').first();

        // Cluster markers on the map (Leaflet marker cluster icons with numbers)
        this.clusterMarkers = page.locator('.leaflet-marker-icon');

        // Map popup (appears when clicking a marker)
        this.mapPopup = page.locator('.leaflet-popup');
        this.mapPopupContent = page.locator('.leaflet-popup-content');
        this.mapPopupCloseButton = page.locator('.leaflet-popup-close-button');

        // Zoom controls
        this.zoomInButton = page.locator('.leaflet-control-zoom-in');
        this.zoomOutButton = page.locator('.leaflet-control-zoom-out');

        // Government logos at the bottom
        this.governmentLogos = page.locator('img[src*="logo"], img[alt*="logo" i], img[alt*="malang" i]');

        // Leaflet attribution
        this.leafletAttribution = page.locator('.leaflet-control-attribution');
    }

    // =========================================================================
    // NAVIGATION & PAGE SETUP
    // =========================================================================

    /**
     * Navigate to the CCTV Malang dashboard
     */
    async navigateToDashboard(): Promise<void> {
        this.logger.info('Navigating to CCTV Malang dashboard...');
        await this.goto();
        await this.waitForPageLoad();
    }

    /**
     * Verify dashboard is loaded with all main elements:
     * - Map container visible
     * - Kecamatan dropdown visible
     * - Search input visible
     * - Cluster markers rendered on map
     */
    async verifyDashboardLoaded(): Promise<void> {
        this.logger.info('Verifying dashboard is fully loaded...');
        await this.assertElementVisible(this.mapContainer);
        await this.assertElementVisible(this.kecamatanDropdown);
        await this.assertElementVisible(this.searchInput);
        this.logger.info('✓ Dashboard loaded successfully');
    }

    // =========================================================================
    // KECAMATAN (DISTRICT) FILTER
    // =========================================================================

    /**
     * Select a kecamatan (district) from the dropdown
     * Options: SELURUH KECAMATAN, BLIMBING, KLOJEN, KEDUNGKANDANG, SUKUN, LOWOKWARU
     */
    async selectKecamatan(kecamatan: string): Promise<void> {
        this.logger.info(`Selecting kecamatan: ${kecamatan}`);
        await this.kecamatanDropdown.selectOption({ label: kecamatan });
        // Wait for map to update after filter change
        await this.page.waitForTimeout(1500);
    }

    /**
     * Get currently selected kecamatan
     */
    async getSelectedKecamatan(): Promise<string> {
        const value = await this.kecamatanDropdown.inputValue();
        this.logger.info(`Currently selected kecamatan value: ${value}`);
        return value;
    }

    /**
     * Get all available kecamatan options
     */
    async getKecamatanOptions(): Promise<string[]> {
        const options = await this.kecamatanDropdown.locator('option').allTextContents();
        this.logger.info(`Available kecamatan options: ${options.join(', ')}`);
        return options;
    }

    /**
     * Reset kecamatan filter to show all districts
     */
    async resetKecamatanFilter(): Promise<void> {
        this.logger.info('Resetting kecamatan filter to SELURUH KECAMATAN');
        await this.kecamatanDropdown.selectOption({ index: 0 });
        await this.page.waitForTimeout(1500);
    }

    // =========================================================================
    // SEARCH FUNCTIONALITY
    // =========================================================================

    /**
     * Search for a location on the map
     */
    async searchLocation(locationName: string): Promise<void> {
        this.logger.info(`Searching for location: ${locationName}`);
        await this.searchInput.fill(locationName);
        await this.searchButton.click();
        // Wait for map to pan/zoom to location
        await this.page.waitForTimeout(1500);
    }

    /**
     * Clear the search input
     */
    async clearSearch(): Promise<void> {
        this.logger.info('Clearing search input');
        await this.searchInput.fill('');
        await this.page.waitForTimeout(500);
    }

    /**
     * Get current search input value
     */
    async getSearchInputValue(): Promise<string> {
        return await this.searchInput.inputValue();
    }

    // =========================================================================
    // MAP INTERACTION
    // =========================================================================

    /**
     * Get the number of marker clusters visible on the map
     */
    async getClusterMarkerCount(): Promise<number> {
        const count = await this.clusterMarkers.count();
        this.logger.info(`Found ${count} cluster markers on map`);
        return count;
    }

    /**
     * Click on a specific cluster marker by index
     */
    async clickClusterMarker(index: number): Promise<void> {
        this.logger.info(`Clicking cluster marker at index: ${index}`);
        await this.clusterMarkers.nth(index).click();
        await this.page.waitForTimeout(1000);
    }

    /**
     * Check if a map popup is currently visible
     */
    async isPopupVisible(): Promise<boolean> {
        return await this.isVisible(this.mapPopup, 3000);
    }

    /**
     * Get popup content text
     */
    async getPopupContent(): Promise<string> {
        if (await this.isPopupVisible()) {
            const text = await this.mapPopupContent.textContent();
            return text?.trim() || '';
        }
        return '';
    }

    /**
     * Close the currently open popup
     */
    async closePopup(): Promise<void> {
        if (await this.isPopupVisible()) {
            this.logger.info('Closing map popup');
            await this.mapPopupCloseButton.click();
        }
    }

    /**
     * Zoom in on the map
     */
    async zoomIn(clicks: number = 1): Promise<void> {
        this.logger.info(`Zooming in ${clicks} time(s)`);
        for (let i = 0; i < clicks; i++) {
            await this.zoomInButton.click();
            await this.page.waitForTimeout(500);
        }
    }

    /**
     * Zoom out on the map
     */
    async zoomOut(clicks: number = 1): Promise<void> {
        this.logger.info(`Zooming out ${clicks} time(s)`);
        for (let i = 0; i < clicks; i++) {
            await this.zoomOutButton.click();
            await this.page.waitForTimeout(500);
        }
    }

    /**
     * Get the count of markers after zooming (markers may split or merge)
     */
    async getMarkerCountAfterZoom(): Promise<number> {
        await this.page.waitForTimeout(1000);
        return await this.getClusterMarkerCount();
    }

    // =========================================================================
    // VERIFICATION METHODS
    // =========================================================================

    /**
     * Verify map controls are visible (zoom in/out)
     */
    async verifyMapControlsVisible(): Promise<void> {
        this.logger.info('Verifying map controls are visible');
        await this.assertElementVisible(this.zoomInButton);
        await this.assertElementVisible(this.zoomOutButton);
    }

    /**
     * Verify Leaflet attribution is present
     */
    async verifyMapAttribution(): Promise<void> {
        this.logger.info('Verifying map attribution');
        await this.assertElementVisible(this.leafletAttribution);
    }

    /**
     * Verify government logos are displayed
     */
    async verifyLogosDisplayed(): Promise<void> {
        this.logger.info('Verifying government logos');
        const logoCount = await this.governmentLogos.count();
        expect(logoCount).toBeGreaterThan(0);
    }
}
