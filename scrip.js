

/* JavaScript - script.js */

const dbName = "GastosDB";
let db;

// Abrir o crear la base de datos
const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    loadTransactions();
};

request.onerror = function(event) {
    console.error("Error al abrir IndexedDB", event.target.error);
};

// Agregar transacción
function addTransaction(e) {
    e.preventDefault();

    const concepto = document.getElementById("concepto").value;
    const monto = parseFloat(document.getElementById("monto").value);
    const tipo = document.getElementById("tipo").value;

    if (!concepto || isNaN(monto)) return;

    const transaction = { concepto, monto, tipo, date: new Date().toISOString() };
    
    const tx = db.transaction(["transactions"], "readwrite");
    const store = tx.objectStore("transactions");
    store.add(transaction);
    tx.oncomplete = () => {
        loadTransactions();
        document.getElementById("transaction-form").reset();
    };
}

document.getElementById("transaction-form").addEventListener("submit", addTransaction);

// Cargar transacciones
function loadTransactions() {
    const tx = db.transaction(["transactions"], "readonly");
    const store = tx.objectStore("transactions");
    const request = store.getAll();

    request.onsuccess = function() {
        const transactions = request.result;
        const list = document.getElementById("transaction-list");
        list.innerHTML = "";
        let balance = 0;

        transactions.forEach(trans => {
            balance += trans.tipo === "ingreso" ? trans.monto : -trans.monto;
            const li = document.createElement("li");
            li.className = trans.tipo;
            li.textContent = `${trans.concepto}: $${trans.monto}`;
            list.appendChild(li);
        });
        document.getElementById("balance").textContent = `$${balance.toFixed(2)}`;
    };
}