(()=>{frappe.provide("frappe.ui");frappe.ui.CollapsiblePanel=class{constructor(t){this.doctype=t.doctype,this.childDoctype=t.childDoctype||null,this.childFieldname=t.childFieldname||"items",this.columns=t.columns||[],this.tableTitle=t.tableTitle||"Items",this.refreshInterval=t.refreshInterval||1e3,this.idFieldname=t.idFieldname||"name",this.allowEdit=t.allowEdit!==void 0?t.allowEdit:!0,this.allowPrint=t.allowPrint!==void 0?t.allowPrint:!0,this.allowSearch=t.allowSearch!==void 0?t.allowSearch:!0,this.showTable=t.showTable!==void 0?t.showTable:!0,this.customHtmlTop=t.customHtmlTop||"",this.customHtmlBottom=t.customHtmlBottom||"",this.customHtmlEmpty=t.customHtmlEmpty||"",this.currentItems=[],this.loadCssStyles()}loadCssStyles(){if(!document.getElementById("collapsible-panel-styles")){let t=`
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
            `,e=document.createElement("style");e.id="collapsible-panel-styles",e.textContent=t,document.head.appendChild(e)}}setup(){this.setupCollapsibleRows()}setupCollapsibleRows(){let t=this;$(document).on("refresh",".frappe-list",function(){setTimeout(()=>t.refresh(),500)}),setTimeout(()=>{console.log(`Setting up collapsible rows for ${this.doctype}`),$(".list-row-container").each(function(){let e=$(this),i=e.find(`a.ellipsis[data-doctype="${t.doctype}"]`),o="";if(i.length>0?o=i.attr("data-name"):o=e.find(`.list-row-col[data-fieldname="${t.idFieldname}"]`).text().trim(),!o)return;let l=e.find(".list-row-col:first-child");l.find(".toggle-row").length===0&&l.append(`
                        <span class="toggle-row" data-docname="${o}">
                            <i class="fa fa-chevron-down"></i>
                        </span>
                    `)}),$(".toggle-row").off("click").on("click",function(e){e.stopPropagation();let i=$(this),o=i.closest(".list-row-container"),s=i.attr("data-docname");if(!s||s==="undefined"){let c=o.find(`a.ellipsis[data-doctype="${t.doctype}"]`);c.length>0&&(s=c.attr("data-name")),s||(s=o.find(`.list-row-col[data-fieldname="${t.idFieldname}"]`).text().trim())}if(!s){frappe.show_alert({message:"Could not find document ID",indicator:"red"});return}$(".collapsible-row").not(o.next(".collapsible-row")).slideUp(200),$(".toggle-row").not(i).find("i").removeClass("fa-chevron-up").addClass("fa-chevron-down");let r=o.next(".collapsible-row");if(i.find("i").toggleClass("fa-chevron-down fa-chevron-up"),r.length===0){let c=$(`
                        <div class="collapsible-row" data-docname="${s}">
                            <div class="collapsible-content">
                                <div class="text-center">
                                    <div class="loader">
                                        <i class="fa fa-spinner fa-spin fa-2x"></i>
                                        <p>Loading items...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);o.after(c),c.slideDown(200),t.fetchDocumentData(s,c.find(".collapsible-content"))}else r.slideToggle(200)})},this.refreshInterval)}fetchDocumentData(t,e){let i=this;frappe.call({method:"frappe.client.get",args:{doctype:this.doctype,name:t},callback:function(o){if(o.message){let s=o.message[i.childFieldname]||[];i.currentItems=s,i.renderItemsTable(s,t,e)}else e.html(`
                        <div class="alert alert-warning">
                            Could not load data for ${t}
                        </div>
                    `)},error:function(o){e.html(`
                    <div class="alert alert-danger">
                        Error loading data: ${o.message||"Unknown error"}
                    </div>
                `)}})}renderItemsTable(t,e,i){let o=this,l="";this.customHtmlTop&&(l+=`
                <div class="custom-html-container custom-html-top">
                    ${this.customHtmlTop}
                </div>
            `);let s="";this.allowSearch&&this.showTable&&(s=`
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
            `),this.showTable&&(l+=`
                <div class="row">
                    <div class="col-sm-12">
                        <h5>${this.tableTitle}</h5>
                        ${s}
                        <div class="table-scroll-container">
                            <table class="child-table">
                                <thead>
                                    <tr>
                                        <th>No.</th>
            `,this.columns.forEach(r=>{l+=`<th>${r.label}</th>`}),l+=`
                                    </tr>
                                </thead>
                                <tbody>
            `,t.length>0?t.forEach((r,c)=>{l+=`<tr data-index="${c}"><td>${c+1}</td>`,this.columns.forEach(n=>{console.log("type ",n.type);let a=r[n.fieldname]||"";typeof n.value=="function"?a=frappe.form.formatters.Link(a,{options:n.options}):n.type==="Link"?a=frappe.form.formatters.Link(a,{options:n.options}):n.type==="Date"?a=frappe.form.formatters.Date(a):n.type==="Datetime"?a=frappe.form.formatters.Datetime(a):n.type==="Currency"?!isNaN(a)&&a!==""&&(a=parseFloat(a),a=frappe.form.formatters.Currency(a,{precision:2})):a=a,l+=`<td data-field="${n.fieldname}">${a}</td>`}),l+="</tr>"}):this.customHtmlEmpty?l+=`
                        <tr>
                            <td colspan="${this.columns.length+1}" class="text-center">
                                ${this.customHtmlEmpty}
                            </td>
                        </tr>
                    `:l+=`
                        <tr>
                            <td colspan="${this.columns.length+1}" class="text-center">No items found</td>
                        </tr>
                    `,l+=`
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `),this.customHtmlBottom&&(l+=`
                <div class="custom-html-container custom-html-bottom">
                    ${this.customHtmlBottom}
                </div>
            `),l+=`
            <div class="row mt-3">
                <div class="col-sm-12 text-right action-buttons" style="text-align: right; margin-bottom: 10px;">
        `,this.allowPrint&&(l+=`
                <button class="btn btn-xs btn-default print-doc" style="margin-right: 5px;">
                    <i class="fa fa-print"></i> Print
                </button>
            `),this.allowEdit&&(l+=`
                <button class="btn btn-xs btn-primary edit-doc">
                    <i class="fa fa-pencil"></i> Edit
                </button>
            `),l+=`
                </div>
            </div>
        `,i.html(l),this.allowSearch&&this.showTable&&this.setupSearch(i,e),this.allowPrint&&i.find(".print-doc").on("click",function(){frappe.show_alert({message:`Printing document: ${e}`,indicator:"green"}),window.open(`/printview?doctype=${encodeURIComponent(o.doctype)}&name=${encodeURIComponent(e)}&format=Standard&no_letterhead=0&_lang=en`,"_blank")}),this.allowEdit&&i.find(".edit-doc").on("click",function(){frappe.show_alert({message:`Opening document: ${e}`,indicator:"green"});let r=frappe.utils.get_form_link(o.doctype,e);window.location.href=r}),(this.customHtmlTop||this.customHtmlBottom)&&this.setupCustomHtmlHandlers(i,e)}setupCustomHtmlHandlers(t,e){t.find(".custom-button").on("click",function(){let i=$(this).data("action");frappe.show_alert({message:`Custom action: ${i} for document: ${e}`,indicator:"blue"})})}setupSearch(t,e){let i=this,o=t.find(".search-input"),l=t.find(".search-btn"),s=t.find(".clear-search-btn"),r=t.find(".search-result-info"),n=t.find(".child-table").find("tbody"),a=()=>{let d=o.val().trim().toLowerCase();if(!d){f();return}s.show();let p=0,b=i.currentItems.length;n.find("tr").each(function(){let h=$(this),m=!1;h.find("td").length!==1&&(h.find("td").each(function(u){if(u===0)return;if($(this).text().toLowerCase().includes(d)){m=!0;let g=$(this).text().replace(new RegExp(d,"gi"),w=>`<span class="highlight-text">${w}</span>`);$(this).html(g)}}),m?(h.show(),h.addClass("highlight"),p++):h.hide())}),r.text(`Found ${p} of ${b} items`).show()},f=()=>{s.hide(),r.hide(),o.val(""),n.find("tr").each(function(){$(this).show().removeClass("highlight"),$(this).find("td").each(function(){let d=$(this);d.html(d.text())})})};l.on("click",a),s.on("click",f),o.on("keypress",function(d){d.which===13&&(a(),d.preventDefault())}),o.on("input",function(){$(this).val().trim()?s.show():s.hide()})}refresh(){this.setupCollapsibleRows(),$(".collapsible-row").slideUp(200),$(".toggle-row i").removeClass("fa-chevron-up").addClass("fa-chevron-down")}};})();
//# sourceMappingURL=frappe_enhancement.bundle.RHGU7RBO.js.map
