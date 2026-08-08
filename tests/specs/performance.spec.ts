import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Performance Tests - CCTV Malang', () => {
    
    /**
     * TC-101: Dashboard loads within acceptable time
     * Threshold: 15 seconds (site loads map tiles from external servers)
     */
    test('TC-101: Dashboard loads within acceptable time', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        const maxLoadTime = 15000; // 15 seconds (map + tiles + markers)
        
        const startTime = Date.now();
        await dashboardPage.navigateToDashboard();
        const loadTime = Date.now() - startTime;
        
        console.log(`✓ Page Load Time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(maxLoadTime);
    });

    /**
     * TC-102: Search response time acceptable
     * Threshold: 5 seconds for search interaction
     */
    test('TC-102: Search response time acceptable', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        const maxSearchTime = 5000; // 5 seconds
        await dashboardPage.navigateToDashboard();
        
        const startTime = Date.now();
        await dashboardPage.searchLocation('Klojen');
        const searchTime = Date.now() - startTime;
        
        console.log(`✓ Search Response Time: ${searchTime}ms`);
        expect(searchTime).toBeLessThan(maxSearchTime);
    });
});
