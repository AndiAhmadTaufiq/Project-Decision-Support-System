// Data Global
const criteria = [];
const students = [];
const values = {};
let ahpWeights = [];
let pairwiseMatrix = [];

// Navigasi Antar Bagian
document.getElementById('go-to-criteria').addEventListener('click', () => switchSection('criteria-section'));
document.getElementById('go-to-students').addEventListener('click', () => switchSection('student-section'));
document.getElementById('go-to-values').addEventListener('click', () => {
    displayInputValues();
    switchSection('input-values-section');
});
document.getElementById('go-to-results').addEventListener('click', () => switchSection('results-section'));

// Fungsi Navigasi
function switchSection(sectionId) {
    document.querySelectorAll('section').forEach(section => section.classList.remove('active-section'));
    document.getElementById(sectionId).classList.add('active-section');
}

// Tambah Kriteria
document.getElementById('add-criteria').addEventListener('click', () => {
    const container = document.getElementById('criteria-container');
    const div = document.createElement('div');
    div.classList.add('criteria-input');
    div.innerHTML = `
        <div>
            <label>Nama Kriteria:</label>
            <input type="text" placeholder="Nama Kriteria" required>
        </div>
        <div>
            <label>Tipe:</label>
            <select>
                <option value="benefit">Benefit</option>
                <option value="cost">Cost</option>
            </select>
        </div>
        <button type="button" class="delete-criteria">Hapus</button>
    `;
    container.appendChild(div);
});

// Hapus Kriteria
document.getElementById('criteria-container').addEventListener('click', event => {
    if (event.target.classList.contains('delete-criteria')) {
        event.target.parentElement.remove();
    }
});

// Simpan Kriteria
document.getElementById('save-criteria').addEventListener('click', () => {
    const inputs = document.querySelectorAll('.criteria-input');
    criteria.length = 0;
    inputs.forEach(input => {
        const name = input.querySelector('input[type="text"]').value.trim();
        const type = input.querySelector('select').value;
        if (name) {
            criteria.push({ name, type });
        }
    });

    if (criteria.length < 2) {
        alert('Tambahkan minimal dua kriteria.');
        return;
    }

    buildPairwiseMatrix();
    alert('Kriteria berhasil disimpan.');
    console.log(criteria);
});

// Bangun Matriks Perbandingan Berpasangan
function buildPairwiseMatrix() {
    const container = document.getElementById('pairwise-container');
    container.innerHTML = ''; // Kosongkan kontainer

    pairwiseMatrix = Array(criteria.length)
        .fill(null)
        .map(() => Array(criteria.length).fill(1)); // Inisialisasi matriks dengan 1

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Kriteria</th>
                ${criteria.map(c => `<th>${c.name}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${criteria
                .map((c, i) => `
                    <tr>
                        <td>${c.name}</td>
                        ${criteria
                            .map((_, j) =>
                                i === j
                                    ? '<td>1</td>' // Diagonal utama selalu 1
                                    : `<td>
                                        <select data-row="${i}" data-col="${j}">
                                            ${generatePairwiseOptions()}
                                        </select>
                                    </td>`
                            )
                            .join('')}
                    </tr>
                `)
                .join('')}
        </tbody>
    `;
    container.appendChild(table);

    // Tambahkan event listener untuk memperbarui matriks
    table.addEventListener('change', updatePairwiseMatrix);
}

// Fungsi Membuat Opsi untuk <select> pada Matriks
function generatePairwiseOptions() {
    const options = [];

    // Tambahkan nilai dari 1/9 hingga 9
    for (let i = 1; i <= 9; i++) {
        options.push(`<option value="${i}">${i}</option>`);
        if (i > 1) options.push(`<option value="${(1 / i).toFixed(6)}">1/${i}</option>`);
    }

    return options.join('');
}


// Perbarui Matriks Perbandingan Secara Otomatis
function updatePairwiseMatrix(event) {
    const { row, col } = event.target.dataset; // Ambil data baris dan kolom
    const value = parseFloat(event.target.value);

    if (!isNaN(value) && value > 0) {
        // Update nilai di matriks
        pairwiseMatrix[row][col] = value;

        // Update nilai sisi simetris matriks dengan 1 / value
        const reciprocalValue = 1 / value;
        pairwiseMatrix[col][row] = reciprocalValue;

        // Cari elemen input sisi simetris dan perbarui nilainya
        const oppositeInput = document.querySelector(
            `select[data-row="${col}"][data-col="${row}"]`
        );

        if (oppositeInput) {
            oppositeInput.value = reciprocalValue.toFixed(6); // Format angka agar terlihat rapi
        }
    }
}



// Tambah Siswa
document.getElementById('add-student').addEventListener('click', () => {
    const container = document.getElementById('student-container');
    const div = document.createElement('div');
    div.classList.add('student-input');
    
    // Tentukan nomor urut
    const studentNumber = students.length + 1;  // Nomor urut berdasarkan jumlah siswa yang sudah ada
    
    div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <label>${studentNumber}</label>  <!-- Ganti teks menjadi nomor urut -->
            <input type="text" placeholder="Nama Siswa" required>
            <button type="button" class="delete-student" style="margin: 5px; padding: 10px 20px; background-color: #34495e; color: white; border: none; transition: background-color 0.3s; border-radius: 5px; cursor: pointer;">Hapus</button>
        </div>
    `;
    
    container.appendChild(div);
    students.push(""); // Tambahkan entri siswa kosong untuk menambah jumlah siswa
});


// Hapus Siswa (dengan event delegation)
document.getElementById('student-container').addEventListener('click', event => {
    if (event.target.classList.contains('delete-student')) {
        const studentDiv = event.target.closest('.student-input'); // Cari elemen induk dari tombol hapus
        studentDiv.remove(); // Hapus elemen induk (div) yang berisi input siswa dan tombol hapus

        const studentName = studentDiv.querySelector('input').value.trim(); // Ambil nama siswa dari input
        const studentIndex = students.indexOf(studentName); // Cari index siswa dalam array
        if (studentIndex !== -1) {
            students.splice(studentIndex, 1); // Hapus siswa dari array
            delete values[studentName]; // Hapus nilai siswa dari objek values
        }

        // Perbarui nomor urut siswa yang tersisa
        updateStudentInput();
    }
});


// Simpan Siswa
document.getElementById('save-students').addEventListener('click', () => {
    const inputs = document.querySelectorAll('.student-input input');
    students.length = 0;
    inputs.forEach(input => {
        const name = input.value.trim();
        if (name) {
            students.push(name);
            values[name] = {};
        }
    });

    if (students.length === 0) {
        alert('Tambahkan minimal satu siswa.');
        return;
    }

    alert('Siswa berhasil disimpan.');
    console.log(students);
});

// Fungsi untuk menampilkan input nilai berdasarkan siswa dan kriteria
function displayInputValues() {
    const container = document.getElementById('values-container');
    
    // Jika tabel sudah ada, tambahkan baris baru tanpa menghapus tabel sebelumnya
    const existingTable = document.querySelector('#values-table');
    if (existingTable) {
        const tbody = existingTable.querySelector('tbody');

        // Tambahkan hanya siswa baru ke tabel nilai
        const newStudents = students.filter(student => 
            !Array.from(tbody.querySelectorAll('tr')).some(row => row.querySelector('td').textContent === student)
        );

        newStudents.forEach(student => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${student}</td>
                ${criteria
                    .map(c => `
                        <td>
                            <input type="number" step="0.01" min="0" placeholder="Nilai" 
                            data-student="${student}" data-criteria="${c.name}" 
                            value="${values[student]?.[c.name] || ''}">
                        </td>
                    `)
                    .join('')}
                <td><button class="delete-row">Hapus</button></td>
            `;
            tbody.appendChild(newRow);
        });

        return; // Jangan buat ulang tabel jika sudah ada
    }

    // Buat tabel baru jika belum ada
    const table = document.createElement('table');
    table.id = 'values-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nama Siswa</th>
                ${criteria.map(c => `<th>${c.name}</th>`).join('')}
                <th>Hapus</th>
            </tr>
        </thead>
        <tbody>
            ${students
                .map(student => `
                    <tr>
                        <td>${student}</td>
                        ${criteria
                            .map(c => `
                                <td>
                                    <input type="number" step="0.01" min="0" placeholder="Nilai" 
                                    data-student="${student}" data-criteria="${c.name}" 
                                    value="${values[student]?.[c.name] || ''}">
                                </td>
                            `)
                            .join('')}
                        <td><button class="delete-row">Hapus</button></td>
                    </tr>
                `)
                .join('')}
        </tbody>
    `;
    container.appendChild(table);
}

// Tambahkan logika untuk menyimpan nilai siswa
document.getElementById('save-values').addEventListener('click', () => {
    const inputs = document.querySelectorAll('#values-container input');
    inputs.forEach(input => {
        const student = input.dataset.student;
        const criteriaName = input.dataset.criteria;
        const value = parseFloat(input.value);

        if (!values[student]) values[student] = {};
        if (!isNaN(value)) values[student][criteriaName] = value; // Simpan nilai jika valid
    });

    alert('Nilai berhasil disimpan.');
    console.log(values);
});

// Tambahkan logika untuk menghapus baris siswa pada input nilai
document.getElementById('values-container').addEventListener('click', function (e) {
    if (e.target.classList.contains('delete-row')) {
        const row = e.target.closest('tr');
        const studentName = row.querySelector('td').textContent;

        // Hapus baris tabel
        row.remove();

        // Hapus siswa dari objek nilai
        delete values[studentName];
        students.splice(students.indexOf(studentName), 1);

        alert(`Data untuk siswa "${studentName}" telah dihapus.`);
        console.log(values);
    }
});

// Logika untuk menambahkan siswa baru tanpa menghapus nilai lama
document.getElementById('save-students').addEventListener('click', () => {
    const inputs = document.querySelectorAll('.student-input input');
    const newStudents = [];
    inputs.forEach(input => {
        const name = input.value.trim();
        if (name && !students.includes(name)) {
            students.push(name);
            values[name] = {}; // Inisialisasi nilai siswa baru
            newStudents.push(name);
        }
    });

    // if (newStudents.length === 0) {
    //     alert('Tidak ada siswa baru yang ditambahkan.');
    //     return;
    // }

    // alert(`Siswa berikut berhasil ditambahkan: ${newStudents.join(', ')}`);
    console.log(students);
    console.log(values);
});


// Tombol Reset
document.getElementById('reset-values').addEventListener('click', () => {
    const inputs = document.querySelectorAll('#values-container input');
    inputs.forEach(input => (input.value = '')); // Kosongkan semua input
    alert('Nilai telah di-reset.');
});


// Hitung AHP
document.getElementById('calculate-ahp').addEventListener('click', () => {
    if (pairwiseMatrix.length === 0 || pairwiseMatrix.length !== criteria.length) {
        alert('Matriks perbandingan berpasangan belum lengkap.');
        return;
    }

    const { weights, CR, consistent } = calculateAHP(pairwiseMatrix);

    if (!consistent) {
        alert(`Consistency Ratio terlalu tinggi (CR = ${CR.toFixed(3)}). Perbaiki perbandingan.`);
        return;
    }

    ahpWeights = weights.map((w, i) => ({
        criteria: criteria[i].name,
        weight: w,
    }));

    alert('Bobot berhasil dihitung dan konsisten.');
    console.log('Bobot Prioritas:', ahpWeights);
});

// Fungsi Perhitungan AHP
function calculateAHP(matrix) {
    const n = matrix.length;

    // Hitung jumlah kolom
    const colSums = Array(n).fill(0);
    matrix.forEach(row => row.forEach((value, colIndex) => (colSums[colIndex] += value)));

    // Normalisasi matriks
    const normalizedMatrix = matrix.map(row =>
        row.map((value, colIndex) => value / colSums[colIndex])
    );

    // Hitung bobot prioritas (eigenvector)
    const weights = normalizedMatrix.map(row =>
        row.reduce((sum, value) => sum + value, 0) / n
    );

    // Hitung Consistency Ratio (CR)
    const lambdaMax = matrix
        .map((row, i) =>
            row.reduce((sum, value, j) => sum + value * weights[j], 0) / weights[i]
        )
        .reduce((sum, value) => sum + value, 0) / n;

    const CI = (lambdaMax - n) / (n - 1);
    const RI = [0.00, 0.00, 0.58, 0.90, 1.12, 1.24][n - 1] || 1.32;
    const CR = CI / RI;

    return { weights, CR, consistent: CR < 0.1 };
}

// Proses SAW
document.getElementById('process-data').addEventListener('click', () => {
    if (ahpWeights.length !== criteria.length) {
        alert('Hitung bobot dengan AHP terlebih dahulu.');
        return;
    }

    const results = students.map(student => {
        const scores = criteria.map((c, index) => {
            const value = values[student][c.name];
            const max = Math.max(...students.map(s => values[s]?.[c.name] || 0));
            const min = Math.min(...students.map(s => values[s]?.[c.name] || Infinity));

            const normalizedValue =
                c.type === 'benefit' ? value / max : min / value;

            return normalizedValue * ahpWeights[index].weight;
        });

        return { name: student, score: scores.reduce((a, b) => a + b, 0) };
    });

    results.sort((a, b) => b.score - a.score);

    const tableBody = document.querySelector('#results-table tbody');
    tableBody.innerHTML = results
        .map(
            (result, index) => `
            <tr>
                <td>${result.name}</td>
                <td>${result.score.toFixed(3)}</td>
                <td>${index + 1}</td>
            </tr>
        `
        )
        .join('');

    alert('Perankingan selesai.');
});

// Fungsi untuk mendownload tabel hasil dalam format Excel
document.getElementById('download-excel').addEventListener('click', () => {
    if (!students.length || !criteria.length) {
        alert('Tidak ada data siswa atau kriteria untuk didownload!');
        return;
    }

    // Siapkan array data untuk Excel
    const excelData = [];

    // Header Row: Nama Siswa, Kriteria (dari criteria array), SAW Score, Ranking
    const headers = ['Nama Siswa', ...criteria.map(c => c.name), 'SAW Score', 'Ranking'];
    excelData.push(headers);

    // Isi Data
    const tableBody = document.querySelectorAll('#results-table tbody tr');
    tableBody.forEach(row => {
        const cells = row.querySelectorAll('td');
        const studentName = cells[0].innerText; // Nama Siswa
        const sawScore = cells[1].innerText; // SAW Score
        const rank = cells[2].innerText; // Ranking

        // Ambil nilai dari objek `values` untuk siswa ini
        const studentValues = criteria.map(c => values[studentName]?.[c.name] || '-');

        // Gabungkan data menjadi satu baris
        excelData.push([studentName, ...studentValues, sawScore, rank]);
    });

    // Konversi ke format Excel
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hasil Perankingan');

    // Simpan sebagai file Excel
    XLSX.writeFile(wb, 'Hasil_Perankingan_Siswa.xlsx');
});

document.getElementById('upload-excel-button').addEventListener('click', () => {
    const fileInput = document.getElementById('upload-excel');
    const file = fileInput.files[0];

    if (!file) {
        alert('Pilih file Excel terlebih dahulu!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Proses data ke dalam struktur `students` dan `values`
        jsonData.forEach(row => {
            const studentName = row['Nama Siswa'];
            if (!students.includes(studentName)) {
                students.push(studentName);
            }

            values[studentName] = {
                'Nilai Harian Pengetahuan': parseFloat(row['Nilai Harian Pengetahuan']) || 0,
                'Nilai Harian Keterampilan': parseFloat(row['Nilai Harian Keterampilan']) || 0,
                'Nilai Ujian Tengah Semester': parseFloat(row['Nilai Ujian Tengah Semester']) || 0,
                'Nilai Ujian Akhir Semester': parseFloat(row['Nilai Ujian Akhir Semester']) || 0,
                'Nilai Kehadiran': parseFloat(row['Nilai Kehadiran']) || 0
            };
        });

        alert('Data dari Excel berhasil diunggah.');
        console.log('Siswa:', students);
        console.log('Nilai:', values);

        // Perbarui tampilan di input nama siswa dan nilai manual
        updateStudentInput();
        updateManualInputTable();
    };
    reader.readAsArrayBuffer(file);
});

// Update nomor urut jika siswa dihapus
document.getElementById('student-container').addEventListener('click', event => {
    if (event.target.classList.contains('delete-student')) {
        event.target.parentElement.remove(); // Hapus siswa
        
        // Perbarui nomor urut siswa yang tersisa
        updateStudentInput();
    }
});

// Fungsi untuk memperbarui input siswa
function updateStudentInput() {
    const container = document.getElementById('student-container');
    container.innerHTML = ''; // Kosongkan kontainer

    students.forEach((student, index) => {
        const div = document.createElement('div');
        div.classList.add('student-input');
        
        // Tentukan nomor urut berdasarkan index
        const studentNumber = index + 1;  // Nomor urut berdasarkan posisi dalam array students
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <label>${studentNumber}</label> <!-- Ganti teks menjadi nomor urut -->
                <input type="text" value="${student}" readonly style="padding: 5px; font-size: 14px;">
                <button type="button" class="delete-student" style="margin: 5px; padding: 10px 20px; background-color: #34495e; color: white; border: none;transition: background-color 0.3s; border-radius: 5px; cursor: pointer;">Hapus</button>
            </div>
        `;
        container.appendChild(div);
    });
}


function updateManualInputTable() {
    const table = document.getElementById('values-table');
    if (!table) {
        // Jika tabel belum ada, buat tabel baru
        displayInputValues();
        return;
    }

    // Perbarui tabel yang ada
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // Kosongkan isi tabel

    // Isi ulang tabel dengan data dari `values`
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student}</td>
            ${Object.keys(values[student])
                .map(criteria => `
                    <td>
                        <input type="number" step="0.01" min="0" placeholder="Nilai" 
                        data-student="${student}" data-criteria="${criteria}" 
                        value="${values[student][criteria] || ''}">
                    </td>
                `)
                .join('')}
            <td><button class="delete-row">Hapus</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Fungsi Download PDF
document.getElementById('download-pdf').addEventListener('click', () => {
    // Cek apakah tabel hasil ada
    const table = document.getElementById('results-table');
    if (!table) {
        alert('Tabel hasil tidak ditemukan!');
        return;
    }

    // Ambil referensi ke jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Tambahkan judul dokumen
    pdf.setFontSize(18);
    pdf.text('Hasil Perankingan SAW', 14, 20);

    // Ambil data dari tabel HTML
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText);
    const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
        return Array.from(tr.querySelectorAll('td')).map(td => td.innerText);
    });

    // Cek apakah ada data di tabel
    if (rows.length === 0) {
        alert('Tidak ada data yang bisa diunduh!');
        return;
    }

    // Tambahkan tabel ke PDF
    pdf.autoTable({
        head: [headers],  // Headers dari tabel
        body: rows,  // Baris data
        startY: 30,  // Posisi di bawah judul
        theme: 'grid',  // Tema grid
        headStyles: { fillColor: [22, 160, 133] },  // Warna header
        margin: { left: 14, right: 14 },
    });

    // Simpan file PDF
    pdf.save('Hasil_Perankingan.pdf');
});


