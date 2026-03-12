# Video Compressor

Двухпроходное сжатие видео через FFmpeg (Node.js + bash).

## Требования

- Node.js
- FFmpeg (в PATH)

### Установка

Команда для ffmpeg:

````bash
ssudo chown -R "$USER" /opt/homebrew /Users/$USER/Library/Logs/Homebrew
chmod -R u+w /opt/homebrew /Users/$USER/Library/Logs/Homebrew
brew install ffmpeg```

## Запуск

**Через npm (поменяй путь к файлу в `package.json` → `config.input`):**

```bash
# В package.json в секции "config" укажи имя файла, например "input": "Screening.mov"
# Файл должен лежать в source/
npm run compress:compatible
````

**Через bash (как раньше):**

```bash
# Положи видео в папку source/, затем:
./compress.sh Screening.mov
```

Результат появится в `output/Screening_1GB.mp4` (целевой размер ~1000 MB, 720p, 30 fps, H.264).

**Напрямую через Node:**

```bash
node index.js "source/видео.mov" "output/результат.mp4" 1000 --height 720 --fps 30 --codec h264
```

Опции: `--height`, `--fps`, `--codec`, `--preset`, `--audio` (kbps).
