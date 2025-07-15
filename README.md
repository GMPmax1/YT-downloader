# YouTube Bulk Downloader

A desktop application for downloading multiple YouTube videos at once.

## Prerequisites

1. **Node.js** (v16 or higher) - Download from [nodejs.org](https://nodejs.org/)
2. **yt-dlp** - YouTube video downloader

### Installing yt-dlp

**Windows:**
```bash
# Using pip (recommended)
pip install yt-dlp

# Or using chocolatey
choco install yt-dlp

# Or download from GitHub releases
# https://github.com/yt-dlp/yt-dlp/releases
```

**macOS:**
```bash
# Using Homebrew
brew install yt-dlp

# Or using pip
pip install yt-dlp
```

**Linux:**
```bash
# Using pip
pip install yt-dlp

# Or using package manager (Ubuntu/Debian)
sudo apt install yt-dlp

# Or using package manager (Fedora)
sudo dnf install yt-dlp
```

## Installation

1. **Clone or download** this project
2. **Install dependencies:**
   ```bash
   npm install
   ```

## Usage

1. **Run the application:**
   ```bash
   npm start
   ```

2. **Create a text file** with YouTube URLs (one per line):
   ```
   https://www.youtube.com/watch?v=VIDEO_ID1
   https://www.youtube.com/watch?v=VIDEO_ID2
   https://youtu.be/VIDEO_ID3
   ```

3. **Use the application:**
   - Select your .txt file with YouTube links
   - Choose download destination folder
   - Select format (Video/Audio) and quality
   - Click "Start Download"

## Features

- ✅ Bulk download multiple videos
- ✅ Progress tracking for each video
- ✅ Choose video quality (360p, 480p, 720p, 1080p)
- ✅ Download video or audio-only
- ✅ Modern desktop interface
- ✅ Error handling and retry logic
- ✅ Real-time download progress
- ✅ Failed downloads reporting

## Building

To create a distributable version:

```bash
# For current platform
npm run build

# For specific platforms
npm run build -- --win
npm run build -- --mac
npm run build -- --linux
```

## File Structure

```
youtube-bulk-downloader/
├── main.js          # Electron main process
├── preload.js       # Secure IPC bridge
├── renderer.js      # Frontend application logic
├── index.html       # Main UI
├── style.css        # Application styles
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## Legal Notice

This application is for educational purposes. Please respect YouTube's Terms of Service and copyright laws. Only download videos you have permission to download.

## Troubleshooting

**yt-dlp not found:**
- Make sure yt-dlp is installed and accessible from command line
- Try running `yt-dlp --version` in terminal
- Add yt-dlp to your system PATH

**Download fails:**
- Check your internet connection
- Verify the YouTube URLs are valid
- Some videos may be geo-restricted or private
- Try updating yt-dlp: `pip install --upgrade yt-dlp`

**Permission errors:**
- Make sure you have write access to the download folder
- Try running as administrator/sudo if needed

## Updates

The application will automatically use the latest version of yt-dlp installed on your system. To update:

```bash
pip install --upgrade yt-dlp
```