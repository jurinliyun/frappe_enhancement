frappe.provide('frappe.ui');

frappe.ui.CollapsiblePanel = class CollapsiblePanel {
    constructor(opts) {
        // Store options
        this.doctype = opts.doctype;
        this.childDoctype = opts.childDoctype || null;
        this.childFieldname = opts.childFieldname || 'items';
        this.columns = opts.columns || [];
        this.tableTitle = opts.tableTitle || 'Items';
        this.refreshInterval = opts.refreshInterval || 1000;
        this.idFieldname = opts.idFieldname || 'name';
        this.allowEdit = opts.allowEdit !== undefined ? opts.allowEdit : true;
        this.allowPrint = opts.allowPrint !== undefined ? opts.allowPrint : true;
        this.allowSearch = opts.allowSearch !== undefined ? opts.allowSearch : true;
        this.showTable = opts.showTable !== undefined ? opts.showTable : true;
        this.customHtmlTop = opts.customHtmlTop || '';
        this.customHtmlBottom = opts.customHtmlBottom || '';
        this.customHtmlEmpty = opts.customHtmlEmpty || '';
        this.currentItems = []; // Store the current items for searching
        this.loadCssStyles();
    }

    loadCssStyles() {
        // Add custom CSS styles if not already present
        if (!document.getElementById('collapsible-panel-styles')) {
            const styles = `
                .collapsible-row {
                    display: none;
                    margin-top: -1px;
                    max-height: 500px;
                    overflow: hidden;
                }

                .collapsible-content {
                    max-height: 480px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    margin-left: 10px;
                    margin-right: 10px;
                    padding-top: 20px;
                    padding-right: 20px;
                    padding-left: 20px;
                    border-left:2px solid rgb(235, 234, 182);
                    border-right:2px solid rgb(235, 234, 182);
                    border-bottom:2px solid rgb(235, 234, 182);
                }

                .toggle-row {
                    cursor: pointer;
                    margin-left: 5px;
                    color:rgb(180, 192, 204);
                }

                .toggle-row:hover {
                    color:rgb(203, 205, 137);
                }

                .table-scroll-container {
                    overflow: auto;
                    max-height: 350px;
                    position: relative;
                    margin-top: 10px;
                    border: 1px solid #ddd;
                }

                .child-table {
                    width: 100%;
                    min-width: 800px;
                    border-collapse: collapse;
                }

                .child-table th, .child-table td {
                    padding: 8px;
                    border: 1px solid #ddd;
                    text-align: left;
                    white-space: nowrap;
                    font-size: 11px;
                }

                .child-table th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                    font-size: 11px;
                    box-shadow: 0 1px 1px rgba(0,0,0,0.1);
                }

                .child-table tr:nth-child(even) {
                    background-color: #f9f9f9;
                }

                .child-table tr:nth-child(odd) {
                    background-color: #ffffff;
                }

                .child-table tr.highlight {
                    background-color:rgb(235, 234, 182);
                }

                .action-buttons {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 10px;
                    clear: both;
                }

                .action-buttons button {
                    margin-left: 8px;
                }

                .search-container {
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                }

                .search-container input {
                    flex-grow: 1;
                    padding: 6px 8px;
                    border: 1px solid #d1d8dd;
                    border-radius: 4px;
                    margin-right: 8px;
                }

                .search-container button {
                    margin-left: 4px;
                }

                .search-result-info {
                    margin-top: 5px;
                    color: #8d99a6;
                    font-size: 10px;
                }

                .highlight-text {
                    background-color: #ffeb3b;
                    padding: 1px 3px;
                    border-radius: 2px;
                }

                .custom-html-container {
                    margin: 10px 0;
                }

                /* Scrollbar styling */
                .collapsible-content::-webkit-scrollbar,
                .table-scroll-container::-webkit-scrollbar {
                    width: 3px; /* Width of the vertical scrollbar */
                    height: 3px; /* Height of the horizontal scrollbar */
                }

                .collapsible-content::-webkit-scrollbar-thumb,
                .table-scroll-container::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.1); /* More transparent background */
                    border-radius: 10px; /* Rounded corners */
                }

                .collapsible-content::-webkit-scrollbar-track,
                .table-scroll-container::-webkit-scrollbar-track {
                    background: transparent; /* Transparent track */
                }

                /* For Firefox */
                .collapsible-content,
                .table-scroll-container {
                    scrollbar-width: thin; /* Thin scrollbar */
                    scrollbar-color: rgba(0, 0, 0, 0.1) transparent; /* More transparent background */
                }
            `;
            
            const styleElement = document.createElement('style');
            styleElement.id = 'collapsible-panel-styles';
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }
    }

    setup() {
        // Add setup logic here
        this.setupCollapsibleRows();
    }

    setupCollapsibleRows() {
        const self = this;
        
        // Add a listener for table refresh events
        $(document).on('refresh', '.frappe-list', function() {
            setTimeout(() => self.refresh(), 500);
        });
        
        // Wait for DOM to be ready with rows
        setTimeout(() => {
            console.log(`Setting up collapsible rows for ${this.doctype}`);
            
            // Find each row container
            $('.list-row-container').each(function() {
                const $row = $(this);
                
                // Get docname from the anchor tag
                const $anchor = $row.find(`a.ellipsis[data-doctype="${self.doctype}"]`);
                let docname = "";
                
                if ($anchor.length > 0) {
                    docname = $anchor.attr('data-name');
                } else {
                    // Fallback to the name column if anchor not found
                    const $idColumn = $row.find(`.list-row-col[data-fieldname="${self.idFieldname}"]`);
                    docname = $idColumn.text().trim();
                }
                
                // If docname is empty or undefined, skip this row
                if (!docname) return;
                
                // Use a selector to locate the checkbox column
                const $checkboxColumn = $row.find('.list-row-col:first-child');
                
                // Only add the button if it doesn't already exist
                if ($checkboxColumn.find('.toggle-row').length === 0) {
                    $checkboxColumn.append(`
                        <span class="toggle-row" data-docname="${docname}">
                            <i class="fa fa-chevron-down"></i>
                        </span>
                    `);
                }
            });
            
            // Add click handler for toggle buttons
            $('.toggle-row').off('click').on('click', function(e) {
                e.stopPropagation();
                const $this = $(this);
                const $row = $this.closest('.list-row-container');
                
                // Get docname from the data attribute
                const docname = $this.attr('data-docname');
                
                // Verify docname
                let finalDocname = docname;
                if (!finalDocname || finalDocname === "undefined") {
                    // Try getting it from the anchor
                    const $anchor = $row.find(`a.ellipsis[data-doctype="${self.doctype}"]`);
                    if ($anchor.length > 0) {
                        finalDocname = $anchor.attr('data-name');
                    }
                    
                    // If still not found, try the text content
                    if (!finalDocname) {
                        const $idColumn = $row.find(`.list-row-col[data-fieldname="${self.idFieldname}"]`);
                        finalDocname = $idColumn.text().trim();
                    }
                }
                
                // Show an alert if docname is still missing
                if (!finalDocname) {
                    frappe.show_alert({
                        message: "Could not find document ID",
                        indicator: 'red'
                    });
                    return;
                }
                
                // Close any other open panels first
                $('.collapsible-row').not($row.next('.collapsible-row')).slideUp(200);
                $('.toggle-row').not($this).find('i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
                
                const $collapseRow = $row.next('.collapsible-row');
                
                // Toggle icon
                $this.find('i').toggleClass('fa-chevron-down fa-chevron-up');
                
                // Check if collapsible row exists
                if ($collapseRow.length === 0) {
                    // Create new row with loading indicator and inner scrollable container
                    const $newRow = $(`
                        <div class="collapsible-row" data-docname="${finalDocname}">
                            <div class="collapsible-content">
                                <div class="text-center">
                                    <div class="loader">
                                        <i class="fa fa-spinner fa-spin fa-2x"></i>
                                        <p>Loading items...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);
                    
                    $row.after($newRow);
                    $newRow.slideDown(200);
                    
                    // Fetch document data
                    self.fetchDocumentData(finalDocname, $newRow.find('.collapsible-content'));
                } else {
                    // Toggle visibility of existing row
                    $collapseRow.slideToggle(200);
                }
            });
        }, this.refreshInterval);
    }
    
    fetchDocumentData(docname, $container) {
        const self = this;
        
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: this.doctype,
                name: docname
            },
            callback: function(response) {
                if (response.message) {
                    const doc = response.message;
                    let items = doc[self.childFieldname] || [];
                    
                    // Store items for search functionality
                    self.currentItems = items;
                    
                    // Render items table
                    self.renderItemsTable(items, docname, $container);
                } else {
                    $container.html(`
                        <div class="alert alert-warning">
                            Could not load data for ${docname}
                        </div>
                    `);
                }
            },
            error: function(err) {
                $container.html(`
                    <div class="alert alert-danger">
                        Error loading data: ${err.message || "Unknown error"}
                    </div>
                `);
            }
        });
    }
    
    renderItemsTable(items, docname, $container) {
        const self = this;
        
        // Start building the content
        let contentHtml = '';
        
        // Add custom HTML at the top if provided
        if (this.customHtmlTop) {
            contentHtml += `
                <div class="custom-html-container custom-html-top">
                    ${this.customHtmlTop}
                </div>
            `;
        }
        
        // Add search box if enabled
        let searchHtml = '';
        if (this.allowSearch && this.showTable) {
            searchHtml = `
                <div class="search-container">
                    <input type="text" class="search-input form-control" placeholder="Search items..." />
                    <button class="btn btn-sm btn-default search-btn">
                        <i class="fa fa-search"></i>
                    </button>
                    <button class="btn btn-sm btn-default clear-search-btn" style="display: none;">
                        <i class="fa fa-times"></i>
                    </button>
                </div>
                <div class="search-result-info" style="display: none;"></div>
            `;
        }
        
        // Add table section if showTable is true
        if (this.showTable) {
            contentHtml += `
                <div class="row">
                    <div class="col-sm-12">
                        <h5>${this.tableTitle}</h5>
                        ${searchHtml}
                        <div class="table-scroll-container">
                            <table class="child-table">
                                <thead>
                                    <tr>
                                        <th>No.</th>
            `;
            
            // Add column headers
            this.columns.forEach(column => {
                contentHtml += `<th>${column.label}</th>`;
            });
            
            contentHtml += `
                                    </tr>
                                </thead>
                                <tbody>
            `;
            
            // Add rows
            if (items.length > 0) {
                items.forEach((item, index) => {
                    contentHtml += `<tr data-index="${index}"><td>${index + 1}</td>`;
                    
                    // Add columns for each item
                    this.columns.forEach(column => {
                        console.log('type ', column.type);
                        let value = item[column.fieldname] || '';
                    
                        if (typeof column.value === 'function') {
                            value = frappe.form.formatters.Link(value, { options: column.options });
                        } else if (column.type === 'Link') {
                            value = frappe.form.formatters.Link(value, { options: column.options });
                        } else if (column.type === 'Date') {
                            value = frappe.form.formatters.Date(value);
                        } else if (column.type === 'Datetime') {
                            value = frappe.form.formatters.Datetime(value);
                        } else if (column.type === 'Currency') {
                            // Ensure value is a number before formatting
                            if (!isNaN(value) && value !== '') {
                                value = parseFloat(value);
                                // Check if frappe.form.formatters.Currency expects additional options
                                value = frappe.form.formatters.Currency(value, { precision: 2 });
                            }
                        }
                        else{
                            value = value;
                        }
                    
                        contentHtml += `<td data-field="${column.fieldname}">${value}</td>`;
                    });
                    
                    contentHtml += `</tr>`;
                });
            } else {
                // Check if custom empty HTML is provided
                if (this.customHtmlEmpty) {
                    const colSpan = this.columns.length + 1;
                    contentHtml += `
                        <tr>
                            <td colspan="${colSpan}" class="text-center">
                                ${this.customHtmlEmpty}
                            </td>
                        </tr>
                    `;
                } else {
                    const colSpan = this.columns.length + 1;
                    contentHtml += `
                        <tr>
                            <td colspan="${colSpan}" class="text-center">No items found</td>
                        </tr>
                    `;
                }
            }
            
            contentHtml += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Add custom HTML at the bottom if provided
        if (this.customHtmlBottom) {
            contentHtml += `
                <div class="custom-html-container custom-html-bottom">
                    ${this.customHtmlBottom}
                </div>
            `;
        }
        
        // Add action buttons with fixed positioning and better styling
        contentHtml += `
            <div class="row mt-3">
                <div class="col-sm-12 text-right action-buttons" style="text-align: right; margin-bottom: 10px;">
        `;
        
        if (this.allowPrint) {
            contentHtml += `
                <button class="btn btn-xs btn-default print-doc" style="margin-right: 5px;">
                    <i class="fa fa-print"></i> Print
                </button>
            `;
        }
        
        if (this.allowEdit) {
            contentHtml += `
                <button class="btn btn-xs btn-primary edit-doc">
                    <i class="fa fa-pencil"></i> Edit
                </button>
            `;
        }
        
        contentHtml += `
                </div>
            </div>
        `;
        
        // Update the container
        $container.html(contentHtml);
        
        // Setup search functionality if enabled
        if (this.allowSearch && this.showTable) {
            this.setupSearch($container, docname);
        }
        
        // Add button event handlers
        if (this.allowPrint) {
            $container.find('.print-doc').on('click', function() {
                frappe.show_alert({
                    message: `Printing document: ${docname}`, 
                    indicator: 'green'
                });
                
                window.open(`/printview?doctype=${encodeURIComponent(self.doctype)}&name=${encodeURIComponent(docname)}&format=Standard&no_letterhead=0&_lang=en`, '_blank');
            });
        }
        
        if (this.allowEdit) {
            $container.find('.edit-doc').on('click', function() {
                frappe.show_alert({
                    message: `Opening document: ${docname}`, 
                    indicator: 'green'
                });
                
                const route = frappe.utils.get_form_link(self.doctype, docname);
                window.location.href = route;
            });
        }
        
        // Add custom event handlers to HTML elements if needed
        if (this.customHtmlTop || this.customHtmlBottom) {
            this.setupCustomHtmlHandlers($container, docname);
        }
    }
    
    setupCustomHtmlHandlers($container, docname) {
        // Add custom event handlers for elements in the custom HTML
        // This is a placeholder method that can be extended by the implementing class
        
        // Example of how to add a click handler to a button with class 'custom-button'
        $container.find('.custom-button').on('click', function() {
            const action = $(this).data('action');
            frappe.show_alert({
                message: `Custom action: ${action} for document: ${docname}`,
                indicator: 'blue'
            });
            
            // Custom logic can be added here based on the action
        });
    }
    
    setupSearch($container, docname) {
        const self = this;
        const $searchInput = $container.find('.search-input');
        const $searchBtn = $container.find('.search-btn');
        const $clearBtn = $container.find('.clear-search-btn');
        const $searchResultInfo = $container.find('.search-result-info');
        const $table = $container.find('.child-table');
        const $tbody = $table.find('tbody');
        
        // Function to perform search
        const performSearch = () => {
            const searchTerm = $searchInput.val().trim().toLowerCase();
            
            if (!searchTerm) {
                // If search term is empty, reset the table
                resetSearch();
                return;
            }
            
            // Show clear button
            $clearBtn.show();
            
            // Track matched rows
            let matchCount = 0;
            const totalRows = self.currentItems.length;
            
            // Loop through all table rows
            $tbody.find('tr').each(function() {
                const $row = $(this);
                let rowMatches = false;
                
                // Skip "No items found" row
                if ($row.find('td').length === 1) {
                    return;
                }
                
                // Check each cell in the row
                $row.find('td').each(function(index) {
                    // Skip the first cell (row number)
                    if (index === 0) return;
                    
                    const cellText = $(this).text().toLowerCase();
                    if (cellText.includes(searchTerm)) {
                        rowMatches = true;
                        
                        // Highlight the matched text
                        const originalText = $(this).text();
                        const highlightedText = originalText.replace(
                            new RegExp(searchTerm, 'gi'),
                            match => `<span class="highlight-text">${match}</span>`
                        );
                        $(this).html(highlightedText);
                    }
                });
                
                // Show/hide row based on match
                if (rowMatches) {
                    $row.show();
                    $row.addClass('highlight');
                    matchCount++;
                } else {
                    $row.hide();
                }
            });
            
            // Update search result info
            $searchResultInfo.text(`Found ${matchCount} of ${totalRows} items`).show();
        };
        
        // Function to reset search
        const resetSearch = () => {
            $clearBtn.hide();
            $searchResultInfo.hide();
            $searchInput.val('');
            
            // Reset all rows to their original state
            $tbody.find('tr').each(function() {
                $(this).show().removeClass('highlight');
                
                // Remove highlight spans
                $(this).find('td').each(function() {
                    const $cell = $(this);
                    $cell.html($cell.text());
                });
            });
        };
        
        // Bind search button click
        $searchBtn.on('click', performSearch);
        
        // Bind clear button click
        $clearBtn.on('click', resetSearch);
        
        // Bind Enter key press on search input
        $searchInput.on('keypress', function(e) {
            if (e.which === 13) {
                performSearch();
                e.preventDefault();
            }
        });
        
        // Bind input event to show/hide clear button
        $searchInput.on('input', function() {
            if ($(this).val().trim()) {
                $clearBtn.show();
            } else {
                $clearBtn.hide();
            }
        });
    }
    
    refresh() {
        // Method to refresh the collapsible panels when list is refreshed
        this.setupCollapsibleRows();
        
        // Collapse all collapsible panels
        $('.collapsible-row').slideUp(200);
        $('.toggle-row i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
    }
}