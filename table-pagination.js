(() => {
    const initializedTables = new WeakMap();
    const rowNumberHeaderPattern = /^(#|no\.?|s\/n|sl\.?\s*no\.?|serial(?:\s+no\.?)?|row(?:\s+no\.?)?)$/i;
    const excludedTableSelector = [
        'form',
        '[role="dialog"]',
        '.modal',
        '[class*="preview"]',
        '[data-print-area]',
        '[class*="print-area"]',
        '.certificate-sheet',
        '.id-card',
        '.invoice-document',
        '.po-print',
        '.attendance-module'
    ].join(',');

    const tableRows = table => Array.from(table.tBodies).flatMap(body => Array.from(body.rows));
    const tableColumnCount = table => {
        const firstHeader = table.tHead?.rows[0];
        return firstHeader
            ? Array.from(firstHeader.cells).reduce((count, cell) => count + cell.colSpan, 0)
            : 0;
    };
    const isEmptyRow = row => row.classList.contains('empty-state')
        || row.classList.contains('attendance-register-empty')
        || (row.cells.length === 1 && row.cells[0].colSpan > 1);
    const isFilterVisible = row => !row.hidden && row.style.display !== 'none';
    const tableContainer = table => table.closest([
        '[class*="table-wrap"]',
        '[class*="table-wrapper"]',
        '[class*="table-container"]',
        '[class*="table-responsive"]',
        '[class*="table-scroll"]'
    ].join(',')) || table.parentElement;

    const hasExistingPager = table => {
        const container = tableContainer(table);
        const parent = container?.parentElement;
        return Boolean(parent && Array.from(parent.children).some(element =>
            element !== container && /(?:pagination|pager|page-controls)/i.test(String(element.className || ''))
        ));
    };

    const addRowNumberColumn = table => {
        const headerRows = Array.from(table.tHead?.rows || []);
        if (!headerRows.length) return null;
        const firstHeader = headerRows[0];
        let numberColumnIndex = Array.from(firstHeader.cells).findIndex(cell =>
            rowNumberHeaderPattern.test(cell.textContent.trim())
        );
        let heading;
        if (numberColumnIndex === -1) {
            heading = document.createElement('th');
            heading.scope = 'col';
            heading.textContent = '#';
            heading.dataset.appRowNumber = '';
            if (headerRows.length > 1) heading.rowSpan = headerRows.length;
            firstHeader.insertBefore(heading, firstHeader.firstChild);
            table.dataset.appNumberColumnInserted = 'true';
            numberColumnIndex = 0;
        } else {
            heading = firstHeader.cells[numberColumnIndex];
            heading.dataset.appRowNumber = '';
        }
        table.dataset.appNumberColumnIndex = String(numberColumnIndex);

        tableRows(table).forEach(row => {
            if (isEmptyRow(row)) {
                if (table.dataset.appNumberColumnInserted === 'true') {
                    row.cells[0].colSpan = tableColumnCount(table);
                }
                return;
            }
            if (table.dataset.appNumberColumnInserted === 'true') {
                const cell = document.createElement('td');
                cell.dataset.appRowNumber = '';
                row.insertBefore(cell, row.firstChild);
            } else if (row.cells[numberColumnIndex]) {
                row.cells[numberColumnIndex].dataset.appRowNumber = '';
            }
        });
        return heading;
    };

    const createPager = table => {
        const container = tableContainer(table);
        if (!container?.parentElement) return null;
        const pager = document.createElement('div');
        pager.className = 'app-table-pagination';
        pager.setAttribute('role', 'group');
        pager.setAttribute('aria-label', 'Table pagination');
        pager.innerHTML = `
            <label class="app-table-page-size">
                <span>Rows per page</span>
                <select aria-label="Rows per page">
                    <option value="10">10</option>
                    <option value="25" selected>25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </label>
            <span class="app-table-page-status" aria-live="polite"></span>
            <div class="app-table-page-actions">
                <button type="button" data-page-direction="-1" aria-label="Previous page">Previous</button>
                <button type="button" data-page-direction="1" aria-label="Next page">Next</button>
            </div>`;
        container.after(pager);
        return pager;
    };

    const initializeTable = table => {
        if (initializedTables.has(table)
            || !table.tBodies.length
            || !table.tHead?.rows.length
            || table.closest(excludedTableSelector)
            || table.dataset.appPagination === 'custom') return;

        const rowNumberHeading = addRowNumberColumn(table);
        if (!rowNumberHeading || hasExistingPager(table)) {
            initializedTables.set(table, null);
            return;
        }
        const pager = createPager(table);
        if (!pager) return;
        const sizeSelect = pager.querySelector('select');
        const status = pager.querySelector('.app-table-page-status');
        const buttons = Array.from(pager.querySelectorAll('[data-page-direction]'));
        const state = { page: 0, pageSize: Number(sizeSelect.value) };
        const controller = { pager, state, rowNumberHeading, update: null };
        initializedTables.set(table, controller);

        const update = () => {
            const rows = tableRows(table);
            rows.filter(isEmptyRow).forEach(row => {
                row.removeAttribute('data-app-page-hidden');
                if (table.dataset.appNumberColumnInserted === 'true') {
                    row.cells[0].colSpan = tableColumnCount(table);
                }
            });
            const dataRows = rows.filter(row => !isEmptyRow(row));
            const numberColumnIndex = Number(table.dataset.appNumberColumnIndex);
            dataRows.forEach(row => {
                if (table.dataset.appNumberColumnInserted === 'true') {
                    if (!row.cells[0]?.hasAttribute('data-app-row-number')) {
                        const cell = document.createElement('td');
                        cell.dataset.appRowNumber = '';
                        row.insertBefore(cell, row.firstChild);
                    }
                } else if (row.cells[numberColumnIndex]) {
                    row.cells[numberColumnIndex].dataset.appRowNumber = '';
                }
            });
            const visibleRows = dataRows.filter(isFilterVisible);
            const pageCount = Math.max(1, Math.ceil(visibleRows.length / state.pageSize));
            state.page = Math.min(state.page, pageCount - 1);
            const firstIndex = state.page * state.pageSize;
            const visibleSet = new Set(visibleRows.slice(firstIndex, firstIndex + state.pageSize));

            dataRows.forEach(row => row.toggleAttribute('data-app-page-hidden', !visibleSet.has(row)));
            visibleRows.forEach((row, index) => {
                const numberCell = row.cells[numberColumnIndex];
                if (numberCell) numberCell.textContent = String(index + 1);
            });

            const firstShown = visibleRows.length ? firstIndex + 1 : 0;
            const lastShown = Math.min(firstIndex + state.pageSize, visibleRows.length);
            status.textContent = `${firstShown}–${lastShown} of ${visibleRows.length}`;
            buttons[0].disabled = state.page === 0;
            buttons[1].disabled = state.page >= pageCount - 1;
        };
        controller.update = update;

        sizeSelect.addEventListener('change', () => {
            state.pageSize = Number(sizeSelect.value);
            state.page = 0;
            update();
        });
        buttons.forEach(button => button.addEventListener('click', () => {
            state.page += Number(button.dataset.pageDirection);
            update();
        }));
        update();
    };

    const scan = tables => tables.forEach(table => {
        const controller = initializedTables.get(table);
        if (controller?.update) controller.update();
        else initializeTable(table);
    });
    let scheduledTables = new Set();
    let scanScheduled = false;
    const scheduleScan = tables => {
        tables.forEach(table => scheduledTables.add(table));
        if (scanScheduled) return;
        scanScheduled = true;
        requestAnimationFrame(() => {
            scanScheduled = false;
            const tablesToScan = scheduledTables;
            scheduledTables = new Set();
            scan(tablesToScan);
        });
    };

    const observer = new MutationObserver(mutations => {
        const changedTables = new Set();
        mutations.forEach(mutation => {
            if (mutation.target instanceof Element) {
                const table = mutation.target.closest('tbody')?.closest('table');
                if (table) changedTables.add(table);
            }
            Array.from(mutation.addedNodes).forEach(node => {
                if (!(node instanceof Element)) return;
                if (node.matches('table')) changedTables.add(node);
                node.querySelectorAll('table').forEach(table => changedTables.add(table));
            });
        });
        if (changedTables.size) scheduleScan(changedTables);
    });

    const start = () => {
        scan(new Set(document.querySelectorAll('table')));
        observer.observe(document.body, { childList: true, subtree: true });
        const updateFilteredTables = event => {
            if (!(event.target instanceof Element)) return;
            const scope = event.target.closest('.module, .admin-shell') || document;
            requestAnimationFrame(() => scope.querySelectorAll('table').forEach(table => {
                initializedTables.get(table)?.update?.();
            }));
        };
        document.addEventListener('input', updateFilteredTables);
        document.addEventListener('change', updateFilteredTables);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
