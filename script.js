let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installBtn = document.createElement('button');
    installBtn.textContent = "📥 Instalar la App";
    installBtn.style.position = "fixed";
    installBtn.style.bottom = "20px";
    installBtn.style.right = "20px";
    installBtn.style.padding = "10px";
    installBtn.style.background = "#008080";
    installBtn.style.color = "#fff";
    installBtn.style.border = "none";
    installBtn.style.borderRadius = "5px";
    installBtn.style.cursor = "pointer";

    installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') {
                console.log("✅ PWA instalada correctamente");
                installBtn.remove();
            }
            deferredPrompt = null;
        });
    });

    document.body.appendChild(installBtn);
});

// IndexedDB
const dbName = "GastosDB";
let db;

// Abrir base de datos
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
    console.error("❌ Error al abrir IndexedDB", event.target.error);
};

// Agregar transacción
document.getElementById("transaction-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const concepto = document.getElementById("concepto").value;
    const monto = parseFloat(document.getElementById("monto").value);
    const tipo = document.getElementById("tipo").value;

    if (!concepto || isNaN(monto)) return;

    const transaction = { id: Date.now(), concepto, monto, tipo, date: new Date().toISOString() };

    const tx = db.transaction(["transactions"], "readwrite");
    const store = tx.objectStore("transactions");
    store.add(transaction);

    tx.oncomplete = function() {
        loadTransactions();
        document.getElementById("transaction-form").reset();
    };
});

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
            li.innerHTML = `
                ${trans.concepto}: $${trans.monto.toFixed(2)} 
                <button onclick="editTransaction(${trans.id})">✏️</button>
                <button onclick="deleteTransaction(${trans.id})">🗑️</button>
            `;
            list.appendChild(li);
        });
        document.getElementById("balance").textContent = `$${balance.toFixed(2)}`;
    };
}

// Eliminar transacción
function deleteTransaction(id) {
    const tx = db.transaction(["transactions"], "readwrite");
    const store = tx.objectStore("transactions");
    store.delete(id);
    tx.oncomplete = () => loadTransactions();
}

// Editar transacción
function editTransaction(id) {
    const tx = db.transaction(["transactions"], "readonly");
    const store = tx.objectStore("transactions");
    const request = store.get(id);
    
    request.onsuccess = function() {
        const trans = request.result;
        document.getElementById("concepto").value = trans.concepto;
        document.getElementById("monto").value = trans.monto;
        document.getElementById("tipo").value = trans.tipo;

        deleteTransaction(id);
    };
}
