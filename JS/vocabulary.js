let vocabularyList = JSON.parse(localStorage.getItem('vocabularyList')) || [];
let currentPage = 1;
let itemsPerPage = 5;
let currentFilter = '';

function updateCategoryFilter() {
    let categoryList = document.getElementById('categoryList');
    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    let categoryDropdown = document.getElementById('categoryDropdown');
    let usedCategories = [...new Set(vocabularyList.map(vocab => vocab.category))];

    categoryList.innerHTML = `<li><a class="dropdown-item ${!currentFilter ? 'active' : ''}" href="#" data-category="">All Categories</a></li>`;
    
    usedCategories.forEach(category => {
        if (category) {
            categoryList.innerHTML += `
                <li><a class="dropdown-item ${currentFilter === category ? 'active' : ''}" 
                       href="#" 
                       data-category="${category}">${category}</a></li>
            `;
        }
    });

    let dropdownItems = categoryList.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            let selectedCategory = e.target.dataset.category;
            currentFilter = selectedCategory;
            
            categoryDropdown.textContent = selectedCategory || 'All Categories';
            
            dropdownItems.forEach(item => item.classList.remove('active'));
            e.target.classList.add('active');
            
            currentPage = 1;
            displayVocabularyList();
        });
    });
}

function filterVocabularyList() {
    let searchTerm = document.getElementById('searchVocab')?.value.toLowerCase() || '';
    let filteredList = vocabularyList;
    if (currentFilter) {
        filteredList = filteredList.filter(vocab => vocab.category === currentFilter);
    }
    if (searchTerm) {
        filteredList = filteredList.filter(vocab =>
            vocab.word.toLowerCase().includes(searchTerm) ||
            vocab.meaning.toLowerCase().includes(searchTerm)
        );
    }

    return filteredList;
}

function displayVocabularyList() {
    let vocabularyTableBody = document.getElementById('vocabularyTableBody');
    let paginationContainer = document.getElementById('pagination');
    if (!vocabularyTableBody) return;

    vocabularyTableBody.innerHTML = '';
    let filteredList = filterVocabularyList();
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let paginatedList = filteredList.slice(startIndex, endIndex);
    
    if (paginatedList.length === 0) {
        vocabularyTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Không có từ vựng nào</td>
            </tr>
        `;
    } else {
        paginatedList.forEach((vocab, index) => {
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>${vocab.word}</td>
                <td>${vocab.meaning}</td>
                <td>${vocab.category}</td>
                <td class="btn-action">
                    <button class="btn btn-edit" onclick="openEditModal(${vocabularyList.indexOf(vocab)})">
                        Edit
                    </button>
                    <button class="btn btn-delete" onclick="openDeleteModal(${vocabularyList.indexOf(vocab)})">
                        Delete
                    </button>
                </td>
            `;
            vocabularyTableBody.appendChild(row);
        });
    }
    if (paginationContainer) {
        let totalPages = Math.ceil(filteredList.length / itemsPerPage);
        let paginationHTML = '';
        
        if (totalPages == 2){
            paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1})"><</a>
            </li>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        }
        
        paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">></a>
            </li>
        `;
        }
        
        paginationContainer.innerHTML = paginationHTML;
    }
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(vocabularyList.length / itemsPerPage)) return;
    currentPage = page;
    displayVocabularyList();
}

function addVocabulary(word, meaning, category) {
    if (!validateVocabularyInput(word, meaning, category)) return false;
    vocabularyList.push({
        word: word,
        meaning: meaning,
        category: category
    });
    saveToLocalStorage();
    let filteredList = filterVocabularyList();
    currentPage = Math.ceil(filteredList.length / itemsPerPage);
    displayVocabularyList();
    return true;
}
function editVocabulary(index, word, meaning, category) {
    let currentWord = vocabularyList[index].word;
    if (!validateVocabularyInput(word, meaning, category, currentWord)) return false;
    
    vocabularyList[index] = {
        word: word,
        meaning: meaning,
        category: category
    };
    saveToLocalStorage();
    displayVocabularyList();
    return true;
}
function validateVocabularyInput(word, meaning, category, currentWord = '') {
    if (!word.trim()) {
        
        return false;
    }
    if (!meaning.trim()) {
        
        return false;
    }
    if (!category) {
        
        return false;
    }
    let existingWord = vocabularyList.find(
        v => v.word.toLowerCase() === word.toLowerCase()
    );
    if (existingWord && word.toLowerCase() !== currentWord.toLowerCase()) {
        
        return false;
    }
    
    return true;
}
function deleteVocabulary(index) {
    vocabularyList.splice(index, 1);
    saveToLocalStorage();
    
    let filteredList = filterVocabularyList();
    let totalPages = Math.ceil(filteredList.length / itemsPerPage);
    
    // Nếu sau khi xóa, currentPage vượt quá tổng số trang mới, thì giảm currentPage
    if (currentPage > totalPages) {
        currentPage = totalPages || 1; // Nếu không còn trang nào, quay về 1
    }
    displayVocabularyList();
}

function searchVocabulary(searchTerm) {
    let filteredList = vocabularyList.filter(vocab => 
        vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vocab.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let vocabularyTableBody = document.getElementById('vocabularyTableBody');
    if (!vocabularyTableBody) return;

    vocabularyTableBody.innerHTML = '';
    filteredList.forEach((vocab, index) => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${vocab.word}</td>
            <td>${vocab.meaning}</td>
            <td>${vocab.category}</td>
            <td>
                <button class="btn btn-edit" onclick="openEditModal(${vocabularyList.indexOf(vocab)})">
                    Edit
                </button>
                <button class="btn btn-delete" onclick="openDeleteModal(${vocabularyList.indexOf(vocab)})">
                    Delete
                </button>
            </td>
        `;
        vocabularyTableBody.appendChild(row);
    });
}

function saveToLocalStorage() {
    localStorage.setItem('vocabularyList', JSON.stringify(vocabularyList));
}

function updateCategoryDropdowns() {
    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    let dropdowns = document.querySelectorAll('.category-dropdown');
    
    dropdowns.forEach(dropdown => {
        let firstOption = dropdown.options[0];
        dropdown.innerHTML = '';
        dropdown.appendChild(firstOption);
        categories.forEach(category => {
            let option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            dropdown.appendChild(option);
        });
    });
}

function openAddModal() {
    updateCategoryDropdowns(); // Cập nhật danh mục trước khi mở modal
    let addModal = new bootstrap.Modal(document.getElementById('addVocabModal'));
    document.getElementById('newWord').value = '';
    document.getElementById('newMeaning').value = '';
    document.getElementById('newCategory').value = '';
    addModal.show();
}

function openEditModal(index) {
    updateCategoryDropdowns(); // Cập nhật danh mục trước khi mở modal
    let vocab = vocabularyList[index];
    document.getElementById('editIndex').value = index;
    document.getElementById('editWord').value = vocab.word;
    document.getElementById('editMeaning').value = vocab.meaning;
    document.getElementById('editCategory').value = vocab.category;
    
    let editModal = new bootstrap.Modal(document.getElementById('editVocabModal'));
    editModal.show();
}

function openDeleteModal(index) {
    document.getElementById('deleteIndex').value = index;
    let deleteModal = new bootstrap.Modal(document.getElementById('deleteVocabModal'));
    deleteModal.show();
}

document.addEventListener('DOMContentLoaded', function() {
    displayVocabularyList();
    updateCategoryFilter();
    updateCategoryDropdowns();
    let addForm = document.getElementById('addVocabForm');
    if (addForm) {
        addForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let word = document.getElementById('newWord').value;
            let meaning = document.getElementById('newMeaning').value;
            let category = document.getElementById('newCategory').value;
            
            if (addVocabulary(word, meaning, category)) {
                let addModal = bootstrap.Modal.getInstance(document.getElementById('addVocabModal'));
                addModal.hide();
                addForm.reset();
                updateCategoryFilter();
            }
        });
    }

    let editForm = document.getElementById('editVocabForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let index = document.getElementById('editIndex').value;
            let word = document.getElementById('editWord').value;
            let meaning = document.getElementById('editMeaning').value;
            let category = document.getElementById('editCategory').value;
            
            if (editVocabulary(parseInt(index), word, meaning, category)) {
                let editModal = bootstrap.Modal.getInstance(document.getElementById('editVocabModal'));
                editModal.hide();
                updateCategoryFilter();
            }
        });
    }

    let deleteForm = document.getElementById('deleteVocabForm');
    if (deleteForm) {
        deleteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let index = document.getElementById('deleteIndex').value;
            deleteVocabulary(parseInt(index));
            let deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteVocabModal'));
            deleteModal.hide();
            updateCategoryFilter();
        });
    }

    let searchInput = document.getElementById('searchVocab');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentPage = 1;
            displayVocabularyList();
        });
    }
});


