class YouTubeDownloader {
    constructor() {
        this.selectedFile = null;
        this.selectedFolder = null;
        this.videoLinks = [];
        this.isDownloading = false;
        
        this.initializeApp();
    }

    async initializeApp() {
        await this.checkSystemStatus();
        this.setupEventListeners();
    }

    async checkSystemStatus() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        try {
            const result = await window.electronAPI.checkYtDlp();
            
            if (result.installed) {
                statusIndicator.className = 'status-indicator ready';
                statusText.textContent = `yt-dlp ready (${result.version})`;
            } else {
                statusIndicator.className = 'status-indicator error';
                statusText.textContent = 'yt-dlp not installed';
                this.showInstallationInstructions();
            }
        } catch (error) {
            statusIndicator.className = 'status-indicator error';
            statusText.textContent = 'System check failed';
        }
    }

    showInstallationInstructions() {
        // Create installation instructions modal or notification
        console.log('yt-dlp installation required');
    }

    setupEventListeners() {
        document.getElementById('fileSelectBtn').addEventListener('click', () => this.selectFile());
        document.getElementById('folderSelectBtn').addEventListener('click', () => this.selectFolder());
        document.getElementById('downloadBtn').addEventListener('click', () => this.startDownload());
        
        // Listen for download progress updates
        window.electronAPI.onDownloadProgress((event, data) => {
            this.updateProgress(data);
        });
    }

    async selectFile() {
        try {
            const result = await window.electronAPI.selectFile();
            if (result) {
                this.selectedFile = result;
                this.processVideoLinks(result.content);
                this.displayFileInfo(result);
                this.updateDownloadButton();
            }
        } catch (error) {
            console.error('Error selecting file:', error);
        }
    }

    processVideoLinks(content) {
        const lines = content.split('\n');
        this.videoLinks = lines
            .map(line => line.trim())
            .filter(line => line && (line.includes('youtube.com') || line.includes('youtu.be')));
    }

    displayFileInfo(fileData) {
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const linksCount = document.getElementById('linksCount');
        const linksPreview = document.getElementById('linksPreview');
        const linksContainer = document.getElementById('linksContainer');

        fileName.textContent = `File: ${fileData.path.split('/').pop()}`;
        linksCount.textContent = `${this.videoLinks.length} YouTube links found`;
        
        // Show preview of links
        linksContainer.innerHTML = '';
        this.videoLinks.slice(0, 10).forEach((link, index) => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            linkItem.textContent = `${index + 1}. ${link}`;
            linksContainer.appendChild(linkItem);
        });

        if (this.videoLinks.length > 10) {
            const moreItem = document.createElement('div');
            moreItem.className = 'link-item';
            moreItem.textContent = `... and ${this.videoLinks.length - 10} more`;
            moreItem.style.fontStyle = 'italic';
            linksContainer.appendChild(moreItem);
        }

        fileInfo.style.display = 'block';
        linksPreview.style.display = 'block';
    }

    async selectFolder() {
        try {
            const result = await window.electronAPI.selectFolder();
            if (result) {
                this.selectedFolder = result;
                this.displayFolderInfo(result);
                this.updateDownloadButton();
            }
        } catch (error) {
            console.error('Error selecting folder:', error);
        }
    }

    displayFolderInfo(folderPath) {
        const folderInfo = document.getElementById('folderInfo');
        const folderPathEl = document.getElementById('folderPath');
        
        folderPathEl.textContent = folderPath;
        folderInfo.style.display = 'block';
    }

    updateDownloadButton() {
        const downloadBtn = document.getElementById('downloadBtn');
        const canDownload = this.selectedFile && this.selectedFolder && this.videoLinks.length > 0 && !this.isDownloading;
        
        downloadBtn.disabled = !canDownload;
        
        if (canDownload) {
            downloadBtn.innerHTML = `🚀 Download ${this.videoLinks.length} Videos`;
        } else if (this.isDownloading) {
            downloadBtn.innerHTML = '⏳ Downloading...';
        } else {
            downloadBtn.innerHTML = '🚀 Start Download';
        }
    }

    async startDownload() {
        if (this.isDownloading) return;
        
        this.isDownloading = true;
        this.updateDownloadButton();
        
        const progressContainer = document.getElementById('progressContainer');
        progressContainer.style.display = 'block';
        
        const format = document.getElementById('formatSelect').value;
        const quality = document.getElementById('qualitySelect').value;
        
        try {
            const result = await window.electronAPI.downloadVideos({
                links: this.videoLinks,
                outputPath: this.selectedFolder,
                format,
                quality
            });
            
            this.showResults(result);
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            this.isDownloading = false;
            this.updateDownloadButton();
        }
    }

    updateProgress(data) {
        const progressFill = document.getElementById('progressFill');
        const progressLabel = document.getElementById('progressLabel');
        const progressPercent = document.getElementById('progressPercent');
        const currentVideo = document.getElementById('currentVideo');
        const completedCount = document.getElementById('completedCount');
        const failedCount = document.getElementById('failedCount');
        
        const overallProgress = (data.completedVideos / data.totalVideos) * 100;
        
        progressFill.style.width = `${overallProgress}%`;
        progressPercent.textContent = `${Math.round(overallProgress)}%`;
        
        if (data.status === 'completed') {
            progressLabel.textContent = `Completed video ${data.currentVideo} of ${data.totalVideos}`;
            currentVideo.textContent = `✅ ${data.currentUrl}`;
        } else if (data.status === 'failed') {
            progressLabel.textContent = `Failed video ${data.currentVideo} of ${data.totalVideos}`;
            currentVideo.textContent = `❌ ${data.currentUrl}`;
        } else {
            progressLabel.textContent = `Downloading video ${data.currentVideo} of ${data.totalVideos}`;
            currentVideo.textContent = `⏳ ${data.currentUrl}`;
        }
        
        completedCount.textContent = data.completedVideos;
        failedCount.textContent = data.totalVideos - data.completedVideos - (data.totalVideos - data.currentVideo);
    }

    showResults(result) {
        const resultsContainer = document.getElementById('resultsContainer');
        const resultsSummary = document.getElementById('resultsSummary');
        const failedVideos = document.getElementById('failedVideos');
        
        resultsSummary.innerHTML = `
            <strong>Download Complete!</strong><br>
            ✅ ${result.completed} videos downloaded successfully<br>
            ❌ ${result.failed} videos failed
        `;
        
        if (result.failed > 0) {
            failedVideos.style.display = 'block';
            failedVideos.innerHTML = '<h4>Failed Downloads:</h4>';
            
            result.failedVideos.forEach(video => {
                const failedItem = document.createElement('div');
                failedItem.className = 'failed-video-item';
                failedItem.innerHTML = `
                    <div class="failed-video-url">${video.url}</div>
                    <div class="failed-video-error">${video.error}</div>
                `;
                failedVideos.appendChild(failedItem);
            });
        }
        
        resultsContainer.style.display = 'block';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new YouTubeDownloader();
});
