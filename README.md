## Frappe Enhancement

Frappe various script enhancement
1. Add Detail View on the ListViewRow
```
    onload: function(listview) {
        
        this.collapsiblePanel = new frappe.ui.CollapsiblePanel({
            doctype: 'Bulk Salary Adjustment',
            childFieldname: 'items',
            tableTitle: 'Salary Adjustment Items',
            columns: [
                { fieldname: 'employee_name', label: 'Employee Name' },
                { fieldname: 'staff_no', label: 'Staff No' },
                { fieldname: 'ic_no', label: 'IC No' },
                { fieldname: 'payroll_date', label: 'Payroll Date' },
                { fieldname: 'from_date', label: 'From Date' },
                { fieldname: 'to_date', label: 'To Date' },
                { fieldname: 'salary_component', label: 'Salary Component' },
                { fieldname: 'prev_amount', label: 'Prev Amount' },
                { fieldname: 'amount', label: 'New Amount' }
            ],
            allowEdit: false,
            allowPrint: false,
            allowSearch: true,
            showTable: true // Set to false to only show your custom HTML
        });
        
        // Setup the panel
        this.collapsiblePanel.setup();

        
    }
```
### Output

![image](https://github.com/user-attachments/assets/a8010115-d6ab-4b28-9f36-0973d85176fa)

2. Searchable Select DataType
```
frappe.ui.form.extensions.makeSearchableDropdown(frm, "custom_msic_code_");
```

### Output
<img width="300" alt="image" src="https://github.com/user-attachments/assets/f477c1e3-1351-4a9b-80e0-35c4043dd0e0" />

#### License

MIT
