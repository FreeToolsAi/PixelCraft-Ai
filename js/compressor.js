// Image Compressor Tool JavaScript
class ImageCompressor {
    constructor() {
        this.files = [];
        this.compressedFiles = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // File input change
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files);
            });
        }

        // Settings listeners
        const qualitySlider = document.getElementById('qualitySlider');
        if (qualitySlider) {
            qualitySlider.addEventListener('input', (e) => {
                document.getElementById('qualityValue').textContent = e.target.value;
            });
        }

        const resizeCheck = document.getElementById('resizeCheck');
        if (resizeCheck) {
            resizeCheck.addEventListener('change', (e) => {
                const resizeOptions = document.getElementById('resizeOptions');
                resizeOptions.style.display = e.target.checked ? 'flex' : 'none';
            });
        }

        const keepAspectRatio = document.getElementById('keepAspectRatio');
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');

        if (keepAspectRatio && widthInput && heightInput) {
            widthInput.addEventListener('input', () => {
                if (keepAspectRatio.checked) {
                    const aspectRatio = 1920 / 1080; // Default aspect ratio
                    heightInput.value = Math.round(widthInput.value / aspectRatio);
                }
            });

            heightInput.addEventListener('input', () => {
                if (keepAspectRatio.checked) {
                    const aspectRatio = 1920 / 1080;
                    widthInput.value = Math.round(heightInput.value * aspectRatio);
                }
            });
        }

        // Compress button
        const compressBtn = document.getElementById('compressBtn');
        if (compressBtn) {
            compressBtn.addEventListener('click', () => {
                this.compressImages();
            });
        }

        // Download all button
        const downloadAllBtn = document.getElementById('downloadAllBtn');
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', () => {
                this.downloadAll();
            });
        }
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('dragover');
            }, false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFileSelect(files);
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFileSelect(fileList) {
        const validFiles = Array.from(fileList).filter(file => {
            if (!file.type.startsWith('image/')) {
                this.showToast(`${file.name} is not a valid image file`, 'warning');
                return false;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showToast(`${file.name} is too large (max 10MB)`, 'warning');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        this.files = [...this.files, ...validFiles];
        this.displaySelectedFiles();
        this.showSettings();
    }

    displaySelectedFiles() {
        // Create file list if it doesn't exist
        let fileList = document.getElementById('fileList');
        if (!fileList) {
            fileList = document.createElement('div');
            fileList.id = 'fileList';
            fileList.className = 'file-list';
            
            const uploadArea = document.getElementById('uploadArea');
            uploadArea.parentNode.insertBefore(fileList, uploadArea.nextSibling);
        }

        fileList.innerHTML = '';

        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const preview = document.createElement('img');
            preview.className = 'file-preview';
            preview.src = URL.createObjectURL(file);
            preview.onload = () => URL.revokeObjectURL(preview.src);

            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';
            fileInfo.innerHTML = `
                <div class="file-name">${file.name}</div>
                <div class="file-size">${this.formatFileSize(file.size)}</div>
            `;

            const fileActions = document.createElement('div');
            fileActions.className = 'file-actions';
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn-icon remove';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.onclick = () => this.removeFile(index);
            
            fileActions.appendChild(removeBtn);
            
            fileItem.appendChild(preview);
            fileItem.appendChild(fileInfo);
            fileItem.appendChild(fileActions);
            
            fileList.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.displaySelectedFiles();
        
        if (this.files.length === 0) {
            this.hideSettings();
        }
    }

    showSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        const compressBtn = document.getElementById('compressBtn');
        
        if (settingsPanel) {
            settingsPanel.style.display = 'block';
        }
        if (compressBtn) {
            compressBtn.disabled = false;
        }
    }

    hideSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        const compressBtn = document.getElementById('compressBtn');
        
        if (settingsPanel) {
            settingsPanel.style.display = 'none';
        }
        if (compressBtn) {
            compressBtn.disabled = true;
        }
    }

    async compressImages() {
        if (this.files.length === 0) return;

        this.showProcessing();
        this.compressedFiles = [];

        const settings = this.getCompressionSettings();
        
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            const progress = ((i + 1) / this.files.length) * 100;
            
            this.updateProgress(progress, `Processing ${file.name}...`);
            
            try {
                const compressedFile = await this.compressImage(file, settings);
                this.compressedFiles.push({
                    original: file,
                    compressed: compressedFile,
                    savings: ((file.size - compressedFile.size) / file.size) * 100
                });
            } catch (error) {
                console.error('Error compressing', file.name, error);
                this.showToast(`Error compressing ${file.name}`, 'error');
            }
        }

        this.showResults();
    }

    getCompressionSettings() {
        return {
            quality: parseInt(document.getElementById('qualitySlider').value) / 100,
            format: document.getElementById('formatSelect').value,
            resize: document.getElementById('resizeCheck').checked,
            width: parseInt(document.getElementById('widthInput').value) || null,
            height: parseInt(document.getElementById('heightInput').value) || null,
            keepAspectRatio: document.getElementById('keepAspectRatio').checked
        };
    }

    async compressImage(file, settings) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                try {
                    let { width, height } = img;

                    // Apply resizing if enabled
                    if (settings.resize && settings.width && settings.height) {
                        if (settings.keepAspectRatio) {
                            const aspectRatio = width / height;
                            const targetAspectRatio = settings.width / settings.height;
                            
                            if (aspectRatio > targetAspectRatio) {
                                width = settings.width;
                                height = settings.width / aspectRatio;
                            } else {
                                height = settings.height;
                                width = settings.height * aspectRatio;
                            }
                        } else {
                            width = settings.width;
                            height = settings.height;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw and compress
                    ctx.drawImage(img, 0, 0, width, height);

                    // Determine output format
                    let outputFormat = 'image/jpeg';
                    if (settings.format === 'png') outputFormat = 'image/png';
                    else if (settings.format === 'webp') outputFormat = 'image/webp';
                    else if (settings.format === 'auto') {
                        outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                    }

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: outputFormat,
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    }, outputFormat, settings.quality);

                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    showProcessing() {
        document.getElementById('settingsPanel').style.display = 'none';
        document.getElementById('processingArea').style.display = 'block';
        document.getElementById('resultsArea').style.display = 'none';
    }

    updateProgress(percentage, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }
        if (progressText) {
            progressText.textContent = Math.round(percentage) + '%';
        }
    }

    showResults() {
        document.getElementById('processingArea').style.display = 'none';
        document.getElementById('resultsArea').style.display = 'block';

        this.displayResults();
        this.displaySummary();
    }

    displayResults() {
        const resultsGrid = document.getElementById('resultsGrid');
        resultsGrid.innerHTML = '';

        this.compressedFiles.forEach((item, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            const preview = document.createElement('img');
            preview.className = 'result-preview';
            preview.src = URL.createObjectURL(item.compressed);
            preview.onload = () => URL.revokeObjectURL(preview.src);

            resultItem.innerHTML = `
                <div class="result-header">
                    <img class="result-preview" src="${URL.createObjectURL(item.compressed)}" alt="Preview">
                    <div class="result-info">
                        <h4>${item.original.name}</h4>
                        <p>Compressed successfully</p>
                    </div>
                </div>
                <div class="result-stats">
                    <div class="stat-item">
                        <span class="stat-value">${this.formatFileSize(item.original.size)}</span>
                        <span class="stat-label">Original</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.formatFileSize(item.compressed.size)}</span>
                        <span class="stat-label">Compressed</span>
                    </div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary btn-sm" onclick="compressor.downloadSingle(${index})">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            `;

            resultsGrid.appendChild(resultItem);
        });
    }

    displaySummary() {
        const totalOriginalSize = this.compressedFiles.reduce((sum, item) => sum + item.original.size, 0);
        const totalCompressedSize = this.compressedFiles.reduce((sum, item) => sum + item.compressed.size, 0);
        const totalSavings = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100;

        document.getElementById('totalSavings').textContent = Math.round(totalSavings) + '%';
        document.getElementById('filesProcessed').textContent = this.compressedFiles.length;
    }

    downloadSingle(index) {
        const item = this.compressedFiles[index];
        this.downloadFile(item.compressed, item.original.name);
    }

    async downloadAll() {
        if (this.compressedFiles.length === 1) {
            this.downloadSingle(0);
            return;
        }

        // For multiple files, create a zip (simplified version - download individually for now)
        this.compressedFiles.forEach((item, index) => {
            setTimeout(() => {
                this.downloadFile(item.compressed, `compressed_${item.original.name}`);
            }, index * 100); // Stagger downloads
        });

        this.showToast(`Downloading ${this.compressedFiles.length} compressed images...`, 'success');
    }

    downloadFile(file, filename) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(message, type = 'success') {
        if (window.pixelCraftPro) {
            window.pixelCraftPro.showToast(message, type);
        }
    }
}

// Reset tool function
function resetTool() {
    // Hide all sections
    document.getElementById('settingsPanel').style.display = 'none';
    document.getElementById('processingArea').style.display = 'none';
    document.getElementById('resultsArea').style.display = 'none';

    // Clear file list
    const fileList = document.getElementById('fileList');
    if (fileList) {
        fileList.remove();
    }

    // Reset form
    document.getElementById('fileInput').value = '';
    document.getElementById('qualitySlider').value = 80;
    document.getElementById('qualityValue').textContent = '80';
    document.getElementById('formatSelect').value = 'auto';
    document.getElementById('resizeCheck').checked = false;
    document.getElementById('resizeOptions').style.display = 'none';

    // Reset compressor
    if (window.compressor) {
        window.compressor.files = [];
        window.compressor.compressedFiles = [];
    }

    // Show upload area
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.style.display = 'block';
    }
}

// Initialize compressor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.compressor = new ImageCompressor();
});