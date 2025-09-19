document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const taskList = document.getElementById('task-list');

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
            if (checkbox.checked) {
                taskTextSpan.classList.add('line-through', 'text-gray-500');
                taskTextSpan.classList.remove('text-gray-800');
                taskDateSpan.classList.add('opacity-50');
            } else {
                taskTextSpan.classList.remove('line-through', 'text-gray-500');
                taskTextSpan.classList.add('text-gray-800');
                taskDateSpan.classList.remove('opacity-50');
            }
        });

        // Fungsionalitas Hapus
        deleteButton.addEventListener('click', () => {
            listItem.remove();
        });

        // Fungsionalitas Edit
        editButton.addEventListener('click', () => {
            if (editButton.textContent === 'Edit') {
                // Masuk Mode Edit: Ganti span dengan input
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
                const isChecked = checkbox.checked; // Pertahankan status selesai

                if (newText !== "") {
                    // Buat dan ganti elemen tugas dengan nilai baru
                    const updatedTask = createTaskElement(newText, newDate, isChecked);
                    taskList.replaceChild(updatedTask, listItem);

                } else {
                    alert('Tugas tidak boleh kosong!');
                }
            }
        });

        return listItem;
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
            
            // Reset input form
            taskInput.value = ""; 
            dateInput.value = ""; 
        }
    });

});