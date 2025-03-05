document.addEventListener('DOMContentLoaded', function () {
    const tableSelect = document.getElementById('table-select');
    const operationSelect = document.getElementById('operation-select');
    const tableContainer = document.getElementById('table-container');
    const operationContainer = document.getElementById('operation-container');

    fetchTableData(tableSelect.value);

    tableSelect.addEventListener('change', function () {
        fetchTableData(tableSelect.value);
    });

    operationSelect.addEventListener('change', function () {
        renderOperationForm(operationSelect.value, tableSelect.value);
    });

    function fetchTableData(tableName) {
        fetch(`/get_table/${tableName}`)
            .then(response => response.json())
            .then(data => renderTable(data))
            .catch(error => console.error('Error:', error));
    }

    function renderTable(data) {
        if (data.length === 0) {
            tableContainer.innerHTML = '<p>No data available.</p>';
            return;
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        const headerRow = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        data.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            tr.dataset.index = rowIndex;
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);

            tr.addEventListener('click', function () {
                if (operationSelect.value === 'update') {
                    renderUpdateForm(row, data[0]);
                } else if (operationSelect.value === 'delete') {
                    renderDeleteForm(row);
                }
            });

            // Highlight row on hover for update and delete operations
            if (operationSelect.value === 'update' || operationSelect.value === 'delete') {
                tr.classList.add('highlight-on-hover');
            }
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.innerHTML = '';
        tableContainer.appendChild(table);
    }

    function renderOperationForm(operation, tableName) {
        operationContainer.innerHTML = '';

        if (operation === 'insert') {
            renderInsertForm(tableName);
        } else if (operation === 'update') {
            // Clear previous highlight classes
            clearHighlightClasses();
        } else if (operation === 'delete') {
            // Clear previous highlight classes
            clearHighlightClasses();
        }
    }

    function renderInsertForm(tableName) {
        fetch(`/get_columns/${tableName}`)
            .then(response => response.json())
            .then(columns => {
                const form = document.createElement('form');
                form.id = 'insert-form';

                columns.forEach(column => {
                    const label = document.createElement('label');
                    label.textContent = column;
                    const input = document.createElement('input');
                    input.name = column;
                    input.type = 'text';
                    form.appendChild(label);
                    form.appendChild(input);
                });

                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = 'table_name';
                hiddenInput.value = tableName;
                form.appendChild(hiddenInput);

                const submitButton = document.createElement('button');
                submitButton.type = 'submit';
                submitButton.textContent = 'Insert';
                form.appendChild(submitButton);

                form.addEventListener('submit', function (event) {
                    event.preventDefault();
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());

                    fetch('/insert', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                        .then(response => response.json())
                        .then(result => alert(result.message))
                        .catch(error => console.error('Error:', error));
                });

                operationContainer.appendChild(form);
            })
            .catch(error => console.error('Error:', error));
    }

    function renderUpdateForm(rowData, columns) {
        operationContainer.innerHTML = '';

        const form = document.createElement('form');
        form.id = 'update-form';

        Object.entries(rowData).forEach(([column, value]) => {
            const label = document.createElement('label');
            label.textContent = column;
            const input = document.createElement('input');
            input.name = column;
            input.type = 'text';
            input.value = value;
            form.appendChild(label);
            form.appendChild(input);
        });

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'table_name';
        hiddenInput.value = tableSelect.value;
        form.appendChild(hiddenInput);

        const primaryKeyInput = document.createElement('input');
        primaryKeyInput.type = 'hidden';
        primaryKeyInput.name = 'primary_key';
        primaryKeyInput.value = Object.keys(columns)[0]; // Assuming the first column is the primary key
        form.appendChild(primaryKeyInput);

        const primaryValueInput = document.createElement('input');
        primaryValueInput.type = 'hidden';
        primaryValueInput.name = 'primary_value';
        primaryValueInput.value = rowData[Object.keys(columns)[0]]; // Primary key value
        form.appendChild(primaryValueInput);

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Update';
        form.appendChild(submitButton);

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            fetch('/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(result => {
                    alert(result.message);
                    fetchTableData(tableSelect.value);
                })
                .catch(error => console.error('Error:', error));
        });

        operationContainer.appendChild(form);
    }

    function renderDeleteForm(rowData) {
        const primaryKey = Object.keys(rowData)[0]; // Assuming the first column is the primary key
        const primaryValue = rowData[primaryKey];
    
        if (confirm(`Are you sure you want to delete this row with ${primaryKey}: ${primaryValue}?`)) {
            const data = {
                table_name: tableSelect.value,
                primary_key: primaryKey,
                primary_value: primaryValue
            };
    
            fetch('/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(result => {
                    alert(result.message);
                    fetchTableData(tableSelect.value);
                })
                .catch(error => console.error('Error:', error));
        }
    }
    
    function clearHighlightClasses() {
        const rows = tableContainer.querySelectorAll('tr');
        rows.forEach(row => {
            row.classList.remove('highlight-on-hover');
        });
    }
});