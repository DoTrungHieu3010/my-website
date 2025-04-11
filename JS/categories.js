// Khởi tạo mảng danh mục từ localStorage hoặc mảng rỗng nếu chưa có
let categories = JSON.parse(localStorage.getItem('categories')) || [];
const categoryItemsPerPage = 6;
let currentCategoryPage = 1;

// Hiển thị danh sách danh mục
function displayCategories() {
    const categoryTableBody = document.getElementById('categoryTableBody');
    const categoryPagination = document.getElementById('pagination');
    if (!categoryTableBody) return;
    
    categoryTableBody.innerHTML = '';

    // CẮT THEO TRANG
    const startIndex = (currentCategoryPage - 1) * categoryItemsPerPage;
    const endIndex = startIndex + categoryItemsPerPage;
    const paginatedCategories = categories.slice(startIndex, endIndex);

    paginatedCategories.forEach((category, index) => {
        const actualIndex = startIndex + index;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${category.description}</td>
            <td>
                <button class="btn btn-edit" onclick="openEditCategoryModal(${actualIndex})">
                    Edit
                </button>
                <button class="btn btn-delete" onclick="openDeleteCategoryModal(${actualIndex})">
                    Delete
                </button>
            </td>
        `;
        categoryTableBody.appendChild(row);
    });

    // PHÂN TRANG
    if (categoryPagination) {
        const totalPages = Math.ceil(categories.length / categoryItemsPerPage);
        let paginationHTML = '';

        if (totalPages >= 2) {
            paginationHTML += `
            <li class="page-item ${currentCategoryPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changeCategoryPage(${currentCategoryPage - 1})"><</a>
            </li>
        `;

            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `
                <li class="page-item ${currentCategoryPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changeCategoryPage(${i})">${i}</a>
                </li>
            `;
            }

            paginationHTML += `
            <li class="page-item ${currentCategoryPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changeCategoryPage(${currentCategoryPage + 1})">></a>
            </li>
        `;
        
        }

        if (totalPages == 1) {
            changeCategoryPage(`${currentCategoryPage - 1}`)
        }

        categoryPagination.innerHTML = paginationHTML;
    }

    updateCategoryDropdowns();
}

function changeCategoryPage(page) {
    const totalPages = Math.ceil(categories.length / categoryItemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentCategoryPage = page;
        displayCategories();
    }
}


// Cập nhật dropdown danh mục trong các form
function updateCategoryDropdowns() {
    const categoryDropdowns = document.querySelectorAll('.category-dropdown');
    categoryDropdowns.forEach(dropdown => {
        dropdown.innerHTML = '<option value="">Choose category</option>';
        categories.forEach(category => {
            dropdown.innerHTML += `<option value="${category.name}">${category.name}</option>`;
        });
    });
}

// Thêm danh mục mới
function addCategory(name, description) {
    const newCategoryName = document.querySelector('#newCategoryName + .invalid-feedback');
    // const newCategoryDescription = document.querySelector('#newCategoryDescription + .invalid-feedback');
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        if (newCategoryName) {
            newCategoryName.textContent = 'Category name already exists!';
            newCategoryName.classList.remove('hidden');
        }
        return false;
    }
    if (!validateCategoryInput(name, description)) return false;
    let arr = name.split("");
    let direction = 0
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].includes(" ")) {
            direction = i + 1;
        }
        arr[direction] = arr[direction].toUpperCase();
    }
    name = arr.join("");
    categories.push({
        name: name,
        description: description
    });
    saveCategoriesToLocalStorage();
    currentCategoryPage = Math.ceil(categories.length / categoryItemsPerPage);
    displayCategories();
    return true;
}

// Sửa danh mục
function editCategory(index, name, description) {
    // Kiểm tra xem tên mới có trùng với danh mục khác không
    if (categories.some((cat, i) => i !== index && cat.name.toLowerCase() === name.toLowerCase())) {
        const currentCategory = categories[index].name;
        if (!validateCategoryInput(name, description, currentCategory)) return false;
    }
    let arr = name.split("");
    let direction = 0
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].includes(" ")) {
            direction = i + 1;
        }
        arr[direction] = arr[direction].toUpperCase();
    }
    name = arr.join("");
    categories[index] = {
        name: name,
        description: description
    };
    saveCategoriesToLocalStorage();
    displayCategories();
    return true;
}

// Xóa danh mục
function deleteCategory(index) {
    const vocabularyList = JSON.parse(localStorage.getItem('vocabularyList')) || [];
    const categoryName = categories[index].name;

    if (vocabularyList.some(vocab => vocab.category === categoryName)) {
        // Nếu danh mục đang được sử dụng, hiển thị cảnh báo trong modal
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
        document.getElementById('deleteCategoryMessage').textContent = `The category is in use in the vocabulary. Are you sure you want to delete it?`
        document.getElementById('deleteCategoryIndex').value = index;
        deleteModal.show();

        return false;
    } else {
        // Nếu danh mục không được sử dụng, xóa ngay lập tức
        categories.splice(index, 1);
        saveCategoriesToLocalStorage();
        displayCategories();
        return true;
    }
}

// Tìm kiếm danh mục
function searchCategories(searchTerm) {
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categoryTableBody = document.getElementById('categoryTableBody');
    if (!categoryTableBody) return;

    categoryTableBody.innerHTML = '';
    filteredCategories.forEach((category, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${category.description}</td>
            <td>
                <button class="btn btn-edit" onclick="openEditCategoryModal(${categories.indexOf(category)})">
                Edit
                </button>
                <button class="btn btn-delete" onclick="openDeleteCategoryModal(${categories.indexOf(category)})">
                Delete
                </button>
            </td>
        `;
        categoryTableBody.appendChild(row);
    });
}

// Lưu vào localStorage
function saveCategoriesToLocalStorage() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Modal handlers
function openAddCategoryModal() {
    const addModal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
    addModal.show();
}

function openEditCategoryModal(index) {
    const category = categories[index];
    document.getElementById('editCategoryName').value = category.name;
    document.getElementById('editCategoryDescription').value = category.description;
    document.getElementById('editCategoryIndex').value = index;

    const editModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
    editModal.show();
}

function openDeleteCategoryModal(index) {
    document.getElementById('deleteCategoryIndex').value = index;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
    deleteModal.show();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    // Hiển thị danh sách danh mục khi trang load
    displayCategories();

    // Xử lý thêm danh mục
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('newCategoryName').value;
            const description = document.getElementById('newCategoryDescription').value;
            if (addCategory(name, description)) {
                bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
                addCategoryForm.reset();
            }
        });
    }

    // Xử lý sửa danh mục
    const editCategoryForm = document.getElementById('editCategoryForm');
    if (editCategoryForm) {
        editCategoryForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const index = parseInt(document.getElementById('editCategoryIndex').value);
            const name = document.getElementById('editCategoryName').value;
            const description = document.getElementById('editCategoryDescription').value;
            if (editCategory(index, name, description)) {
                bootstrap.Modal.getInstance(document.getElementById('editCategoryModal')).hide();
            }
        });
    }

    // Xử lý xóa danh mục
    const deleteCategoryForm = document.getElementById('deleteCategoryForm');
    if (deleteCategoryForm) {
        deleteCategoryForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const index = parseInt(document.getElementById('deleteCategoryIndex').value);
            if (deleteCategory(index)) {
                bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal')).hide();
            }
        });
    }

    // Xử lý tìm kiếm
    const searchInput = document.getElementById('searchCategory');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            searchCategories(e.target.value);
        });
    }
});

// Validation cho input danh mục
function validateCategoryInput(newName, description) {
    const newCategoryName = document.querySelector('#newCategoryName + .invalid-feedback');
    const newCategoryDescription = document.querySelector('#newCategoryDescription + .invalid-feedback');
    if (!newName.trim()) {
        newCategoryName.textContent = 'Please enter a category name';
        return false;
    }
    if (!description.trim()) {
        newCategoryDescription.textContent = 'Please enter a description';
        return false;
    }
    return true;
}


