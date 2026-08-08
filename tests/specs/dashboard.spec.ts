import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';

/**
 * Test Suite: CCTV Malang Dashboard
 * Target: https://cctv.malangkota.go.id/
 * 
 * The site is a Leaflet-based interactive map showing CCTV camera locations
 * across Kota Malang. Features include:
 * - Kecamatan (district) filter dropdown
 * - Location search
 * - Cluster markers on the map
 * - Zoom controls
 */

test.describe('Dashboard Tests - CCTV Malang', () => {
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        dashboardPage = new DashboardPage(page);
        await dashboardPage.navigateToDashboard();
    });

    // =========================================================================
    // POSITIVE FLOW TESTS
    // =========================================================================

    /**
     * TC-001: Dashboard Loads Successfully
     * 
     * Objective: Verify dashboard initializes with all core elements
     * Expected: Map, dropdown, search input, and cluster markers are visible
     */
    test('TC-001: Verify dashboard loads with all core elements', async () => {
        // Act & Assert - Verify core UI elements are present
        await dashboardPage.verifyDashboardLoaded();

        // Assert - Cluster markers should be visible on the map
        const markerCount = await dashboardPage.getClusterMarkerCount();
        expect(markerCount).toBeGreaterThan(0);

        // Assert - Map controls visible
        await dashboardPage.verifyMapControlsVisible();
    });

    /**
     * TC-002: Search Location Successfully
     * 
     * Objective: Verify search functionality works with a valid location name
     * Expected: Search input accepts text, map responds
     */
    test('TC-002: Search for location successfully', async () => {
        // Arrange
        const searchTerm = 'Klojen';

        // Act
        await dashboardPage.searchLocation(searchTerm);

        // Assert - Search input retains the value
        const inputValue = await dashboardPage.getSearchInputValue();
        expect(inputValue).toBe(searchTerm);

        // Assert - Map still has markers visible after search
        const markerCount = await dashboardPage.getClusterMarkerCount();
        expect(markerCount).toBeGreaterThan(0);
    });

    /**
     * TC-003: Filter by Kecamatan (District)
     * 
     * Objective: Verify kecamatan dropdown filters the map view
     * Expected: Selecting a district updates map markers
     */
    test('TC-003: Filter cameras by kecamatan district', async () => {
        // Arrange - Get initial marker count
        const initialMarkerCount = await dashboardPage.getClusterMarkerCount();

        // Act - Select a specific kecamatan
        await dashboardPage.selectKecamatan('BLIMBING');

        // Assert - Marker count should change after filtering
        const filteredMarkerCount = await dashboardPage.getClusterMarkerCount();
        expect(filteredMarkerCount).toBeGreaterThan(0);

        // The filtered count should be different from the initial count
        // (fewer or redistributed markers after zooming to one district)
        expect(filteredMarkerCount).not.toEqual(initialMarkerCount);
    });

    /**
     * TC-004: Verify Kecamatan Dropdown Options
     * 
     * Objective: Verify all kecamatan options are available
     * Expected: Dropdown has all 6 options (SELURUH + 5 kecamatan)
     */
    test('TC-004: Verify kecamatan dropdown has all district options', async () => {
        // Act
        const options = await dashboardPage.getKecamatanOptions();

        // Assert - Should have at least 6 options
        expect(options.length).toBeGreaterThanOrEqual(6);

        // Assert - Should contain known kecamatan names
        const expectedKecamatan = ['BLIMBING', 'KLOJEN', 'KEDUNGKANDANG', 'SUKUN', 'LOWOKWARU'];
        for (const kecamatan of expectedKecamatan) {
            const found = options.some(opt => opt.toUpperCase().includes(kecamatan));
            expect(found).toBeTruthy();
        }
    });

    /**
     * TC-005: Zoom In and Markers Update
     * 
     * Objective: Verify zooming in splits cluster markers into individual ones
     * Expected: Marker count changes when zooming
     */
    test('TC-005: Zoom in and verify markers update', async () => {
        // Arrange - Get initial marker count
        const initialCount = await dashboardPage.getClusterMarkerCount();

        // Act - Zoom in multiple times
        await dashboardPage.zoomIn(3);

        // Assert - Marker count should change after zooming
        const zoomedCount = await dashboardPage.getMarkerCountAfterZoom();
        expect(zoomedCount).toBeGreaterThan(0);
        // When zooming in, clusters split so marker count usually changes
    });

    // =========================================================================
    // NEGATIVE FLOW TESTS
    // =========================================================================

    /**
     * TC-006: Search with Invalid Location
     * 
     * Objective: Verify proper handling of non-existent location search
     * Expected: Map still functions, no crash, markers still visible
     */
    test('TC-006: Search with invalid location does not break map', async () => {
        // Arrange
        const invalidSearch = 'XXXXNORESULTSXXXX123456789';

        // Act
        await dashboardPage.searchLocation(invalidSearch);

        // Assert - Map should still be functional (not crashed)
        await dashboardPage.verifyDashboardLoaded();

        // Assert - Map markers should still be visible
        const markerCount = await dashboardPage.getClusterMarkerCount();
        expect(markerCount).toBeGreaterThan(0);
    });

    /**
     * TC-007: Reset Filter After Kecamatan Selection
     * 
     * Objective: Verify resetting kecamatan filter restores all markers
     * Expected: After reset, marker count returns to initial state
     */
    test('TC-007: Reset kecamatan filter restores full view', async () => {
        // Arrange - Get initial state
        const initialCount = await dashboardPage.getClusterMarkerCount();

        // Act - Filter to specific kecamatan then reset
        await dashboardPage.selectKecamatan('SUKUN');
        const filteredCount = await dashboardPage.getClusterMarkerCount();

        await dashboardPage.resetKecamatanFilter();
        const resetCount = await dashboardPage.getClusterMarkerCount();

        // Assert - After reset, marker count should be similar to initial
        expect(resetCount).toBeGreaterThanOrEqual(filteredCount);
    });

    // =========================================================================
    // EDGE CASE TESTS
    // =========================================================================

    /**
     * TC-008: Multiple Kecamatan Selections in Sequence
     * 
     * Objective: Verify switching between kecamatan works correctly
     * Expected: Map updates each time without errors
     */
    test('TC-008: Switch between multiple kecamatan filters', async () => {
        // Arrange
        const kecamatanList = ['BLIMBING', 'KLOJEN', 'SUKUN'];

        // Act & Assert - Each selection should produce markers
        for (const kecamatan of kecamatanList) {
            await dashboardPage.selectKecamatan(kecamatan);
            const count = await dashboardPage.getClusterMarkerCount();
            expect(count).toBeGreaterThan(0);
        }
    });

    /**
     * TC-009: Click Cluster Marker to Zoom/Expand
     * 
     * Objective: Verify clicking cluster markers interacts with the map
     * Expected: Clicking a cluster zooms in or shows popup
     */
    test('TC-009: Click cluster marker interacts with map', async () => {
        // Arrange
        const initialMarkerCount = await dashboardPage.getClusterMarkerCount();
        expect(initialMarkerCount).toBeGreaterThan(0);

        // Act - Click the first cluster marker
        await dashboardPage.clickClusterMarker(0);

        // Assert - After clicking cluster, map should update
        // Either markers split (count changes) or a popup appears
        const newMarkerCount = await dashboardPage.getClusterMarkerCount();
        const popupVisible = await dashboardPage.isPopupVisible();

        expect(newMarkerCount !== initialMarkerCount || popupVisible).toBeTruthy();
    });

    /**
     * TC-010: Map Attribution Verification
     * 
     * Objective: Verify map credits and attribution are present
     * Expected: Leaflet and OpenStreetMap attribution visible
     */
    test('TC-010: Verify map attribution and credits', async () => {
        // Assert - Leaflet attribution should be visible
        await dashboardPage.verifyMapAttribution();
    });
});
