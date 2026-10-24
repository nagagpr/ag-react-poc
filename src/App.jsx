import { useCallback, useEffect, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { dataSource, loadRows } from './data/loadRows';
import { STATUSES } from './data/sampleData';

// Register all free (Community) AG Grid features once, before any grid renders.
ModuleRegistry.registerModules([AllCommunityModule]);

const gridTheme = themeQuartz.withParams({ accentColor: '#2563eb' });

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const formatCurrency = (params) => (params.value == null ? '' : currency.format(params.value));

function StatusBadge({ value }) {
  return value ? <span className={`badge badge-${value.toLowerCase()}`}>{value}</span> : null;
}

const columnDefs = [
  { field: 'orderId', headerName: 'Order ID' },
  { field: 'orderDate', headerName: 'Order Date', cellDataType: 'dateString' },
  { field: 'customer', minWidth: 170 },
  { field: 'country', minWidth: 150 },
  { field: 'product', minWidth: 190 },
  { field: 'category' },
  {
    field: 'quantity',
    headerName: 'Qty',
    editable: true,
    cellEditorParams: { min: 1, precision: 0 },
  },
  { field: 'unitPrice', headerName: 'Unit Price', valueFormatter: formatCurrency },
  {
    colId: 'total',
    headerName: 'Total',
    cellDataType: 'number',
    valueGetter: (params) => params.data && params.data.quantity * params.data.unitPrice,
    valueFormatter: formatCurrency,
    enableCellChangeFlash: true,
  },
  {
    field: 'status',
    editable: true,
    cellRenderer: StatusBadge,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: STATUSES },
  },
];

const defaultColDef = {
  flex: 1,
  minWidth: 120,
  filter: true,
  floatingFilter: true,
};

const rowSelection = { mode: 'multiRow', selectAll: 'filtered' };

export default function App() {
  const gridRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    loadRows()
      .then(setRows)
      .catch((err) => setError(`Could not load data: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const clearFilters = useCallback(() => {
    gridRef.current.api.setFilterModel(null);
    setSearch('');
  }, []);

  const exportCsv = useCallback(() => {
    gridRef.current.api.exportDataAsCsv({
      fileName: 'orders.csv',
      onlySelected: selectedCount > 0,
    });
  }, [selectedCount]);

  return (
    <div className="app">
      <header className="toolbar">
        <h1>Orders</h1>
        <input
          type="search"
          className="search"
          placeholder="Search all columns…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" onClick={clearFilters}>
          Clear filters
        </button>
        <button type="button" className="primary" onClick={exportCsv}>
          {selectedCount > 0 ? `Export ${selectedCount} selected` : 'Export CSV'}
        </button>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="grid">
        <AgGridReact
          ref={gridRef}
          theme={gridTheme}
          loading={loading}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={rowSelection}
          getRowId={(params) => String(params.data.orderId)}
          quickFilterText={search}
          pagination
          paginationPageSize={50}
          paginationPageSizeSelector={[25, 50, 100, 500]}
          onModelUpdated={(e) => setVisibleCount(e.api.getDisplayedRowCount())}
          onSelectionChanged={(e) => setSelectedCount(e.api.getSelectedRows().length)}
        />
      </div>

      <footer className="status">
        Showing {visibleCount} of {rows.length} orders · {selectedCount} selected · Source: {dataSource}
      </footer>
    </div>
  );
}
