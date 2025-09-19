document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const taskList = document.getElementById('task-list');

    // DOM Elements BARU untuk Filter
    const filterContainer = document.getElementById('filter-container');
    let currentFilter = 'all'; // Default filter

    // --- Utility Functions ---

    /**
     * @doc: Memformat string tanggal YYYY-MM-DD menjadi format yang lebih mudah dibaca (misalnya, 19 September 2025).
     */
    function formatDate(dateString) {
        if (!dateString) return 'Tidak Ada Tanggal';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // --- Core Functionality ---

    /**
     * @doc: Membuat elemen <li> untuk tugas baru dengan fungsionalitas Selesai, Edit, dan Hapus.
     * @param {string} taskText - Konten teks tugas.
     * @param {string} dueDate - Tanggal tenggat (YYYY-MM-DD).
     * @param {boolean} isCompleted - Status awal tugas (selesai/belum).
     * @returns {HTMLElement} Elemen daftar tugas (<li>).
     */
    function createTaskElement(taskText, dueDate, isCompleted = false) {
        const listItem = document.createElement('li');
        // Tambahkan atribut data untuk filter
        listItem.dataset.completed = isCompleted; 
        listItem.className = 'flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 transition duration-150';

        // Tanggal Styling (Lewat Waktu/Normal)
        let dateClass = 'text-gray-500 text-sm italic';
        const today = new Date().setHours(0, 0, 0, 0);
        const taskDate = dueDate ? new Date(dueDate).setHours(0, 0, 0, 0) : null;

        if (taskDate && taskDate < today && !isCompleted) {
            dateClass = 'text-red-600 font-semibold text-sm italic';
        }

        // Terapkan kelas selesai
        const completedClass = isCompleted ? 'line-through text-gray-500' : 'text-gray-800';
        const dateOpacity = isCompleted ? 'opacity-50' : '';

        // Template HTML untuk item tugas
        listItem.innerHTML = `
            <div class="flex items-center flex-1 min-w-0">
                <input type="checkbox" class="task-checkbox mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" ${isCompleted ? 'checked' : ''}>
                <div class="task-content">
                    <span class="task-text text-lg block ${completedClass}">${taskText}</span>
                    <span class="task-date ${dateClass} ${dateOpacity}" data-original-date="${dueDate}">${formatDate(dueDate)}</span> 
                </div>
            </div>
            <div class="flex space-x-2 ml-4">
                <button class="edit-btn bg-yellow-500 text-white text-sm font-semibold py-1 px-3 rounded-full hover:bg-yellow-600 transition duration-150">
                    Edit
                </button>
                <button class="delete-btn bg-red-500 text-white text-sm font-semibold py-1 px-3 rounded-full hover:bg-red-600 transition duration-150">
                    Hapus
                </button>
            </div>
        `;

        // Ambil elemen anak
        const taskContentDiv = listItem.querySelector('.task-content');
        const taskTextSpan = listItem.querySelector('.task-text');
        const taskDateSpan = listItem.querySelector('.task-date');
        const checkbox = listItem.querySelector('.task-checkbox');
        const editButton = listItem.querySelector('.edit-btn');
        const deleteButton = listItem.querySelector('.delete-btn');

        // Fungsionalitas Checkbox (Menandai Selesai)
        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            listItem.dataset.completed = isChecked; // Perbarui data atribut

            if (isChecked) {
                taskTextSpan.classList.add('line-through', 'text-gray-500');
                taskTextSpan.classList.remove('text-gray-800');
                taskDateSpan.classList.add('opacity-50');
            } else {
                taskTextSpan.classList.remove('line-through', 'text-gray-500');
                taskTextSpan.classList.add('text-gray-800');
                taskDateSpan.classList.remove('opacity-50');
            }
            
            // Terapkan filter setelah status berubah
            filterTasks(currentFilter);
        });

        // Fungsionalitas Hapus
        deleteButton.addEventListener('click', () => {
            listItem.remove();
        });

        // Fungsionalitas Edit
        editButton.addEventListener('click', () => {
            if (editButton.textContent === 'Edit') {
                const currentText = taskTextSpan.textContent;
                const currentDate = taskDateSpan.dataset.originalDate;

                taskContentDiv.innerHTML = `
                    <input type="text" class="edit-text-input w-full p-2 border rounded mb-1 focus:ring-blue-500 focus:border-blue-500" value="${currentText}">
                    <input type="date" class="edit-date-input w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" value="${currentDate}">
                `;
                editButton.textContent = 'Simpan';
                editButton.classList.replace('bg-yellow-500', 'bg-green-500');
                editButton.classList.add('hover:bg-green-600');
                
            } else {
                // Simpan Perubahan: Ganti input dengan span dan simpan nilai baru
                const newText = listItem.querySelector('.edit-text-input').value.trim();
                const newDate = listItem.querySelector('.edit-date-input').value;
                const isChecked = checkbox.checked; 

                if (newText !== "") {
                    // Buat dan ganti elemen tugas dengan nilai baru
                    const updatedTask = createTaskElement(newText, newDate, isChecked);
                    taskList.replaceChild(updatedTask, listItem);
                    
                    // Terapkan filter setelah edit
                    filterTasks(currentFilter); 

                } else {
                    alert('Tugas tidak boleh kosong!');
                }
            }
        });

        return listItem;
    }

    // Fungsi BARU untuk Filter Tugas
    /**
     * @doc: Menyembunyikan atau menampilkan tugas berdasarkan status (all, active, completed).
     * @param {string} filterType - Jenis filter ('all', 'active', 'completed').
     */
    function filterTasks(filterType) {
        currentFilter = filterType;
        const tasks = taskList.querySelectorAll('li');

        tasks.forEach(task => {
            const isCompleted = task.dataset.completed === 'true'; // Ambil status dari data atribut

            switch (filterType) {
                case 'active':
                    task.style.display = isCompleted ? 'none' : 'flex';
                    break;
                case 'completed':
                    task.style.display = isCompleted ? 'flex' : 'none';
                    break;
                case 'all':
                default:
                    task.style.display = 'flex';
                    break;
            }
        });

        updateFilterButtons(filterType);
    }
    
    // Fungsi BARU untuk memperbarui tampilan tombol filter
    function updateFilterButtons(activeFilter) {
        document.querySelectorAll('.filter-btn').forEach(button => {
            if (button.dataset.filter === activeFilter) {
                // Tombol aktif
                button.classList.replace('bg-gray-300', 'bg-blue-500');
                button.classList.replace('text-gray-700', 'text-white');
                button.classList.add('shadow-md');
                button.classList.remove('hover:bg-gray-400');
                button.classList.add('hover:bg-blue-600');
            } else {
                // Tombol non-aktif
                button.classList.replace('bg-blue-500', 'bg-gray-300');
                button.classList.replace('text-white', 'text-gray-700');
                button.classList.remove('shadow-md');
                button.classList.add('hover:bg-gray-400');
                button.classList.remove('hover:bg-blue-600');
            }
        });
    }


    // --- Event Listeners ---

    // Event listener untuk pengiriman formulir (Menambah Tugas)
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const task = taskInput.value.trim();
        const dueDate = dateInput.value;

        if (task !== "") {
            // Tugas baru selalu belum selesai
            const newTask = createTaskElement(task, dueDate, false); 
            taskList.appendChild(newTask);
            
            // Terapkan filter saat tugas baru ditambahkan
            filterTasks(currentFilter); 

            // Reset input form
            taskInput.value = ""; 
            dateInput.value = ""; 
        }
    });

    // Event listener BARU untuk tombol filter
    filterContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('filter-btn')) {
            const filterType = target.dataset.filter;
            filterTasks(filterType);
        }
    });

    // Inisialisasi tampilan tombol filter saat DOM dimuat
    updateFilterButtons(currentFilter);
});