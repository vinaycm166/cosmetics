import React, { useState, useMemo, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Search, 
  Eye, 
  Layers, 
  SlidersHorizontal,
  Check, 
  X, 
  Trash2, 
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  Tag,
  Package
} from 'lucide-react';
import { 
  parseUploadedFile, 
  detectColumnMapping, 
  validateAndParseRows, 
  executeBatchImport, 
  generateSampleWorkbook, 
  downloadFile, 
  exportErrorsToCsv,
  ColumnMapping, 
  RawRowData, 
  ParsedProductRow, 
  ImportOptions, 
  ImportSummary,
  PLACEHOLDER_COSMETIC_IMAGE
} from '../../lib/bulkImportService';
import { store } from '../../lib/store';
import { ProductImage, isValidImageUrl } from '../common/ProductImage';

interface BulkImportViewProps {
  onImportComplete: () => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'summary';

export const BulkImportView: React.FC<BulkImportViewProps> = ({ onImportComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  
  // File & Sheets
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [rawRows, setRawRows] = useState<RawRowData[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [readSheetFn, setReadSheetFn] = useState<((sheetName: string) => RawRowData[]) | null>(null);

  // Column Mapping
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    productName: '',
    brand: '',
    category: '',
    sku: '',
    sellingPrice: '',
    stock: ''
  });

  // Import Options
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    mode: 'full',
    publishPolicy: 'draft'
  });

  // Parsed Rows & Preview
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'warnings' | 'errors'>('all');
  const [previewSearch, setPreviewSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Modals for inspection & bulk edit
  const [inspectRow, setInspectRow] = useState<ParsedProductRow | null>(null);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState({
    category: '',
    brand: '',
    sellingPrice: '',
    mrp: '',
    stock: '',
    publishPolicy: 'draft' as 'draft' | 'published'
  });

  // Execution & Progress
  const [importProgress, setImportProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Download Sample Template
  const handleDownloadSample = () => {
    const buffer = generateSampleWorkbook();
    downloadFile(buffer, 'Dew_and_Go_Product_Import_Template.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };

  // Handle File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const processUploadedFile = async (file: File) => {
    try {
      setUploadedFile(file);
      const { sheetNames, readSheet } = await parseUploadedFile(file);
      setSheetNames(sheetNames);
      setReadSheetFn(() => readSheet);

      const firstSheet = sheetNames[0];
      setSelectedSheet(firstSheet);
      
      const rows = readSheet(firstSheet);
      setRawRows(rows);

      if (rows.length > 0) {
        const headers = Object.keys(rows[0]);
        setFileHeaders(headers);
        const autoMapping = detectColumnMapping(headers);
        setColumnMapping(autoMapping);
      }
    } catch (err: any) {
      alert(`Error reading file: ${err?.message || 'Invalid format'}`);
    }
  };

  // Handle Sheet Change
  const handleSheetChange = (sheetName: string) => {
    if (!readSheetFn) return;
    setSelectedSheet(sheetName);
    const rows = readSheetFn(sheetName);
    setRawRows(rows);

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      setFileHeaders(headers);
      const autoMapping = detectColumnMapping(headers);
      setColumnMapping(autoMapping);
    }
  };

  // Step Navigation: Proceed to Mapping
  const handleProceedToMapping = () => {
    if (rawRows.length === 0) {
      alert('The selected sheet has no data rows to import.');
      return;
    }
    setCurrentStep('mapping');
  };

  // Step Navigation: Proceed to Preview
  const handleProceedToPreview = () => {
    if (!columnMapping.productName || !columnMapping.sellingPrice || !columnMapping.stock) {
      alert('Please map all required fields: Product Name, Selling Price, and Stock Quantity.');
      return;
    }

    const allProducts = store.getProducts();
    const existingSkus = new Set<string>();
    allProducts.forEach(p => p.variants.forEach(v => existingSkus.add(v.sku.toLowerCase())));

    const categories = store.getCategories();
    const validated = validateAndParseRows(rawRows, columnMapping, existingSkus, categories, importOptions);
    setParsedRows(validated);
    setCurrentPage(1);
    setCurrentStep('preview');
  };

  // Filtered Preview Rows
  const filteredPreviewRows = useMemo(() => {
    return parsedRows.filter(row => {
      // Status Filter
      if (previewFilter === 'valid' && row.validationStatus !== 'valid') return false;
      if (previewFilter === 'warnings' && row.validationStatus !== 'warning') return false;
      if (previewFilter === 'errors' && row.validationStatus !== 'error') return false;

      // Search Query
      if (previewSearch.trim()) {
        const q = previewSearch.toLowerCase();
        return (
          row.productName.toLowerCase().includes(q) ||
          row.sku.toLowerCase().includes(q) ||
          row.brand.toLowerCase().includes(q) ||
          row.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [parsedRows, previewFilter, previewSearch]);

  // Paginated Rows
  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filteredPreviewRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    if (pageSize === 0) return filteredPreviewRows;
    const start = (currentPage - 1) * pageSize;
    return filteredPreviewRows.slice(start, start + pageSize);
  }, [filteredPreviewRows, currentPage, pageSize]);

  // Bulk Selection Toggles
  const handleToggleRow = (index: number) => {
    setParsedRows(prev => prev.map((r, i) => i === index ? { ...r, selectedForImport: !r.selectedForImport } : r));
  };

  const handleSelectAllValid = () => {
    setParsedRows(prev => prev.map(r => ({ ...r, selectedForImport: r.validationStatus !== 'error' })));
  };

  const handleSelectAllInFilter = () => {
    const filterSkus = new Set(filteredPreviewRows.map(r => r.sku));
    setParsedRows(prev => prev.map(r => filterSkus.has(r.sku) ? { ...r, selectedForImport: true } : r));
  };

  const handleDeselectAll = () => {
    setParsedRows(prev => prev.map(r => ({ ...r, selectedForImport: false })));
  };

  const handleExcludeErrors = () => {
    setParsedRows(prev => prev.map(r => r.validationStatus === 'error' ? { ...r, selectedForImport: false } : r));
  };

  // Apply Bulk Edit to selected rows
  const handleApplyBulkEdit = () => {
    const selectedCount = parsedRows.filter(r => r.selectedForImport).length;
    if (selectedCount === 0) {
      alert('Please select at least one row to bulk edit.');
      return;
    }

    const updated = parsedRows.map(r => {
      if (!r.selectedForImport) return r;
      const mod = { ...r };
      if (bulkEditForm.category.trim()) mod.category = bulkEditForm.category.trim();
      if (bulkEditForm.brand.trim()) mod.brand = bulkEditForm.brand.trim();
      if (bulkEditForm.sellingPrice.trim()) {
        const p = Number(bulkEditForm.sellingPrice.trim().replace(/[^0-9.]/g, ''));
        if (!isNaN(p) && p > 0) mod.sellingPrice = p;
      }
      if (bulkEditForm.mrp.trim()) {
        const m = Number(bulkEditForm.mrp.trim().replace(/[^0-9.]/g, ''));
        if (!isNaN(m) && m > 0) mod.mrp = m;
      }
      if (bulkEditForm.stock.trim()) {
        const s = Number(bulkEditForm.stock.trim().replace(/[^0-9]/g, ''));
        if (!isNaN(s) && s >= 0) mod.stock = s;
      }
      if (bulkEditForm.publishPolicy) {
        mod.status = bulkEditForm.publishPolicy;
      }

      // Re-evaluate validation
      const errs: string[] = [];
      const warns: string[] = [];
      if (!mod.productName) errs.push('Product name is required.');
      if (mod.sellingPrice === null || mod.sellingPrice <= 0) {
        if (mod.status === 'published') errs.push('Missing selling price: cannot publish product without positive price.');
        else warns.push('Missing selling price: product will be saved as Draft.');
      }
      if (mod.stock === 0) warns.push('Stock is 0: product will be marked as Out of Stock.');
      if (mod.requiresImageReview) warns.push('Image unverified or missing URL; requires manual review before publishing.');

      mod.validationErrors = errs;
      mod.validationWarnings = warns;
      mod.validationStatus = errs.length > 0 ? 'error' : warns.length > 0 ? 'warning' : 'valid';
      return mod;
    });

    setParsedRows(updated);
    setBulkEditModalOpen(false);
  };

  // Download Error Report as CSV
  const handleDownloadErrorReport = () => {
    const errorList = parsedRows
      .filter(r => r.validationStatus === 'error')
      .map(r => ({
        row: r.rowIndex,
        sku: r.sku,
        name: r.productName,
        error: r.validationErrors.join('; ')
      }));

    if (errorList.length === 0) {
      alert('No error rows detected in this catalogue.');
      return;
    }
    exportErrorsToCsv(errorList);
  };

  // Inline Image URL edit
  const handleUpdateImageUrl = (rowIndex: number, url: string) => {
    setParsedRows(prev => prev.map((r, idx) => {
      if (idx === rowIndex) {
        return {
          ...r,
          imageUrl: url,
          requiresImageReview: false,
          imageResolutionSource: 'direct_url',
          validationWarnings: r.validationWarnings.filter(w => !w.includes('Image'))
        };
      }
      return r;
    }));
  };

  // Start Batch Import
  const handleStartImport = async () => {
    const selectedCount = parsedRows.filter(r => r.selectedForImport && r.validationStatus !== 'error').length;
    if (selectedCount === 0) {
      alert('No valid rows selected for import.');
      return;
    }

    setCurrentStep('importing');
    setImportProgress(0);
    setIsCancelled(false);

    const summary = await executeBatchImport(
      parsedRows,
      importOptions,
      (progress, current, total) => {
        setImportProgress(progress);
        setCurrentBatch(current);
        setTotalBatches(total);
      }
    );

    setImportSummary(summary);
    setCurrentStep('summary');
  };

  // Counts for Preview Tabs
  const validCount = parsedRows.filter(r => r.validationStatus === 'valid').length;
  const warningCount = parsedRows.filter(r => r.validationStatus === 'warning').length;
  const errorCount = parsedRows.filter(r => r.validationStatus === 'error').length;
  const selectedCount = parsedRows.filter(r => r.selectedForImport && r.validationStatus !== 'error').length;

  // Exact 5 metrics required for Catalogue & Image Audit:
  const catalogueAudit = useMemo(() => {
    const total = parsedRows.length;
    let validImages = 0;
    let missingImages = 0;
    let invalidUrls = 0;
    let requiringReview = 0;

    for (const r of parsedRows) {
      const url = r.imageUrl?.trim() || '';
      if (!url) {
        missingImages++;
      } else if (isValidImageUrl(url)) {
        validImages++;
      } else {
        invalidUrls++;
      }

      if (r.requiresImageReview || !isValidImageUrl(url) || !r.sellingPrice || r.sellingPrice <= 0) {
        requiringReview++;
      }
    }

    return {
      total,
      validImages,
      missingImages,
      invalidUrls,
      requiringReview
    };
  }, [parsedRows]);

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Title & Sample Template CTA */}
      <div className="bg-white rounded-xl border border-border p-6 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blush flex items-center justify-center text-berry">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-charcoal">
                Bulk Catalogue Excel Import
              </h2>
              <p className="text-xs text-muted">
                Import large cosmetics catalogues with automatic image matching, column detection, and inventory verification
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadSample}
          className="dew-btn-outline !py-2 !px-4 text-xs font-bold flex items-center gap-2 hover:border-rose transition-colors"
        >
          <Download className="w-4 h-4 text-rose" />
          <span>Download Sample Excel Template</span>
        </button>
      </div>

      {/* 2. Step Progress Bar */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-subtle">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className={`p-2.5 rounded-lg font-bold flex items-center justify-center gap-2 ${
            currentStep === 'upload' ? 'bg-berry text-white' : 'bg-warmcream text-charcoal'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>Upload File</span>
          </div>

          <div className={`p-2.5 rounded-lg font-bold flex items-center justify-center gap-2 ${
            currentStep === 'mapping' ? 'bg-berry text-white' : 'bg-warmcream text-charcoal'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>Map Columns</span>
          </div>

          <div className={`p-2.5 rounded-lg font-bold flex items-center justify-center gap-2 ${
            currentStep === 'preview' ? 'bg-berry text-white' : 'bg-warmcream text-charcoal'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
            <span>Preview & Validate</span>
          </div>

          <div className={`p-2.5 rounded-lg font-bold flex items-center justify-center gap-2 ${
            currentStep === 'importing' || currentStep === 'summary' ? 'bg-berry text-white' : 'bg-warmcream text-charcoal'
          }`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">4</span>
            <span>Results & Summary</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          STEP 1: UPLOAD SPREADSHEET
      ======================================================== */}
      {currentStep === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border-2 border-dashed border-border hover:border-rose p-10 text-center transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto mb-4 text-berry">
              <UploadCloud className="w-8 h-8" />
            </div>
            
            <h3 className="font-heading font-extrabold text-base text-charcoal mb-1">
              {uploadedFile ? uploadedFile.name : 'Upload Cosmetics Catalogue'}
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto mb-5 leading-relaxed">
              Drag and drop your supplier Excel spreadsheet (<b className="text-charcoal">.xlsx</b>, <b className="text-charcoal">.xls</b>) or <b className="text-charcoal">.csv</b> file here.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="dew-btn-berry !px-6 !py-2.5 text-xs font-bold"
            >
              Select Spreadsheet File
            </button>
          </div>

          {/* If file uploaded, configure worksheet and import options */}
          {uploadedFile && (
            <div className="bg-white rounded-xl border border-border p-6 shadow-subtle space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Worksheet Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                    Worksheet to Import
                  </label>
                  <select
                    value={selectedSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="dew-input font-medium"
                  >
                    {sheetNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <span className="text-[11px] text-muted block mt-1">
                    Found {rawRows.length} data rows in sheet
                  </span>
                </div>

                {/* Import Mode */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                    Inventory Update Mode
                  </label>
                  <select
                    value={importOptions.mode}
                    onChange={(e) => setImportOptions({ ...importOptions, mode: e.target.value as any })}
                    className="dew-input font-medium"
                  >
                    <option value="full">Catalogue & Inventory Update (Sync details & live stock)</option>
                    <option value="catalogue_only">Catalogue Details Only (Keep existing live stock)</option>
                    <option value="new_only">New Products Only (Skip any existing SKUs)</option>
                  </select>
                  <span className="text-[11px] text-muted block mt-1">
                    {importOptions.mode === 'full' && 'Overwrites stock quantity and logs movement.'}
                    {importOptions.mode === 'catalogue_only' && 'Protects live store inventory.'}
                    {importOptions.mode === 'new_only' && 'Avoids modifying any active products.'}
                  </span>
                </div>

                {/* Publication Policy */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                    Initial Publication Status
                  </label>
                  <select
                    value={importOptions.publishPolicy}
                    onChange={(e) => setImportOptions({ ...importOptions, publishPolicy: e.target.value as any })}
                    className="dew-input font-medium"
                  >
                    <option value="draft">Import as Drafts (Recommended — review images first)</option>
                    <option value="published">Publish Immediately (Make live for checkout)</option>
                  </select>
                  <span className="text-[11px] text-muted block mt-1">
                    Draft items remain hidden from storefront until approved.
                  </span>
                </div>

              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-charcoal font-semibold">
                  Ready to map {rawRows.length} rows from <b className="text-berry">{selectedSheet}</b>
                </span>
                <button
                  onClick={handleProceedToMapping}
                  className="dew-btn-berry !px-6 !py-2.5 text-xs font-bold flex items-center gap-2"
                >
                  <span>Proceed to Column Mapping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          STEP 2: COLUMN MAPPING
      ======================================================== */}
      {currentStep === 'mapping' && (
        <div className="bg-white rounded-xl border border-border p-6 shadow-subtle space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="font-heading font-extrabold text-base text-charcoal">
                Match Spreadsheet Columns to Database Fields
              </h3>
              <p className="text-xs text-muted">
                Our smart parser auto-matched columns based on supplier header names. Please verify before continuing.
              </p>
            </div>
            <button
              onClick={() => setCurrentStep('upload')}
              className="text-xs font-semibold text-muted hover:text-charcoal flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Upload</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Required Fields Group */}
            <div className="p-4 rounded-xl border border-rose/30 bg-blush/20 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-berry flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose" />
                <span>Required Core Fields</span>
              </span>

              {/* Product Name */}
              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                  <span>Product Name *</span>
                  {rawRows[0] && columnMapping.productName && (
                    <span className="text-[10px] text-muted truncate max-w-[200px]">
                      Sample: {String(rawRows[0][columnMapping.productName] || '')}
                    </span>
                  )}
                </div>
                <select
                  value={columnMapping.productName}
                  onChange={(e) => setColumnMapping({ ...columnMapping, productName: e.target.value })}
                  className="dew-input font-medium"
                >
                  <option value="">-- Select Column --</option>
                  {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Selling Price */}
              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                  <span>Selling Price (₹) *</span>
                  {rawRows[0] && columnMapping.sellingPrice && (
                    <span className="text-[10px] text-muted truncate max-w-[200px]">
                      Sample: {String(rawRows[0][columnMapping.sellingPrice] || '')}
                    </span>
                  )}
                </div>
                <select
                  value={columnMapping.sellingPrice}
                  onChange={(e) => setColumnMapping({ ...columnMapping, sellingPrice: e.target.value })}
                  className="dew-input font-medium"
                >
                  <option value="">-- Select Column --</option>
                  {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Stock Quantity */}
              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                  <span>Stock Quantity *</span>
                  {rawRows[0] && columnMapping.stock && (
                    <span className="text-[10px] text-muted truncate max-w-[200px]">
                      Sample: {String(rawRows[0][columnMapping.stock] || '')}
                    </span>
                  )}
                </div>
                <select
                  value={columnMapping.stock}
                  onChange={(e) => setColumnMapping({ ...columnMapping, stock: e.target.value })}
                  className="dew-input font-medium"
                >
                  <option value="">-- Select Column --</option>
                  {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* SKU */}
              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                  <span>SKU / Product Code</span>
                  {rawRows[0] && columnMapping.sku && (
                    <span className="text-[10px] text-muted truncate max-w-[200px]">
                      Sample: {String(rawRows[0][columnMapping.sku] || '')}
                    </span>
                  )}
                </div>
                <select
                  value={columnMapping.sku}
                  onChange={(e) => setColumnMapping({ ...columnMapping, sku: e.target.value })}
                  className="dew-input font-medium"
                >
                  <option value="">-- Auto-generate if empty --</option>
                  {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            {/* Catalogue & Classification Fields */}
            <div className="p-4 rounded-xl border border-border bg-warmcream/40 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-berry" />
                <span>Classification & Branding</span>
              </span>

              {/* Brand */}
              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                  <span>Brand Name</span>
                  {rawRows[0] && columnMapping.brand && (
                    <span className="text-[10px] text-muted truncate max-w-[200px]">
                      Sample: {String(rawRows[0][columnMapping.brand] || '')}
                    </span>
                  )}
                </div>
                <select
                  value={columnMapping.brand}
                  onChange={(e) => setColumnMapping({ ...columnMapping, brand: e.target.value })}
                  className="dew-input font-medium"
                >
                  <option value="">-- Default to Dew & Go --</option>
                  {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Category */}
              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                  <span>Category</span>
                  {rawRows[0] && columnMapping.category && (
                    <span className="text-[10px] text-muted truncate max-w-[200px]">
                      Sample: {String(rawRows[0][columnMapping.category] || '')}
                    </span>
                  )}
                </div>
                <select
                  value={columnMapping.category}
                  onChange={(e) => setColumnMapping({ ...columnMapping, category: e.target.value })}
                  className="dew-input font-medium"
                >
                  <option value="">-- Default to Skincare --</option>
                  {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Barcode / GTIN */}
              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                  <span>Barcode / GTIN (for automated image match)</span>
                  {rawRows[0] && columnMapping.barcode && (
                    <span className="text-[10px] text-muted truncate max-w-[200px]">
                      Sample: {String(rawRows[0][columnMapping.barcode] || '')}
                    </span>
                  )}
                </div>
                <select
                  value={columnMapping.barcode}
                  onChange={(e) => setColumnMapping({ ...columnMapping, barcode: e.target.value })}
                  className="dew-input font-medium"
                >
                  <option value="">-- Optional --</option>
                  {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* MRP / Original Price */}
              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                  <span>MRP / Original Price (₹)</span>
                  {rawRows[0] && columnMapping.mrp && (
                    <span className="text-[10px] text-muted truncate max-w-[200px]">
                      Sample: {String(rawRows[0][columnMapping.mrp] || '')}
                    </span>
                  )}
                </div>
                <select
                  value={columnMapping.mrp}
                  onChange={(e) => setColumnMapping({ ...columnMapping, mrp: e.target.value })}
                  className="dew-input font-medium"
                >
                  <option value="">-- Optional (for discount % badge) --</option>
                  {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

            </div>

            {/* Image & Description Fields */}
            <div className="p-4 rounded-xl border border-border bg-warmcream/40 space-y-3 md:col-span-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-coral" />
                <span>Images & Specification Details</span>
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Primary Image URL</label>
                  <select
                    value={columnMapping.imageUrl}
                    onChange={(e) => setColumnMapping({ ...columnMapping, imageUrl: e.target.value })}
                    className="dew-input font-medium"
                  >
                    <option value="">-- Optional (will auto-resolve) --</option>
                    {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Variant / Size / Shade</label>
                  <select
                    value={columnMapping.variantName}
                    onChange={(e) => setColumnMapping({ ...columnMapping, variantName: e.target.value })}
                    className="dew-input font-medium"
                  >
                    <option value="">-- Optional --</option>
                    {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Product Description</label>
                  <select
                    value={columnMapping.description}
                    onChange={(e) => setColumnMapping({ ...columnMapping, description: e.target.value })}
                    className="dew-input font-medium"
                  >
                    <option value="">-- Optional --</option>
                    {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted">
              All unmapped optional fields will be populated with sensible defaults.
            </span>
            <button
              onClick={handleProceedToPreview}
              className="dew-btn-berry !px-6 !py-2.5 text-xs font-bold flex items-center gap-2"
            >
              <span>Validate & Preview Rows</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: PREVIEW & VALIDATION TABLE
      ======================================================== */}
      {currentStep === 'preview' && (
        <div className="bg-white rounded-xl border border-border p-6 shadow-subtle space-y-6">
          
          {/* Top Bar with Filter Pills & Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h3 className="font-heading font-extrabold text-base text-charcoal">
                Import Preview & Verification
              </h3>
              <p className="text-xs text-muted">
                Review products, inspect automated image matches, and correct any warnings before committing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCurrentStep('mapping')}
                className="dew-btn-outline !py-2 !px-3 text-xs"
              >
                Edit Mapping
              </button>
              <button
                onClick={() => setBulkEditModalOpen(true)}
                disabled={selectedCount === 0}
                className="dew-btn-outline !py-2 !px-3 text-xs font-bold flex items-center gap-1.5 hover:border-berry"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-berry" />
                <span>Bulk Edit ({selectedCount})</span>
              </button>
              {errorCount > 0 && (
                <button
                  onClick={handleDownloadErrorReport}
                  className="dew-btn-outline !py-2 !px-3 text-xs font-bold text-rose border-rose hover:bg-blush flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Error Report ({errorCount})</span>
                </button>
              )}
              <button
                onClick={handleStartImport}
                disabled={selectedCount === 0}
                className="dew-btn-berry !py-2 !px-5 text-xs font-extrabold flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Import {selectedCount} Products</span>
              </button>
            </div>
          </div>

          {/* Catalogue & Photography Audit Bar (5 Metrics) */}
          <div className="bg-[#FAF7F4] border border-neutral-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-charcoal-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-berry" />
                <span>Catalogue & Photography Verification Audit</span>
              </span>
              <span className="text-[10px] text-muted">
                Requires genuine photography before storefront publication
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="bg-white p-2.5 rounded-lg border border-neutral-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-muted uppercase block">Total Products</span>
                <span className="text-xl font-heading font-extrabold text-charcoal-900">{catalogueAudit.total}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-neutral-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Valid Images</span>
                <span className="text-xl font-heading font-extrabold text-emerald-700">{catalogueAudit.validImages}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-neutral-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">Missing Images</span>
                <span className="text-xl font-heading font-extrabold text-amber-700">{catalogueAudit.missingImages}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-neutral-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-rose uppercase block">Invalid Image URLs</span>
                <span className="text-xl font-heading font-extrabold text-rose">{catalogueAudit.invalidUrls}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-neutral-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-berry uppercase block">Requires Review</span>
                <span className="text-xl font-heading font-extrabold text-berry">{catalogueAudit.requiringReview}</span>
              </div>
            </div>
          </div>

          {/* Metrics & Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setPreviewFilter('all'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                  previewFilter === 'all' ? 'bg-charcoal text-white' : 'bg-warmcream text-charcoal hover:bg-neutral-200'
                }`}
              >
                All ({parsedRows.length})
              </button>
              <button
                onClick={() => { setPreviewFilter('valid'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                  previewFilter === 'valid' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Ready ({validCount})
              </button>
              <button
                onClick={() => { setPreviewFilter('warnings'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                  previewFilter === 'warnings' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Warnings ({warningCount})
              </button>
              {errorCount > 0 && (
                <button
                  onClick={() => { setPreviewFilter('errors'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
                    previewFilter === 'errors' ? 'bg-rose text-white' : 'bg-blush text-rose hover:bg-rose/20'
                  }`}
                >
                  Errors ({errorCount})
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button onClick={handleSelectAllValid} className="text-xs font-semibold text-berry hover:underline">
                Select All Valid
              </button>
              <span className="text-muted">•</span>
              <button onClick={handleSelectAllInFilter} className="text-xs font-semibold text-charcoal hover:underline">
                Select All in View
              </button>
              <span className="text-muted">•</span>
              <button onClick={handleDeselectAll} className="text-xs font-semibold text-muted hover:underline">
                Deselect All
              </button>
              {errorCount > 0 && (
                <>
                  <span className="text-muted">•</span>
                  <button onClick={handleExcludeErrors} className="text-xs font-semibold text-rose hover:underline">
                    Exclude Errors
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search inside preview */}
          <div className="relative max-w-sm">
            <input
              type="text"
              value={previewSearch}
              onChange={(e) => { setPreviewSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Filter preview by name, SKU, or brand..."
              className="dew-input pl-8"
            />
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-warmcream border-b border-border text-[11px] font-extrabold uppercase tracking-wider text-charcoal">
                  <th className="p-3 w-10">Select</th>
                  <th className="p-3 w-16">Image</th>
                  <th className="p-3">Product Name & Brand</th>
                  <th className="p-3">SKU & Barcode</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price & MRP</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Validation Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedRows.map((row, idx) => {
                  const actualIndex = (currentPage - 1) * pageSize + idx;
                  return (
                    <tr key={row.rowIndex} className={`hover:bg-warmcream/40 transition-colors ${!row.selectedForImport ? 'opacity-50' : ''}`}>
                      
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.selectedForImport}
                          disabled={row.validationStatus === 'error'}
                          onChange={() => handleToggleRow(actualIndex)}
                          className="w-4 h-4 rounded text-berry focus:ring-berry border-border cursor-pointer disabled:opacity-40"
                        />
                      </td>

                      {/* Image Thumbnail & Source Badge */}
                      <td className="p-3">
                        <div className="relative w-12 h-12 rounded-lg bg-warmcream border border-border overflow-hidden group">
                          <ProductImage
                            src={row.imageUrl}
                            alt={row.productName}
                            brand={row.brand}
                            className="w-full h-full object-contain p-1"
                            badge={false}
                          />
                          {row.imageResolutionSource === 'barcode_match' && (
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-700 text-white text-[8px] font-extrabold text-center block">
                              MATCHED
                            </span>
                          )}
                          {row.imageResolutionSource === 'fuzzy_match' && (
                            <span className="absolute bottom-0 inset-x-0 bg-berry text-white text-[8px] font-extrabold text-center block">
                              AUTO
                            </span>
                          )}
                          {row.requiresImageReview && (
                            <span className="absolute bottom-0 inset-x-0 bg-amber-600 text-white text-[8px] font-extrabold text-center block">
                              REVIEW
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Product Name & Brand */}
                      <td className="p-3 max-w-xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted block">
                          {row.brand}
                        </span>
                        <span className="font-bold text-charcoal block truncate">
                          {row.productName}
                        </span>
                        <span className="text-[11px] text-muted">
                          Variant: {row.variantName}
                        </span>
                      </td>

                      {/* SKU & Barcode */}
                      <td className="p-3 font-mono text-[11px]">
                        <span className="font-bold text-charcoal block">{row.sku}</span>
                        {row.barcode && <span className="text-muted block text-[10px]">BAR: {row.barcode}</span>}
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warmcream border border-border text-charcoal">
                          {row.category}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="p-3">
                        <div className="flex items-baseline gap-1">
                          {row.sellingPrice !== null ? (
                            <span className="font-bold text-charcoal">₹{row.sellingPrice}</span>
                          ) : (
                            <span className="text-amber-800 font-semibold italic text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Missing (Draft)
                            </span>
                          )}
                          {row.mrp && row.sellingPrice && row.mrp > row.sellingPrice && (
                            <span className="text-[10px] text-muted line-through">₹{row.mrp}</span>
                          )}
                        </div>
                        {row.discountPercentage && row.discountPercentage > 0 ? (
                          <span className="text-[9px] font-bold text-rose">
                            {row.discountPercentage}% OFF
                          </span>
                        ) : null}
                      </td>

                      {/* Stock */}
                      <td className="p-3">
                        {row.stock === 0 ? (
                          <span className="font-bold text-amber-800 text-[11px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            0 (Out of stock)
                          </span>
                        ) : (
                          <span className="font-bold text-charcoal">
                            {row.stock} units
                          </span>
                        )}
                      </td>

                      {/* Validation Status */}
                      <td className="p-3 max-w-xs">
                        {row.validationStatus === 'valid' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Valid</span>
                          </span>
                        )}

                        {row.validationStatus === 'warning' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Warning</span>
                            </span>
                            <p className="text-[10px] text-amber-900 leading-tight">
                              {row.validationWarnings[0]}
                            </p>
                          </div>
                        )}

                        {row.validationStatus === 'error' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose bg-blush px-2 py-0.5 rounded border border-rose/30">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Error</span>
                            </span>
                            <p className="text-[10px] text-rose font-medium leading-tight">
                              {row.validationErrors.join(', ')}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setInspectRow(row)}
                          className="text-xs font-bold text-berry hover:underline inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Source</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border text-xs">
            <div className="flex items-center gap-2 text-muted">
              <span>
                Showing {filteredPreviewRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPreviewRows.length)} of {filteredPreviewRows.length} total rows
              </span>
              <span className="text-border">|</span>
              <span>Page Size:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-border rounded px-2 py-1 text-xs bg-white text-charcoal font-semibold"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={750}>750 (All)</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="dew-btn-outline !py-1 !px-2.5 text-xs font-bold disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 text-xs font-bold text-charcoal">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="dew-btn-outline !py-1 !px-2.5 text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          STEP 4: IMPORTING PROGRESS
      ======================================================== */}
      {currentStep === 'importing' && (
        <div className="bg-white rounded-xl border border-border p-12 shadow-subtle text-center max-w-md mx-auto space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center mx-auto text-berry animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>

          <div>
            <h3 className="font-heading font-extrabold text-lg text-charcoal">
              Importing Catalogue Products...
            </h3>
            <p className="text-xs text-muted mt-1">
              Processing batch {currentBatch} of {totalBatches} ({importProgress}%)
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-warmcream rounded-full h-3 overflow-hidden border border-border">
            <div 
              className="bg-gradient-to-r from-berry to-rose h-full transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            />
          </div>

          <p className="text-[11px] text-muted">
            Atomic verification: Logging stock adjustments and registering variants.
          </p>
        </div>
      )}

      {/* ========================================================
          STEP 5: SUMMARY & ERROR REPORT
      ======================================================== */}
      {currentStep === 'summary' && importSummary && (
        <div className="bg-white rounded-xl border border-border p-8 shadow-subtle space-y-8 animate-fade-in">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-extrabold text-2xl text-charcoal">
              Bulk Import Completed!
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Processed {importSummary.totalRows} spreadsheet entries in {(importSummary.durationMs / 1000).toFixed(1)} seconds.
            </p>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                Created
              </span>
              <span className="text-2xl font-extrabold text-emerald-700">
                {importSummary.createdCount}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                Updated
              </span>
              <span className="text-2xl font-extrabold text-blue-700">
                {importSummary.updatedCount}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-warmcream border border-border text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                Skipped
              </span>
              <span className="text-2xl font-extrabold text-charcoal">
                {importSummary.skippedCount}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose/10 border border-rose/30 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose block">
                Failed
              </span>
              <span className="text-2xl font-extrabold text-rose">
                {importSummary.failedCount}
              </span>
            </div>
          </div>

          {/* Catalogue & Photography Audit Report (5 Required Metrics) */}
          <div className="bg-[#FAF7F4] border border-neutral-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-berry" />
                <span>Product Catalogue & Photography Audit Report</span>
              </span>
              <span className="text-[11px] text-muted font-medium">
                Storefront publication status
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="bg-white p-3 rounded-lg border border-neutral-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-muted uppercase block">Total Products</span>
                <span className="text-2xl font-heading font-extrabold text-charcoal-900">{catalogueAudit.total}</span>
                <span className="text-[9px] text-muted block mt-0.5">Rows evaluated</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Valid Images</span>
                <span className="text-2xl font-heading font-extrabold text-emerald-700">{catalogueAudit.validImages}</span>
                <span className="text-[9px] text-muted block mt-0.5">Verified URLs</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">Missing Images</span>
                <span className="text-2xl font-heading font-extrabold text-amber-700">{catalogueAudit.missingImages}</span>
                <span className="text-[9px] text-muted block mt-0.5">Empty image URL</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-rose uppercase block">Invalid Image URLs</span>
                <span className="text-2xl font-heading font-extrabold text-rose">{catalogueAudit.invalidUrls}</span>
                <span className="text-[9px] text-muted block mt-0.5">Relative/unhosted</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-berry uppercase block">Requires Review</span>
                <span className="text-2xl font-heading font-extrabold text-berry">{catalogueAudit.requiringReview}</span>
                <span className="text-[9px] text-muted block mt-0.5">Price or image pending</span>
              </div>
            </div>

            <p className="text-[11px] text-charcoal-600 bg-white/70 p-2.5 rounded-lg border border-neutral-border/60">
              <b>Catalogue Integrity Notice:</b> Products missing selling prices, MRP, or valid image URLs are safely retained as <b>Draft</b> and will not display broken images or incomplete data on the live storefront. Administrators can upload verified brand photos and set live pricing via the Products tab.
            </p>
          </div>

          {/* Error Table if any */}
          {importSummary.errors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed Rows ({importSummary.errors.length})</span>
                </span>
                <button
                  onClick={() => exportErrorsToCsv(importSummary.errors)}
                  className="dew-btn-outline !py-1.5 !px-3 text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-rose" />
                  <span>Download Error Report (CSV)</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-warmcream text-muted text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">Row</th>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5">Product Name</th>
                      <th className="p-2.5">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {importSummary.errors.map((err, i) => (
                      <tr key={i} className="hover:bg-warmcream/40">
                        <td className="p-2.5 font-bold">{err.row}</td>
                        <td className="p-2.5 font-mono">{err.sku}</td>
                        <td className="p-2.5 truncate max-w-xs">{err.name}</td>
                        <td className="p-2.5 text-rose font-medium">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <button
              onClick={() => {
                setCurrentStep('upload');
                setUploadedFile(null);
                setParsedRows([]);
                setImportSummary(null);
              }}
              className="dew-btn-outline !py-2.5 !px-5 text-xs font-bold"
            >
              Import Another File
            </button>

            <button
              onClick={onImportComplete}
              className="dew-btn-berry !py-2.5 !px-6 text-xs font-bold"
            >
              View Products in Catalogue
            </button>
          </div>

        </div>
      )}

      {/* ========================================================
          MODAL 1: INSPECT ORIGINAL SPREADSHEET ROW
      ======================================================== */}
      {inspectRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-border space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                  Row #{inspectRow.rowIndex} • Source Inspector
                </span>
                <h3 className="font-heading font-extrabold text-base text-charcoal">
                  {inspectRow.productName}
                </h3>
              </div>
              <button
                onClick={() => setInspectRow(null)}
                className="w-8 h-8 rounded-full hover:bg-warmcream flex items-center justify-center text-muted hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Original Spreadsheet Values */}
              <div className="p-4 rounded-xl border border-border bg-warmcream/40 space-y-2">
                <h4 className="font-bold text-charcoal flex items-center gap-1.5 pb-2 border-b border-border">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-berry" />
                  <span>Original Spreadsheet Columns</span>
                </h4>
                <div className="space-y-1.5 max-h-64 overflow-y-auto font-mono text-[11px]">
                  {Object.entries(inspectRow.rawRow || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-0.5 border-b border-border/40">
                      <span className="text-muted">{key}:</span>
                      <span className="font-bold text-charcoal text-right truncate max-w-[150px]">
                        {val === '' ? <i className="text-muted font-normal">(empty)</i> : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mapped Application Values */}
              <div className="p-4 rounded-xl border border-border bg-white space-y-2">
                <h4 className="font-bold text-charcoal flex items-center gap-1.5 pb-2 border-b border-border">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Clean Mapped Values</span>
                </h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between py-0.5 border-b border-border/40">
                    <span className="text-muted">SKU:</span>
                    <span className="font-bold font-mono">{inspectRow.sku}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-border/40">
                    <span className="text-muted">Brand:</span>
                    <span className="font-bold">{inspectRow.brand}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-border/40">
                    <span className="text-muted">Category:</span>
                    <span className="font-bold">{inspectRow.category}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-border/40">
                    <span className="text-muted">Selling Price:</span>
                    <span className="font-bold text-berry">
                      {inspectRow.sellingPrice !== null ? `₹${inspectRow.sellingPrice}` : 'Missing (Draft)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-border/40">
                    <span className="text-muted">MRP:</span>
                    <span className="font-bold">
                      {inspectRow.mrp ? `₹${inspectRow.mrp}` : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-border/40">
                    <span className="text-muted">Stock Quantity:</span>
                    <span className="font-bold">
                      {inspectRow.stock} {inspectRow.stock === 0 ? '(Out of stock)' : 'units'}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-border/40">
                    <span className="text-muted">Status:</span>
                    <span className="font-bold uppercase text-[10px] bg-warmcream px-1.5 py-0.5 rounded">
                      {inspectRow.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-border/40">
                    <span className="text-muted">Image Source:</span>
                    <span className="font-bold capitalize">{inspectRow.imageResolutionSource.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Validation Feedback */}
            {inspectRow.validationErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-blush border border-rose/30 text-rose text-xs space-y-1">
                <span className="font-bold block">Validation Errors:</span>
                <ul className="list-disc list-inside">
                  {inspectRow.validationErrors.map((e, idx) => <li key={idx}>{e}</li>)}
                </ul>
              </div>
            )}

            {inspectRow.validationWarnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <span className="font-bold block">Validation Warnings:</span>
                <ul className="list-disc list-inside">
                  {inspectRow.validationWarnings.map((w, idx) => <li key={idx}>{w}</li>)}
                </ul>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectRow(null)}
                className="dew-btn-berry !py-2 !px-5 text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: BULK EDIT SELECTED ROWS
      ======================================================== */}
      {bulkEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-heading font-extrabold text-base text-charcoal">
                  Bulk Edit Selected Products
                </h3>
                <p className="text-xs text-muted">
                  Update {parsedRows.filter(r => r.selectedForImport).length} selected rows. Leave fields empty to keep current values.
                </p>
              </div>
              <button
                onClick={() => setBulkEditModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-warmcream flex items-center justify-center text-muted hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={bulkEditForm.sellingPrice}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, sellingPrice: e.target.value })}
                  placeholder="e.g. 499 (leaves current if blank)"
                  className="dew-input font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">MRP / Original Price (₹)</label>
                <input
                  type="number"
                  value={bulkEditForm.mrp}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, mrp: e.target.value })}
                  placeholder="e.g. 699 (leaves current if blank)"
                  className="dew-input font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={bulkEditForm.stock}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, stock: e.target.value })}
                  placeholder="e.g. 50 (leaves current if blank)"
                  className="dew-input font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Category</label>
                <input
                  type="text"
                  value={bulkEditForm.category}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, category: e.target.value })}
                  placeholder="e.g. Skincare, Serums, Sunscreen (leaves current if blank)"
                  className="dew-input font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Brand Name</label>
                <input
                  type="text"
                  value={bulkEditForm.brand}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, brand: e.target.value })}
                  placeholder="e.g. Minimalist, Dew & Go (leaves current if blank)"
                  className="dew-input font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal mb-1">Publication Status</label>
                <select
                  value={bulkEditForm.publishPolicy}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, publishPolicy: e.target.value as any })}
                  className="dew-input font-medium"
                >
                  <option value="draft">Save as Draft (Safe default)</option>
                  <option value="published">Publish (Requires valid selling price)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                onClick={() => setBulkEditModalOpen(false)}
                className="dew-btn-outline !py-2 !px-4 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyBulkEdit}
                className="dew-btn-berry !py-2 !px-5 text-xs font-bold"
              >
                Apply & Revalidate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
