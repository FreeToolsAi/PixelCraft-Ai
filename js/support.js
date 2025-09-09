// Support Page JavaScript
class SupportCenter {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeFAQ();
    }

    setupEventListeners() {
        // Contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmission();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchFAQ(e.target.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchFAQ(searchInput.value);
                }
            });
        }
    }

    initializeFAQ() {
        // Close all FAQ items initially
        const faqAnswers = document.querySelectorAll('.faq-answer');
        faqAnswers.forEach(answer => {
            answer.style.maxHeight = '0';
            answer.style.padding = '0 25px';
        });
    }

    handleContactSubmission() {
        const form = document.getElementById('contactForm');
        const formData = new FormData(form);
        
        // Validate required fields
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');

        if (!name || !email || !subject || !message) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }

        // Simulate form submission
        this.showToast('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
        
        // Reset form
        form.reset();
        
        // In a real implementation, you would send the data to your backend
        console.log('Contact form submitted:', {
            name, email, subject, message,
            category: formData.get('category'),
            timestamp: new Date().toISOString()
        });
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    searchFAQ(query) {
        const faqItems = document.querySelectorAll('.faq-item');
        const searchTerm = query.toLowerCase().trim();

        if (searchTerm === '') {
            // Show all FAQ items
            faqItems.forEach(item => {
                item.style.display = 'block';
                // Close all answers
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');
                question.classList.remove('active');
                answer.classList.remove('active');
            });
            return;
        }

        let hasResults = false;

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                item.style.display = 'block';
                // Automatically expand matching items
                const questionEl = item.querySelector('.faq-question');
                const answerEl = item.querySelector('.faq-answer');
                questionEl.classList.add('active');
                answerEl.classList.add('active');
                hasResults = true;
            } else {
                item.style.display = 'none';
            }
        });

        if (!hasResults) {
            this.showToast(`No results found for "${query}". Try different keywords or contact us directly.`, 'warning');
        }
    }

    showToast(message, type = 'success') {
        if (window.pixelCraftPro) {
            window.pixelCraftPro.showToast(message, type);
        }
    }
}

// FAQ Toggle Function
function toggleFAQ(questionElement) {
    const faqItem = questionElement.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const isActive = questionElement.classList.contains('active');

    // Close all other FAQ items
    document.querySelectorAll('.faq-question.active').forEach(item => {
        if (item !== questionElement) {
            item.classList.remove('active');
            item.parentElement.querySelector('.faq-answer').classList.remove('active');
        }
    });

    // Toggle current item
    if (isActive) {
        questionElement.classList.remove('active');
        answer.classList.remove('active');
    } else {
        questionElement.classList.add('active');
        answer.classList.add('active');
    }
}

// Search FAQ Function (called from search button)
function searchFAQ() {
    const query = document.getElementById('searchInput').value;
    if (window.supportCenter) {
        window.supportCenter.searchFAQ(query);
    }
}

// Show Help Modal
function showHelp(category) {
    const modal = document.getElementById('helpModal');
    const title = document.getElementById('helpModalTitle');
    const body = document.getElementById('helpModalBody');

    const helpContent = {
        upload: {
            title: 'File Upload Help',
            content: `
                <div style="padding: 20px 0;">
                    <h4 style="color: var(--dark); margin-bottom: 15px;">Common Upload Issues & Solutions</h4>
                    
                    <div style="margin-bottom: 25px;">
                        <h5 style="color: var(--primary); margin-bottom: 10px;">📁 File Format Not Supported</h5>
                        <p style="color: var(--gray); margin-bottom: 10px;">Make sure your file is in a supported format:</p>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li>JPEG/JPG - Most common photo format</li>
                            <li>PNG - Best for images with transparency</li>
                            <li>WebP - Modern efficient format</li>
                            <li>GIF - For simple graphics</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h5 style="color: var(--primary); margin-bottom: 10px;">📏 File Size Too Large</h5>
                        <p style="color: var(--gray); margin-bottom: 10px;">File size limits:</p>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li>Image Compressor: 10MB maximum</li>
                            <li>Background Remover: 5MB maximum</li>
                            <li>Other tools: 10MB maximum</li>
                        </ul>
                        <p style="color: var(--gray); margin-top: 10px;"><strong>Tip:</strong> Use our Image Compressor first to reduce file size.</p>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h5 style="color: var(--primary); margin-bottom: 10px;">⚡ Upload Keeps Failing</h5>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li>Check your internet connection</li>
                            <li>Try refreshing the page</li>
                            <li>Clear your browser cache</li>
                            <li>Try a different browser</li>
                            <li>Disable browser extensions temporarily</li>
                        </ul>
                    </div>

                    <div style="background: var(--light); padding: 20px; border-radius: var(--border-radius-sm); border-left: 4px solid var(--primary);">
                        <h5 style="color: var(--dark); margin-bottom: 10px;">💡 Pro Tips</h5>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li>Drag and drop files directly onto the upload area</li>
                            <li>You can upload multiple files at once for most tools</li>
                            <li>Use high-quality images for best results</li>
                        </ul>
                    </div>
                </div>
            `
        },
        settings: {
            title: 'Tool Settings Guide',
            content: `
                <div style="padding: 20px 0;">
                    <h4 style="color: var(--dark); margin-bottom: 15px;">How to Optimize Tool Settings</h4>
                    
                    <div style="margin-bottom: 25px;">
                        <h5 style="color: var(--primary); margin-bottom: 10px;">🗜️ Image Compressor Settings</h5>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li><strong>Quality (10-100%):</strong> Higher = better quality but larger file</li>
                            <li><strong>Format:</strong> 
                                <ul style="margin: 5px 0; padding-left: 20px;">
                                    <li>JPEG: Best for photos</li>
                                    <li>PNG: Best for graphics/transparency</li>
                                    <li>WebP: Best overall compression</li>
                                </ul>
                            </li>
                            <li><strong>Resize:</strong> Enable to reduce dimensions and file size</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h5 style="color: var(--primary); margin-bottom: 10px;">✂️ Background Remover Settings</h5>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li><strong>Background Options:</strong> Choose transparent, solid color, or gradient</li>
                            <li><strong>Best Results:</strong> Use images with clear subject-background contrast</li>
                            <li><strong>Lighting:</strong> Well-lit images produce better results</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h5 style="color: var(--primary); margin-bottom: 10px;">📐 Image Resizer Tips</h5>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li><strong>Keep Aspect Ratio:</strong> Prevents image distortion</li>
                            <li><strong>Common Sizes:</strong> 1920x1080 (Full HD), 1280x720 (HD)</li>
                            <li><strong>Social Media:</strong> Instagram (1080x1080), Facebook (1200x630)</li>
                        </ul>
                    </div>

                    <div style="background: var(--success); color: white; padding: 20px; border-radius: var(--border-radius-sm);">
                        <h5 style="margin-bottom: 10px;">🎯 Recommended Settings</h5>
                        <ul style="padding-left: 20px;">
                            <li><strong>Web Use:</strong> JPEG, 70-80% quality</li>
                            <li><strong>Print:</strong> PNG or JPEG, 90-100% quality</li>
                            <li><strong>Social Media:</strong> JPEG, 80-85% quality, appropriate dimensions</li>
                        </ul>
                    </div>
                </div>
            `
        },
        download: {
            title: 'Download Issues Help',
            content: `
                <div style="padding: 20px 0;">
                    <h4 style="color: var(--dark); margin-bottom: 15px;">Troubleshooting Download Problems</h4>
                    
                    <div style="margin-bottom: 25px;">
                        <h5 style="color: var(--primary); margin-bottom: 10px;">🚫 Download Not Starting</h5>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li>Check if popup blocker is enabled - disable it for our site</li>
                            <li>Try right-clicking the download button and select "Save link as"</li>
                            <li>Ensure downloads are enabled in your browser settings</li>
                            <li>Try using a different browser</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h5 style="color: var(--primary); margin-bottom: 10px;">📂 Can't Find Downloaded File</h5>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li>Check your default Downloads folder</li>
                            <li>Look in browser download history (Ctrl+Shift+Delete)</li>
                            <li>Search your computer for the filename</li>
                            <li>Check if antivirus software quarantined the file</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h5 style="color: var(--primary); margin-bottom: 10px;">🔄 Download Keeps Failing</h5>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li>Check your internet connection stability</li>
                            <li>Free up storage space on your device</li>
                            <li>Try downloading one file at a time</li>
                            <li>Restart your browser and try again</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h5 style="color: var(--primary); margin-bottom: 10px;">💾 File Format Issues</h5>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li>Most tools output PNG files for transparency</li>
                            <li>Compressed images are usually JPEG or WebP</li>
                            <li>PDF tools output .pdf files</li>
                            <li>Make sure you have software to open the file type</li>
                        </ul>
                    </div>

                    <div style="background: var(--light); padding: 20px; border-radius: var(--border-radius-sm); border-left: 4px solid var(--warning);">
                        <h5 style="color: var(--dark); margin-bottom: 10px;">⚠️ Browser-Specific Issues</h5>
                        <ul style="color: var(--gray); padding-left: 20px;">
                            <li><strong>Chrome:</strong> Check chrome://settings/downloads</li>
                            <li><strong>Firefox:</strong> Check about:preferences#files</li>
                            <li><strong>Safari:</strong> Check Safari > Preferences > General</li>
                            <li><strong>Edge:</strong> Check edge://settings/downloads</li>
                        </ul>
                    </div>
                </div>
            `
        }
    };

    const content = helpContent[category];
    if (content) {
        title.textContent = content.title;
        body.innerHTML = content.content;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close Help Modal
function closeHelpModal() {
    const modal = document.getElementById('helpModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Initialize support center when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.supportCenter = new SupportCenter();
    
    // Close modal when clicking outside
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeHelpModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal && activeModal.id === 'helpModal') {
                closeHelpModal();
            }
        }
    });
});