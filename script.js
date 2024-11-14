let inventory = [];
const lowStockThreshold = 5;

// Show tabs and render data
function showTab(tab) {
    document.querySelectorAll('.tab').forEach(tab => tab.style.display = 'none');
    document.getElementById(tab).style.display = 'block';

    if (tab === 'home') renderHomeView();
    if (tab === 'create') renderTable();
    if (tab === 'search') searchInventory(); // Clear results if needed
    if (tab === 'history') loadHistory();
}

// Render Home View
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

// Quick Search Function
function searchInventory() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const resultsTable = document.getElementById('searchResultsTable').getElementsByTagName('tbody')[0];
    resultsTable.innerHTML = '';

    inventory.filter(item => 
        item.name.toLowerCase().includes(query)
    ).forEach(item => {
        const row = resultsTable.insertRow();
        row.innerHTML = `<td>${item.name}</td><td>${item.quantity}</td><td>${item.location}</td><td>${item.supplier}</td>`;
    });
}

// Item Status Tag
function addStatusTag(item) {
    if (item.quantity === 0) return 'Discontinued';
    if (item.quantity < lowStockThreshold) return 'Low Stock';
    return 'In Stock';
}

// Load Stock Movement History
function loadHistory() {
    const historyTable = document.getElementById('movementHistoryTable').getElementsByTagName('tbody')[0];
    historyTable.innerHTML = ''; // Clear previous history

    const historyData = JSON.parse(localStorage.getItem('stockHistory')) || [];
    historyData.forEach(entry => {
        const row = historyTable.insertRow();
        row.innerHTML = `<td>${entry.date}</td><td>${entry.action}</td><td>${entry.item}</td>`;
    });
}

// Open IndexedDB
let db;
const request = indexedDB.open("InventoryDB", 1);

request.onerror = event => {
    console.error("Database error:", event.target.errorCode);
};

request.onsuccess = event => {
    db = event.target.result;
    loadInventory();
};

request.onupgradeneeded = event => {
    db = event.target.result;
    const objectStore = db.createObjectStore("inventory", { keyPath: "id" });
    objectStore.createIndex("name", "name", { unique: false });
};

// Add Item with Status Tag and Stock History
function addItem() {
    const itemName = document.getElementById('itemName').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const location = document.getElementById('location').value;
    const supplier = document.getElementById('supplier').value;

    const item = {
        id: Date.now(),
        name: itemName,
        quantity: quantity,
        location: location,
        supplier: supplier,
        status: addStatusTag({ quantity })
    };

    const transaction = db.transaction(["inventory"], "readwrite");
    transaction.objectStore("inventory").add(item);

    // Update stock history to log the "Added" action
    const stockHistory = JSON.parse(localStorage.getItem('stockHistory')) || [];
    stockHistory.push({ date: new Date().toLocaleString(), action: 'Added', item: itemName });
    localStorage.setItem('stockHistory', JSON.stringify(stockHistory));

    inventory.push(item);
    renderTable();
    updateAnalytics();
}

// Render and Update Analytics
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
            <td>${item.status}</td>
            <td>
                <button onclick="deleteItem(${item.id})">Delete</button>
                <button onclick="editItem(${item.id})">Edit</button>
            </td>
        `;
    });

    updateAnalytics();
}

// Delete Item and Update Stock History
function deleteItem(id) {
    const item = inventory.find(item => item.id === id);
    const transaction = db.transaction(["inventory"], "readwrite");
    transaction.objectStore("inventory").delete(id);

    // Update stock history to log the "Deleted" action
    const stockHistory = JSON.parse(localStorage.getItem('stockHistory')) || [];
    stockHistory.push({ date: new Date().toLocaleString(), action: 'Deleted', item: item.name });
    localStorage.setItem('stockHistory', JSON.stringify(stockHistory));

    inventory = inventory.filter(item => item.id !== id);
    renderTable();
    updateAnalytics();
}

// Update Analytics
function updateAnalytics() {
    document.getElementById('totalItems').innerText = inventory.length;
    document.getElementById('lowStockItems').innerText = inventory.filter(item => item.quantity < lowStockThreshold).length;
}

// Load Inventory from IndexedDB
function loadInventory() {
    inventory = [];
    const transaction = db.transaction(["inventory"], "readonly");
    const objectStore = transaction.objectStore("inventory");
    objectStore.openCursor().onsuccess = event => {
        const cursor = event.target.result;
        if (cursor) {
            inventory.push(cursor.value);
            cursor.continue();
        } else {
            renderTable();
            updateAnalytics();
        }
    };
}

// On page load
window.onload = () => {
    showTab('home');
    loadInventory();
};

// Delete History Data with Passcode
function deleteHistory() {
    const enteredPasscode = prompt("Enter passcode to delete all history:");
    if (enteredPasscode === "0701330765") {
        localStorage.removeItem('stockHistory');
        loadHistory();
        alert("History deleted successfully.");
    } else {
        alert("Incorrect passcode. History was not deleted.");
    }
}

let passcode = localStorage.getItem('inventoryPasscode') || '0701330765'; // Set default passcode to "0701330765"


// Change Passcode
function changePasscode() {
    const currentPasscode = document.getElementById('currentPasscode').value;
    const newPasscode = document.getElementById('newPasscode').value;

    // Retrieve current passcode from local storage or default to 0701330765
    const savedPasscode = localStorage.getItem('inventoryPasscode') || "0701330765";

    if (currentPasscode === savedPasscode) {
        if (newPasscode) {
            // Update the passcode in local storage
            localStorage.setItem('inventoryPasscode', newPasscode);
            alert("Passcode changed successfully.");
            document.getElementById('currentPasscode').value = '';
            document.getElementById('newPasscode').value = '';
        } else {
            alert("New passcode cannot be empty.");
        }
    } else {
        alert("Current passcode is incorrect.");
    }
}

