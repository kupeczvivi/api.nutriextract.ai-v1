// PDF Allergen & Nutritional Extractor - Main JavaScript
class NutriExtractApp {
    constructor() {
        this.uploadedFiles = [];
        this.extractedData = null;
        this.processing = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.createParticleBackground();
        this.setupSampleData();
    }
    
    setupEventListeners() {
        // File upload handlers
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');
        const processBtn = document.getElementById('process-btn');
        
        // Drag and drop events
        uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        uploadZone.addEventListener('click', () => fileInput.click());
        
        // File input change
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Process button
        processBtn.addEventListener('click', this.processFiles.bind(this));
        
        // Export buttons
        document.getElementById('export-json')?.addEventListener('click', () => this.exportData('json'));
        document.getElementById('export-csv')?.addEventListener('click', () => this.exportData('csv'));
        document.getElementById('export-pdf')?.addEventListener('click', () => this.exportData('pdf'));
    }
    
    initializeAnimations() {
        // Animate hero text
        anime({
            targets: '.hero-bg h2',
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 1000,
            easing: 'easeOutQuart'
        });
        
        // Animate stats
        anime({
            targets: '.hero-bg .grid > div',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            delay: anime.stagger(200),
            easing: 'easeOutQuart'
        });
        
        // Animate upload card
        anime({
            targets: '#upload-zone',
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 600,
            delay: 500,
            easing: 'easeOutQuart'
        });
    }
    
    createParticleBackground() {
        // Simple particle system using p5.js
        new p5((p) => {
            let particles = [];
            
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.parent('particle-bg');
                
                // Create particles
                for (let i = 0; i < 50; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-0.5, 0.5),
                        vy: p.random(-0.5, 0.5),
                        size: p.random(2, 6)
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // Update and draw particles
                particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // Wrap around edges
                    if (particle.x < 0) particle.x = p.width;
                    if (particle.x > p.width) particle.x = 0;
                    if (particle.y < 0) particle.y = p.height;
                    if (particle.y > p.height) particle.y = 0;
                    
                    // Draw particle
                    p.fill(27, 77, 62, 30);
                    p.noStroke();
                    p.circle(particle.x, particle.y, particle.size);
                });
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        });
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.handleFiles(files);
    }
    
    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.handleFiles(files);
    }
    
    handleFiles(files) {
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        
        if (pdfFiles.length === 0) {
            this.showNotification('Please select PDF files only.', 'error');
            return;
        }
        
        this.uploadedFiles = [...this.uploadedFiles, ...pdfFiles];
        this.updateFileList();
        this.updateProcessButton();
    }
    
    updateFileList() {
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = '';
        
        this.uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'flex items-center justify-between bg-gray-50 rounded-lg p-4';
            fileItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                    </svg>
                    <div>
                        <div class="font-semibold text-gray-800">${file.name}</div>
                        <div class="text-sm text-gray-500">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button onclick="app.removeFile(${index})" class="text-red-500 hover:text-red-700 p-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            `;
            fileList.appendChild(fileItem);
        });
        
        // Animate file items
        anime({
            targets: '#file-list > div',
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 400,
            delay: anime.stagger(100),
            easing: 'easeOutQuart'
        });
    }
    
    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.updateFileList();
        this.updateProcessButton();
    }
    
    updateProcessButton() {
        const processBtn = document.getElementById('process-btn');
        processBtn.disabled = this.uploadedFiles.length === 0;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async processFiles() {
        if (this.processing) return;
        
        this.processing = true;
        this.showProcessingStatus();
        
        try {
            // Simulate processing with realistic delays
            await this.simulateProcessing();
            
            // Extract data from the first file (demo)
            const extractedData = await this.extractDataFromPDF(this.uploadedFiles[0]);
            
            // Display results
            this.displayResults(extractedData);
            
            this.showNotification('Data extracted successfully!', 'success');
            
        } catch (error) {
            console.error('Processing error:', error);
            this.showNotification('Error processing files. Please try again.', 'error');
        } finally {
            this.processing = false;
            this.hideProcessingStatus();
        }
    }
    
    showProcessingStatus() {
        const statusSection = document.getElementById('processing-status');
        statusSection.classList.remove('hidden');
        
        // Animate progress bars
        anime({
            targets: '#progress-upload',
            width: '100%',
            duration: 2000,
            easing: 'easeInOutQuart'
        });
        
        setTimeout(() => {
            anime({
                targets: '#progress-extract',
                width: '100%',
                duration: 2000,
                easing: 'easeInOutQuart'
            });
        }, 1000);
        
        setTimeout(() => {
            anime({
                targets: '#progress-analyze',
                width: '100%',
                duration: 2000,
                easing: 'easeInOutQuart'
            });
        }, 2000);
        
        // Scroll to processing status
        statusSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    hideProcessingStatus() {
        setTimeout(() => {
            document.getElementById('processing-status').classList.add('hidden');
            // Reset progress bars
            document.querySelectorAll('.progress-bar').forEach(bar => {
                bar.style.width = '0%';
            });
        }, 1000);
    }
    
    async simulateProcessing() {
        // Simulate realistic processing time
        return new Promise(resolve => {
            setTimeout(resolve, 6000);
        });
    }
    
    async extractDataFromPDF(file) {
        // This is a demo implementation
        // In a real application, this would use PDF.js and AI processing
        
        // Mock extracted data based on our sample PDF
        return {
            allergens: [
                { name: 'Milk', confidence: 0.95, severity: 'high' },
                { name: 'Tree Nuts (Almonds)', confidence: 0.92, severity: 'high' },
                { name: 'Soy', confidence: 0.88, severity: 'medium' },
                { name: 'Wheat', confidence: 0.90, severity: 'high' },
                { name: 'Peanuts', confidence: 0.75, severity: 'low', type: 'may contain' },
                { name: 'Eggs', confidence: 0.70, severity: 'low', type: 'may contain' }
            ],
            nutrition: {
                servingSize: '45g',
                calories: 180,
                totalFat: { amount: 8, unit: 'g', percentDV: 10 },
                saturatedFat: { amount: 1, unit: 'g', percentDV: 5 },
                cholesterol: { amount: 0, unit: 'mg', percentDV: 0 },
                sodium: { amount: 125, unit: 'mg', percentDV: 5 },
                totalCarbohydrate: { amount: 23, unit: 'g', percentDV: 8 },
                dietaryFiber: { amount: 4, unit: 'g', percentDV: 14 },
                totalSugars: { amount: 7, unit: 'g', percentDV: null },
                addedSugars: { amount: 5, unit: 'g', percentDV: 10 },
                protein: { amount: 5, unit: 'g', percentDV: null }
            },
            metadata: {
                fileName: file.name,
                fileSize: file.size,
                processedAt: new Date().toISOString()
            }
        };
    }
    
    displayResults(data) {
        this.extractedData = data;
        
        // Show results section
        const resultsSection = document.getElementById('results-section');
        resultsSection.classList.remove('hidden');
        
        // Display allergens
        this.displayAllergens(data.allergens);
        
        // Display nutrition
        this.displayNutrition(data.nutrition);
        
        // Create nutrition chart
        this.createNutritionChart(data.nutrition);
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Animate results
        anime({
            targets: '#results-section > div',
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            delay: anime.stagger(200),
            easing: 'easeOutQuart'
        });
    }
    
    displayAllergens(allergens) {
        const grid = document.getElementById('allergens-grid');
        grid.innerHTML = '';
        
        allergens.forEach(allergen => {
            const card = document.createElement('div');
            card.className = `allergen-card rounded-xl p-6 ${allergen.severity === 'high' ? 'border-red-400' : allergen.severity === 'medium' ? 'border-yellow-400' : 'border-green-400'}`;
            
            const severityColor = {
                high: 'text-red-600',
                medium: 'text-yellow-600',
                low: 'text-green-600'
            };
            
            card.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-lg font-semibold text-gray-800">${allergen.name}</h4>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${severityColor[allergen.severity]} bg-white">
                        ${allergen.severity.toUpperCase()}
                    </span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">
                        ${allergen.type ? allergen.type : 'Contains'}
                    </span>
                    <div class="flex items-center space-x-2">
                        <div class="w-16 bg-gray-200 rounded-full h-2">
                            <div class="bg-teal-500 h-2 rounded-full" style="width: ${allergen.confidence * 100}%"></div>
                        </div>
                        <span class="text-xs text-gray-500">${Math.round(allergen.confidence * 100)}%</span>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });
    }
    
    displayNutrition(nutrition) {
        const tableBody = document.getElementById('nutrition-table-body');
        tableBody.innerHTML = '';
        
        const nutrients = [
            { name: 'Calories', value: nutrition.calories, unit: '' },
            { name: 'Total Fat', value: nutrition.totalFat.amount, unit: nutrition.totalFat.unit, percent: nutrition.totalFat.percentDV },
            { name: 'Saturated Fat', value: nutrition.saturatedFat.amount, unit: nutrition.saturatedFat.unit, percent: nutrition.saturatedFat.percentDV },
            { name: 'Cholesterol', value: nutrition.cholesterol.amount, unit: nutrition.cholesterol.unit, percent: nutrition.cholesterol.percentDV },
            { name: 'Sodium', value: nutrition.sodium.amount, unit: nutrition.sodium.unit, percent: nutrition.sodium.percentDV },
            { name: 'Total Carbohydrate', value: nutrition.totalCarbohydrate.amount, unit: nutrition.totalCarbohydrate.unit, percent: nutrition.totalCarbohydrate.percentDV },
            { name: 'Dietary Fiber', value: nutrition.dietaryFiber.amount, unit: nutrition.dietaryFiber.unit, percent: nutrition.dietaryFiber.percentDV },
            { name: 'Total Sugars', value: nutrition.totalSugars.amount, unit: nutrition.totalSugars.unit },
            { name: 'Added Sugars', value: nutrition.addedSugars.amount, unit: nutrition.addedSugars.unit, percent: nutrition.addedSugars.percentDV },
            { name: 'Protein', value: nutrition.protein.amount, unit: nutrition.protein.unit }
        ];
        
        nutrients.forEach(nutrient => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="py-3 font-medium">${nutrient.name}</td>
                <td class="py-3 text-right">${nutrient.value}${nutrient.unit}</td>
                <td class="py-3 text-right">${nutrient.percent ? nutrient.percent + '%' : '-'}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    createNutritionChart(nutrition) {
        const chart = echarts.init(document.getElementById('nutrition-chart'));
        
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c}g ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: {
                    fontSize: 12
                }
            },
            series: [
                {
                    name: 'Macronutrients',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['60%', '50%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 8,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '16',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { value: nutrition.totalFat.amount, name: 'Fat', itemStyle: { color: '#F59E0B' } },
                        { value: nutrition.totalCarbohydrate.amount, name: 'Carbs', itemStyle: { color: '#8FBC8F' } },
                        { value: nutrition.protein.amount, name: 'Protein', itemStyle: { color: '#1B4D3E' } }
                    ]
                }
            ]
        };
        
        chart.setOption(option);
        
        // Make chart responsive
        window.addEventListener('resize', () => {
            chart.resize();
        });
    }
    
    exportData(format) {
        if (!this.extractedData) {
            this.showNotification('No data to export.', 'error');
            return;
        }
        
        let content, filename, mimeType;
        
        switch (format) {
            case 'json':
                content = JSON.stringify(this.extractedData, null, 2);
                filename = 'nutrition-data.json';
                mimeType = 'application/json';
                break;
                
            case 'csv':
                content = this.convertToCSV(this.extractedData);
                filename = 'nutrition-data.csv';
                mimeType = 'text/csv';
                break;
                
            case 'pdf':
                this.showNotification('PDF export coming soon!', 'info');
                return;
                
            default:
                return;
        }
        
        // Create download
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`Data exported as ${format.toUpperCase()}`, 'success');
    }
    
    convertToCSV(data) {
        const headers = ['Allergen', 'Confidence', 'Severity', 'Type'];
        const rows = data.allergens.map(allergen => [
            allergen.name,
            allergen.confidence,
            allergen.severity,
            allergen.type || 'Contains'
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        anime({
            targets: notification,
            opacity: [0, 1],
            translateX: [100, 0],
            duration: 300,
            easing: 'easeOutQuart'
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            anime({
                targets: notification,
                opacity: [1, 0],
                translateX: [0, 100],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => {
                    document.body.removeChild(notification);
                }
            });
        }, 3000);
    }
    
    setupSampleData() {
        // Sample data for demonstration
        this.sampleData = {
            granola: {
                allergens: [
                    { name: 'Milk', confidence: 0.95, severity: 'high' },
                    { name: 'Tree Nuts (Almonds)', confidence: 0.92, severity: 'high' },
                    { name: 'Soy', confidence: 0.88, severity: 'medium' },
                    { name: 'Wheat', confidence: 0.90, severity: 'high' }
                ],
                nutrition: {
                    servingSize: '45g',
                    calories: 180,
                    totalFat: { amount: 8, unit: 'g', percentDV: 10 },
                    saturatedFat: { amount: 1, unit: 'g', percentDV: 5 },
                    cholesterol: { amount: 0, unit: 'mg', percentDV: 0 },
                    sodium: { amount: 125, unit: 'mg', percentDV: 5 },
                    totalCarbohydrate: { amount: 23, unit: 'g', percentDV: 8 },
                    dietaryFiber: { amount: 4, unit: 'g', percentDV: 14 },
                    totalSugars: { amount: 7, unit: 'g', percentDV: null },
                    addedSugars: { amount: 5, unit: 'g', percentDV: 10 },
                    protein: { amount: 5, unit: 'g', percentDV: null }
                }
            },
            bread: {
                allergens: [
                    { name: 'Gluten', confidence: 0.98, severity: 'high' },
                    { name: 'Sesame', confidence: 0.65, severity: 'low', type: 'may contain' }
                ],
                nutrition: {
                    servingSize: '38g',
                    calories: 90,
                    totalFat: { amount: 1.5, unit: 'g', percentDV: 2 },
                    saturatedFat: { amount: 0, unit: 'g', percentDV: 0 },
                    cholesterol: { amount: 0, unit: 'mg', percentDV: 0 },
                    sodium: { amount: 180, unit: 'mg', percentDV: 8 },
                    totalCarbohydrate: { amount: 17, unit: 'g', percentDV: 6 },
                    dietaryFiber: { amount: 2, unit: 'g', percentDV: 7 },
                    totalSugars: { amount: 2, unit: 'g', percentDV: null },
                    addedSugars: { amount: 1, unit: 'g', percentDV: 2 },
                    protein: { amount: 3, unit: 'g', percentDV: null }
                }
            },
            yogurt: {
                allergens: [
                    { name: 'Milk', confidence: 0.99, severity: 'high' }
                ],
                nutrition: {
                    servingSize: '150g',
                    calories: 100,
                    totalFat: { amount: 0, unit: 'g', percentDV: 0 },
                    saturatedFat: { amount: 0, unit: 'g', percentDV: 0 },
                    cholesterol: { amount: 5, unit: 'mg', percentDV: 2 },
                    sodium: { amount: 55, unit: 'mg', percentDV: 2 },
                    totalCarbohydrate: { amount: 6, unit: 'g', percentDV: 2 },
                    dietaryFiber: { amount: 0, unit: 'g', percentDV: 0 },
                    totalSugars: { amount: 6, unit: 'g', percentDV: null },
                    addedSugars: { amount: 0, unit: 'g', percentDV: 0 },
                    protein: { amount: 17, unit: 'g', percentDV: null }
                }
            }
        };
    }
}

// Global function for sample data loading
function loadSampleData(type) {
    const data = app.sampleData[type];
    if (data) {
        app.displayResults(data);
        app.showNotification(`Loaded ${type} sample data`, 'success');
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NutriExtractApp();
});