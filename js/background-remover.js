// Background Remover Tool JavaScript
class BackgroundRemover {
    constructor() {
        this.originalImage = null;
        this.processedImage = null;
        this.currentBackground = 'transparent';
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
                if (e.target.files && e.target.files[0]) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }

        // Download button
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadImage();
            });
        }

        // Background options
        const bgOptions = document.querySelectorAll('.bg-option');
        bgOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.changeBackground(e.currentTarget.dataset.bg);
                
                // Update active state
                bgOptions.forEach(opt => opt.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
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
            if (files && files[0]) {
                this.handleFileSelect(files[0]);
            }
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFileSelect(file) {
        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showToast('File size must be less than 5MB', 'error');
            return;
        }

        this.originalImage = file;
        this.processImage();
    }

    async processImage() {
        if (!this.originalImage) return;

        this.showProcessing();

        try {
            // Simulate AI processing with canvas-based background removal
            // In a real implementation, this would call an AI service
            const processedBlob = await this.simulateBackgroundRemoval(this.originalImage);
            this.processedImage = processedBlob;
            
            this.showResults();
            
        } catch (error) {
            console.error('Error processing image:', error);
            this.showToast('Error processing image. Please try again.', 'error');
            this.resetTool();
        }
    }

    async simulateBackgroundRemoval(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw the original image
                ctx.drawImage(img, 0, 0);

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Simple edge detection and background removal simulation
                // This is a simplified version - real AI would be much more sophisticated
                this.applySimpleBackgroundRemoval(data, canvas.width, canvas.height);

                // Put the processed data back
                ctx.putImageData(imageData, 0, 0);

                // Convert to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to process image'));
                    }
                }, 'image/png');
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }

    applySimpleBackgroundRemoval(data, width, height) {
        // This is a very basic implementation for demonstration
        // Real background removal would use sophisticated AI algorithms
        
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
        
        // Sample the background color from corners
        const bgColor = this.sampleBackgroundColor(data, width, height);
        const threshold = 100; // Color similarity threshold

        for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = i / 4;
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate distance from background color and center
            const colorDistance = Math.sqrt(
                Math.pow(r - bgColor.r, 2) +
                Math.pow(g - bgColor.g, 2) +
                Math.pow(b - bgColor.b, 2)
            );
            
            const centerDistance = Math.sqrt(
                Math.pow(x - centerX, 2) + 
                Math.pow(y - centerY, 2)
            );
            
            const maxDistance = Math.sqrt(
                Math.pow(width / 2, 2) + 
                Math.pow(height / 2, 2)
            );
            
            // Simple heuristic: remove pixels that are similar to background color
            // and far from center
            if (colorDistance < threshold && centerDistance > maxDistance * 0.3) {
                data[i + 3] = 0; // Make transparent
            }
        }
    }

    sampleBackgroundColor(data, width, height) {
        // Sample colors from the four corners and take average
        const corners = [
            { x: 0, y: 0 },
            { x: width - 1, y: 0 },
            { x: 0, y: height - 1 },
            { x: width - 1, y: height - 1 }
        ];

        let totalR = 0, totalG = 0, totalB = 0;

        corners.forEach(corner => {
            const index = (corner.y * width + corner.x) * 4;
            totalR += data[index];
            totalG += data[index + 1];
            totalB += data[index + 2];
        });

        return {
            r: Math.floor(totalR / corners.length),
            g: Math.floor(totalG / corners.length),
            b: Math.floor(totalB / corners.length)
        };
    }

    showProcessing() {
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('processingArea').style.display = 'block';
        document.getElementById('resultsArea').style.display = 'none';

        // Animate progress bar
        this.animateProgress();
    }

    animateProgress() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            
            if (progressFill) progressFill.style.width = progress + '%';
            if (progressText) progressText.textContent = Math.round(progress) + '%';
        }, 200);
    }

    showResults() {
        document.getElementById('processingArea').style.display = 'none';
        document.getElementById('resultsArea').style.display = 'block';

        this.displayImages();
    }

    displayImages() {
        const originalImg = document.getElementById('originalImage');
        const processedImg = document.getElementById('processedImage');

        if (originalImg && this.originalImage) {
            originalImg.src = URL.createObjectURL(this.originalImage);
            originalImg.onload = () => URL.revokeObjectURL(originalImg.src);
        }

        if (processedImg && this.processedImage) {
            processedImg.src = URL.createObjectURL(this.processedImage);
            processedImg.onload = () => URL.revokeObjectURL(processedImg.src);
        }
    }

    changeBackground(background) {
        this.currentBackground = background;
        const processedImg = document.getElementById('processedImage');
        const container = processedImg.parentElement;

        // Reset container styles
        container.style.background = '';
        
        if (background === 'transparent') {
            // Show transparency pattern
            container.style.background = '';
        } else if (background.startsWith('linear-gradient')) {
            container.style.background = background;
        } else {
            container.style.background = background;
        }

        // Update the processed image to composite with new background
        if (this.processedImage && background !== 'transparent') {
            this.compositeWithBackground(background);
        }
    }

    async compositeWithBackground(background) {
        if (!this.processedImage) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            // Fill background
            if (background.startsWith('linear-gradient')) {
                // Create gradient
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = background;
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the processed image on top
            ctx.drawImage(img, 0, 0);

            // Update the display
            canvas.toBlob((blob) => {
                if (blob) {
                    const processedImg = document.getElementById('processedImage');
                    if (processedImg) {
                        URL.revokeObjectURL(processedImg.src);
                        processedImg.src = URL.createObjectURL(blob);
                        processedImg.onload = () => URL.revokeObjectURL(processedImg.src);
                    }
                }
            }, 'image/png');
        };

        img.src = URL.createObjectURL(this.processedImage);
    }

    downloadImage() {
        if (!this.processedImage) return;

        if (this.currentBackground === 'transparent') {
            // Download original processed image with transparency
            this.downloadFile(this.processedImage, 'background-removed.png');
        } else {
            // Create composited version for download
            this.createCompositedDownload(this.currentBackground);
        }
    }

    async createCompositedDownload(background) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            // Fill background
            if (background.startsWith('linear-gradient')) {
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = background;
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the processed image
            ctx.drawImage(img, 0, 0);

            // Download
            canvas.toBlob((blob) => {
                if (blob) {
                    this.downloadFile(blob, `background-removed-${this.getBackgroundName(background)}.png`);
                }
            }, 'image/png');
        };

        img.src = URL.createObjectURL(this.processedImage);
    }

    getBackgroundName(background) {
        if (background === '#ffffff') return 'white';
        if (background === '#000000') return 'black';
        if (background === '#4CAF50') return 'green';
        if (background === '#2196F3') return 'blue';
        if (background.startsWith('linear-gradient')) return 'gradient';
        return 'custom';
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Image downloaded successfully!', 'success');
    }

    showToast(message, type = 'success') {
        if (window.pixelCraftPro) {
            window.pixelCraftPro.showToast(message, type);
        }
    }

    resetTool() {
        // Hide all sections
        document.getElementById('processingArea').style.display = 'none';
        document.getElementById('resultsArea').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';

        // Reset file input
        document.getElementById('fileInput').value = '';

        // Reset background options
        document.querySelectorAll('.bg-option').forEach(opt => opt.classList.remove('active'));
        document.querySelector('.bg-option[data-bg="transparent"]').classList.add('active');

        // Reset state
        this.originalImage = null;
        this.processedImage = null;
        this.currentBackground = 'transparent';
    }
}

// Reset tool function
function resetTool() {
    if (window.backgroundRemover) {
        window.backgroundRemover.resetTool();
    }
}

// Initialize background remover when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.backgroundRemover = new BackgroundRemover();
});