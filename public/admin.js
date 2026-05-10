// Load designs when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadDesigns();
    setupFormHandlers();
    setupModalHandlers();
});

// Setup form handlers
function setupFormHandlers() {
    const addForm = document.getElementById('addDesignForm');
    if (addForm) {
        addForm.addEventListener('submit', handleAddDesign);
    }

    const editForm = document.getElementById('editDesignForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditDesign);
    }
}

// Setup modal handlers
function setupModalHandlers() {
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Load and display all designs
async function loadDesigns() {
    try {
        const response = await fetch('/api/designs?limit=100');
        const result = await response.json();
        const designs = result.data || result;
        
        const designsList = document.getElementById('designsList');
        if (!designsList) return;
        
        designsList.innerHTML = '';
        
        if (!designs || designs.length === 0) {
            designsList.innerHTML = '<p>No designs added yet.</p>';
            return;
        }

        designs.forEach(design => {
            const designItem = document.createElement('div');
            designItem.className = 'design-list-item';
            designItem.innerHTML = `
                <img src="${design.image}" alt="${design.name}">
                <h3>${design.name}</h3>
                <p><strong>Category:</strong> ${design.category}</p>
                <p><strong>Color:</strong> ${design.color}</p>
                <p><strong>Material:</strong> ${design.material}</p>
                <p><strong>Season:</strong> ${design.season}</p>
                <p>${design.description}</p>
                <div class="design-actions">
                    <button class="btn-edit" onclick="openEditModal(${design.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteDesign(${design.id})">Delete</button>
                </div>
            `;
            designsList.appendChild(designItem);
        });
    } catch (error) {
        console.error('Error loading designs:', error);
        showMessage('Error loading designs', 'error');
    }
}

// Handle add design form submission
async function handleAddDesign(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const designData = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/api/designs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(designData)
        });

        if (response.ok) {
            showMessage('Design added successfully!', 'success');
            event.target.reset();
            loadDesigns();
            
            // Scroll to designs list
            document.getElementById('designsList').scrollIntoView({ behavior: 'smooth' });
        } else {
            showMessage('Error adding design', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error adding design', 'error');
    }
}

// Open edit modal and populate with design data
async function openEditModal(designId) {
    try {
        // Create a temporary fetch to get all designs and find the one we need
        // In a production app, you'd want a dedicated API endpoint for fetching a single design by ID
        const response = await fetch('/api/designs?limit=100');
        const result = await response.json();
        const designs = result.data || result;
        const design = designs.find(d => d.id === designId);
        
        if (!design) {
            showMessage('Design not found', 'error');
            return;
        }

        // Populate form fields
        document.getElementById('editId').value = design.id;
        document.getElementById('editName').value = design.name;
        document.getElementById('editCategory').value = design.category;
        document.getElementById('editDescription').value = design.description;
        document.getElementById('editImage').value = design.image;
        document.getElementById('editColor').value = design.color;
        document.getElementById('editMaterial').value = design.material;
        document.getElementById('editSeason').value = design.season;

        // Show modal
        document.getElementById('editModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error loading design', 'error');
    }
}

// Handle edit design form submission
async function handleEditDesign(event) {
    event.preventDefault();
    
    const designId = document.getElementById('editId').value;
    const formData = new FormData(event.target);
    const designData = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`/api/designs/${designId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(designData)
        });

        if (response.ok) {
            showMessage('Design updated successfully!', 'success');
            document.getElementById('editModal').style.display = 'none';
            loadDesigns();
        } else {
            showMessage('Error updating design', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error updating design', 'error');
    }
}

// Delete design
async function deleteDesign(designId) {
    if (!confirm('Are you sure you want to delete this design?')) {
        return;
    }

    try {
        const response = await fetch(`/api/designs/${designId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Design deleted successfully!', 'success');
            loadDesigns();
        } else {
            showMessage('Error deleting design', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error deleting design', 'error');
    }
}

// Show message to user
function showMessage(message, type) {
    const messageDiv = document.getElementById('formMessage');
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = type;
    
    setTimeout(() => {
        messageDiv.className = '';
        messageDiv.textContent = '';
    }, 3000);
}
