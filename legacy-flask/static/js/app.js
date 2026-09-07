// === UTILITY FUNCTIONS ===

// Show/hide modals
function showModal(modalId) {
    const el = document.getElementById(modalId);
    if(el) el.classList.add('active');
}

function hideModal(modalId) {
    const el = document.getElementById(modalId);
    if(el) el.classList.remove('active');
}

// Close modal on overlay click or Escape
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    }
});

// Show alert notification
function showAlert(message, type = 'success') {
    const container = document.querySelector('.flash-messages') || createFlashContainer();
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.appendChild(alert);
    setTimeout(() => { 
        alert.style.opacity = '0'; 
        setTimeout(() => alert.remove(), 300); 
    }, 4000);
}

function createFlashContainer() {
    const div = document.createElement('div');
    div.className = 'flash-messages';
    document.body.appendChild(div);
    return div;
}

// Fetch API wrapper
async function fetchAPI(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (data) options.body = JSON.stringify(data);
    const response = await fetch(url, options);
    
    // Attempt to parse json
    let result;
    try {
        result = await response.json();
    } catch(e) {
        throw new Error('Respuesta inválida del servidor');
    }
    
    if (!response.ok || (result.hasOwnProperty('success') && !result.success)) {
        throw new Error(result.message || result.error || 'Error desconocido');
    }
    return result;
}

// Grade color class
function getNotaClass(nota) {
    if (nota >= 8.5) return 'nota-alta';
    if (nota >= 7) return 'nota-media';
    return 'nota-baja';
}

// Apply grade colors to all .nota-value elements
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nota-value').forEach(el => {
        const val = parseFloat(el.textContent);
        if (!isNaN(val)) el.classList.add(getNotaClass(val));
    });
    
    // Active sidebar link
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        if (link.getAttribute('href') === currentPath) link.classList.add('active');
    });
    
    // Auto-dismiss flash messages
    document.querySelectorAll('.alert').forEach(alert => {
        setTimeout(() => { alert.style.opacity = '0'; setTimeout(() => alert.remove(), 300); }, 5000);
    });
});

// Sidebar toggle for mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if(sidebar) sidebar.classList.toggle('open');
}

// Populate dropdown from API
async function loadDropdown(selectId, url, valueKey = 'id', labelKey = 'nombre') {
    try {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const resp = await fetch(url);
        const data = await resp.json();
        
        const currentVal = select.value;
        select.innerHTML = '<option value="">Seleccionar...</option>';
        data.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item[valueKey];
            opt.textContent = item[labelKey];
            select.appendChild(opt);
        });
        if (currentVal) select.value = currentVal;
    } catch(e) { 
        console.error('Error loading dropdown:', e); 
    }
}

// Generic CRUD handler
async function handleCRUD(url, method, formId, modalId) {
    try {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const result = await fetchAPI(url, method, data);
        showAlert(result.message || 'Operación exitosa', 'success');
        hideModal(modalId);
        setTimeout(() => location.reload(), 800);
    } catch(e) {
        showAlert(e.message || 'Error en la operación', 'error');
    }
}

// Delete handler
async function handleDelete(url) {
    try {
        const result = await fetchAPI(url, 'DELETE');
        showAlert(result.message || 'Eliminado correctamente', 'success');
        setTimeout(() => location.reload(), 800);
    } catch(e) {
        showAlert(e.message || 'Error al eliminar', 'error');
    }
}
