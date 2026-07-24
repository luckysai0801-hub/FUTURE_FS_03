// =============================================
// complaints.js - Resident Complaint Form & Dropzone
// Skyline Residency – Smart Apartment Portal
// =============================================

document.addEventListener('DOMContentLoaded', function () {

    const fileInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const fileLabel = document.getElementById('fileLabel');
    const fileUploadArea = document.getElementById('fileUploadArea');

    if (fileInput && imagePreview) {
        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image file size exceeds 5MB limit.');
                    this.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    if (fileLabel) fileLabel.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        if (fileUploadArea) {
            fileUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadArea.classList.add('drag-over');
            });
            fileUploadArea.addEventListener('dragleave', () => {
                fileUploadArea.classList.remove('drag-over');
            });
            fileUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadArea.classList.remove('drag-over');
                if (e.dataTransfer.files.length) {
                    fileInput.files = e.dataTransfer.files;
                    fileInput.dispatchEvent(new Event('change'));
                }
            });
        }
    }

    function setupCharCounter(fieldId, counterId, max) {
        const field = document.getElementById(fieldId);
        const counter = document.getElementById(counterId);
        if (field && counter) {
            counter.textContent = `${field.value.length}/${max}`;
            field.addEventListener('input', function () {
                counter.textContent = `${this.value.length}/${max}`;
            });
        }
    }
    setupCharCounter('title', 'titleCount', 150);
    setupCharCounter('description', 'descCount', 2000);
});
