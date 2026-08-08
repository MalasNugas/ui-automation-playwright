import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { TestData } from '../utils/test-data';

test.describe('Dashboard Tests - CCTV Malang', () => {
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        dashboardPage = new DashboardPage(page);
        await dashboardPage.navigateToDashboard();
    });

    // Positive Flow Tests
    test('TC-001: Verify dashboard loads with all core elements', async () => {
        await dashboardPage.verifyDashboardLoaded();
        const cameraCount = await dashboardPage.getCameraCount();
        expect(cameraCount).toBeGreaterThanOrEqual(TestData.EXPECTED_MIN_CAMERAS);
    });

    test('TC-002: Search for camera successfully', async () => {
        await dashboardPage.searchCamera(TestData.VALID_SEARCH_TERM);
        const resultCount = await dashboardPage.getSearchResultsCount();
        expect(resultCount).toBeGreaterThan(0);
    });

    test('TC-003: Click camera to view details', async () => {
        const initialUrl = dashboardPage.getUrl();
        const cameraCount = await dashboardPage.getCameraCount();
        if (cameraCount > 0) {
            await dashboardPage.clickCameraByIndex(0);
            const currentUrl = dashboardPage.getUrl();
            expect(currentUrl).not.toEqual(initialUrl);
        }
    });

    test('TC-004: Verify page title and navigation elements', async () => {
        const titleVisible = await dashboardPage.isVisible(dashboardPage.pageTitle);
        expect(titleVisible).toBeTruthy();
        
        const navLinksCount = await dashboardPage.getElementCount(dashboardPage.navLinks);
        expect(navLinksCount).toBeGreaterThan(0);
    });

    test('TC-005: Verify multiple cameras displayed with information', async () => {
        const count = await dashboardPage.getCameraCount();
        expect(count).toBeGreaterThan(0);

        if (count > 0) {
            const details = await dashboardPage.getCameraDetails(0);
            expect(details.name).toBeTruthy();
        }
    });

    // Negative Flow Tests
    test('TC-006: Search with invalid term shows no results', async () => {
        await dashboardPage.searchCamera(TestData.INVALID_SEARCH_TERM);
        try {
            await dashboardPage.verifyNoResultsMessage();
        } catch {
            const resultCount = await dashboardPage.getSearchResultsCount();
            expect(resultCount).toBe(0);
        }
    });

    test('TC-007: Clear search and return to full list', async () => {
        const initialCount = await dashboardPage.getCameraCount();
        
        await dashboardPage.searchCamera('RandomTerm');
        await dashboardPage.clearSearch();
        
        const countAfterClear = await dashboardPage.getCameraCount();
        expect(countAfterClear).toBeGreaterThanOrEqual(initialCount);
    });

    // Edge Case Tests
    test('TC-008: Perform multiple searches in sequence', async () => {
        const searchTerms = ['CCTV', 'Jalan', '001'];
        for (const term of searchTerms) {
            await dashboardPage.searchCamera(term);
            const results = await dashboardPage.getSearchResultsCount();
            expect(results).toBeGreaterThanOrEqual(0);
            await dashboardPage.clearSearch();
        }
    });
});
