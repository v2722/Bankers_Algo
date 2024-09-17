function parseInputData(inputData) {
    return inputData.split('\n').map(row => row.trim().split(',').map(Number));
}

function generateTables() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const numResources = parseInt(document.getElementById('numResources').value);

    const allocationTableContainer = document.getElementById('allocationTableContainer');
    allocationTableContainer.innerHTML = '';
    allocationTableContainer.appendChild(generateTable('allocationTable', numProcesses, numResources, 'Allocation Table'));

    const maxResourceTableContainer = document.getElementById('maxResourceTableContainer');
    maxResourceTableContainer.innerHTML = '';
    maxResourceTableContainer.appendChild(generateTable('maxResourceTable', numProcesses, numResources, 'Maximum Resource Table'));

    document.getElementById('runBankersAlgorithm').style.display = 'block';
}

function generateTable(tableId, numRows, numCols, tableName) {
    const table = document.createElement('table');
    table.id = tableId;

    const tableHead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.innerHTML = `<th colspan="${numCols}">${tableName}</th>`;
    tableHead.appendChild(headRow);

    const resourceRow = document.createElement('tr');
    resourceRow.innerHTML = '<th></th>';
    for (let j = 0; j < numCols; j++) {
        resourceRow.innerHTML += `<th>R${j}</th>`;
    }
    tableHead.appendChild(resourceRow);

    table.appendChild(tableHead);

    const tableBody = document.createElement('tbody');
    for (let i = 0; i < numRows; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>Process ${i + 1}</td>`;
        for (let j = 0; j < numCols; j++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `${tableId}_${i}_${j}`;
            cell.appendChild(input);
            row.appendChild(cell);
        }
        tableBody.appendChild(row);
    }
    table.appendChild(tableBody);

    return table;
}

function runBankersAlgorithm() {
    const numProcesses = parseInt(document.getElementById('numProcesses').value);
    const numResources = parseInt(document.getElementById('numResources').value);

    const maxResources = [];
    const allocations = [];
    const available = document.getElementById('availableInput').value.split(',').map(Number);

    for (let i = 0; i < numProcesses; i++) {
        const maxRow = [];
        const allocRow = [];
        for (let j = 0; j < numResources; j++) {
            maxRow.push(parseInt(document.getElementById(`maxResourceTable_${i}_${j}`).value));
            allocRow.push(parseInt(document.getElementById(`allocationTable_${i}_${j}`).value));
        }
        maxResources.push(maxRow);
        allocations.push(allocRow);
    }

    const need = [];
    const available2 = [];
    const finished = new Array(numProcesses).fill(false);
    const safeSequence = [];

    for (let i = 0; i < numProcesses; i++) {
        const needRow = [];
        for (let j = 0; j < numResources; j++) {
            needRow.push(maxResources[i][j] - allocations[i][j]);
        }
        need.push(needRow);
    }

    let work = available.slice();
    let count = 0;
    while (count < numProcesses) {
        let found = false;
        for (let i = 0; i < numProcesses; i++) {
            if (!finished[i]) {
                let canAllocate = true;
                const x = [];
                for (let j = 0; j < numResources; j++) {
                    if (need[i][j] > work[j]) {
                        canAllocate = false;
                        break;
                    }
                }
                if (canAllocate) {
                    for (let j = 0; j < numResources; j++) {
                        work[j] += allocations[i][j];
                        x.push(work[j]);
                    }
                    safeSequence.push(i);
                    finished[i] = true;
                    found = true;
                    count++;
                    available2.push(x);
                }
            }
        }
        if (!found) {
            break;
        }
    }

    const resultsBody = document.getElementById('resultsBody');
    resultsBody.innerHTML = '';

    if (safeSequence.length === numProcesses) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${safeSequence.map(p => `P${p}`).join(', ')}</td>`;
        resultsBody.appendChild(row);

        const needMatrixContainer = document.getElementById('needMatrixContainer');
        needMatrixContainer.style.display = 'block';
        const needMatrixHeader = document.getElementById('needMatrixHeader');
        const needMatrixBody = document.getElementById('needMatrixBody');

        needMatrixHeader.innerHTML = '<th>Processes</th>';
        for (let i = 0; i < numResources; i++) {
            needMatrixHeader.innerHTML += `<th>Resource ${i + 1}</th>`;
        }

        needMatrixBody.innerHTML = '';
        need.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>P${index}</td>` + row.map(val => `<td>${val}</td>`).join('');
            needMatrixBody.appendChild(tr);
        });

        const availableMatrixContainer = document.getElementById('availableMatrixContainer');
        availableMatrixContainer.style.display = 'block';
        const availableMatrixHeader = document.getElementById('availableMatrixHeader');
        const availableMatrixBody = document.getElementById('availableMatrixBody');

        availableMatrixHeader.innerHTML = '<th>Processes</th>';
        for (let i = 0; i < numResources; i++) {
            availableMatrixHeader.innerHTML += `<th>Resource ${i + 1}</th>`;
        }

        availableMatrixBody.innerHTML = '';
        available2.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>P${index}</td>` + row.map(val => `<td>${val}</td>`).join('');
            availableMatrixBody.appendChild(tr);
        });

        document.getElementById('message').textContent = 'The system is in a safe state.Hence,there is no deadlock in the system.';
        document.getElementById('message').style.color = 'green';
    } else {
        document.getElementById('message').textContent = 'The system is NOT in a safe state. Deadlock may occur.';
        document.getElementById('message').style.color = 'red';
    }
}
