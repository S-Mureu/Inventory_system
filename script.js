let inventory = [];
const lowStockThreshold = 5;

function showTab(tab) {
    document.getElementById('home').style.display = tab === 'home' ? 'block' : 'none';
    document.getElementById('create').style.display = tab === 'create' ? 'block' : 'none';

    if (tab === 'home') {
        renderHomeView();
    } else {
        renderTable();
    }
}

function addItem() {
    const itemName = document.getElementById('itemName').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const location = document.getElementById('location').value;
    const supplier = document.getElementById('supplier').value;

    if (!itemName || isNaN(quantity) || !location || !supplier) {
        alert("Please fill in all fields");
        return;
    }

    const item = {
        id: Date.now(),
        name: itemName,
        quantity: quantity,
        location: location,
        supplier: supplier,
    };

    inventory.push(item);
    renderTable();
    clearForm();
    updateAnalytics();
}

function renderTable() {
    const tbody = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    inventory.forEach(item => {
        const row = tbody.insertRow();

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.location}</td>
            <td>${item.supplier}</td>
            <td>
                <button onclick="editItem(${item.id})">Edit</button>
                <button onclick="deleteItem(${item.id})">Delete</button>
            </td>
        `;
    });

    checkLowStock();
}

function renderHomeView() {
    const homeTbody = document.getElementById('homeInventoryTable').getElementsByTagName('tbody')[0];
    homeTbody.innerHTML = '';

    inventory.forEach(item => {
        const row = homeTbody.insertRow();

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.location}</td>
            <td>${item.supplier}</td>
        `;
    });
}

function editItem(id) {
    const item = inventory.find(i => i.id === id);
    document.getElementById('itemName').value = item.name;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('location').value = item.location;
    document.getElementById('supplier').value = item.supplier;

    deleteItem(id);
}

function deleteItem(id) {
    inventory = inventory.filter(item => item.id !== id);
    renderTable();
    updateAnalytics();
}

function checkLowStock() {
    const lowStockItems = inventory.filter(item => item.quantity < lowStockThreshold);
    document.getElementById('alerts').innerText = 
        lowStockItems.length ? "Low stock alert: Some items need restocking!" : "";
}

function updateAnalytics() {
    document.getElementById('totalItems').innerText = inventory.length;
    document.getElementById('lowStockItems').innerText = 
        inventory.filter(item => item.quantity < lowStockThreshold).length;
}

function clearForm() {
    document.getElementById('itemName').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('location').value = '';
    document.getElementById('supplier').value = '';
}


