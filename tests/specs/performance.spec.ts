import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { TestData } from '../utils/test-data';

test.describe('Performance Tests - CCTV Malang', () => {
    
    test('TC-101: Dashboard loads within acceptable time', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        
        const startTime = Date.now();
        await dashboardPage.navigateToDashboard();
        const loadTime = Date.now() - startTime;
        
        console.log(`Page Load Time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(TestData.MAX_PAGE_LOAD_TIME);
    });

    test('TC-102: Search response time acceptable', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.navigateToDashboard();
        
        const startTime = Date.now();
        await dashboardPage.searchCamera(TestData.VALID_SEARCH_TERM);
        const searchTime = Date.now() - startTime;
        
        console.log(`Search Response Time: ${searchTime}ms`);
        expect(searchTime).toBeLessThan(TestData.MAX_SEARCH_TIME);
    });
});
