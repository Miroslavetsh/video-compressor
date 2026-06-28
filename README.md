# Video Compressor

Двухпроходное сжатие видео через FFmpeg (Node.js + bash).

## Требования

- Node.js
- FFmpeg (в PATH)

### Установка

Команда для ffmpeg:

````bash
sudo chown -R "$USER" /opt/homebrew /Users/$USER/Library/Logs/Homebrew
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

## Расчет зарплаты за месяц

Добавлен отдельный скрипт расчета выплаты по формуле:

`their_working_days / all_working_days * floor(monthly_salary, 2)`

Где `all_working_days` считается автоматически как количество будних дней (пн-пт) в выбранном месяце.

Запуск:

```bash
npm run salary:calc
```

Дальше скрипт попросит ввести:

- месяц (`март`, `3`, `03`, `march` и т.д.)
- год (можно Enter для текущего года)
- количество отработанных дней
- месячную ставку

Также можно запускать сразу с аргументами:

```bash
npm run salary:calc -- март 2026 5 700
```

## Для скачивания видео

1. Получить путь от конкретного видоса и законсолить

```javascript
fetch(document.querySelector("video").currentSrc)
  .then((r) => r.text())
  .then((t) => {
    console.log(t);
    copy(t);
  });
```

2. Из текста получить ссылки на 480/720 и другие разрешения видео

```bash
#EXTM3U
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2599999,RESOLUTION=1280x720,FRAME-RATE=25.000,CODECS="avc1.64001f,mp4a.40.2",NAME="HQ"
https://e1p.starlight.digital/get-playlist/hls-vod/files/19/15/2581519/mq.mp4/index-v1-a1.m3u8?md5=f4mQSfaHHBtKD8GiDh0OJA&testadv=&hash=2a5f3ef3fa860af7dde6ba7e0ccdf6fbc42b44bc55b7f776fb81725b91f74073&is_edge=1
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1384904,RESOLUTION=854x480,FRAME-RATE=25.000,CODECS="avc1.64001f,mp4a.40.2",NAME="SD"
https://e1p.starlight.digital/get-playlist/hls-vod/files/16/15/2581516/lq.mp4/index-v1-a1.m3u8?md5=LXGU1tOlKG0WNdygBpiCrw&testadv=&hash=2a5f3ef3fa860af7dde6ba7e0ccdf6fbc42b44bc55b7f776fb81725b91f74073&is_edge=1

#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=250406,RESOLUTION=1280x720,CODECS="avc1.64001f",URI="https://e1p.starlight.digital/get-playlist/hls-vod/files/19/15/2581519/mq.mp4/iframes-v1-a1.m3u8?md5=Ee8H8OxmPLP8GvcOB0qWpA&testadv=&hash=2a5f3ef3fa860af7dde6ba7e0ccdf6fbc42b44bc55b7f776fb81725b91f74073&is_edge=1"
#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=145266,RESOLUTION=854x480,CODECS="avc1.64001f",URI="https://e1p.starlight.digital/get-playlist/hls-vod/files/16/15/2581516/lq.mp4/iframes-v1-a1.m3u8?md5=HVyenJ42pGrG6IsOade8Ew&testadv=&hash=2a5f3ef3fa860af7dde6ba7e0ccdf6fbc42b44bc55b7f776fb81725b91f74073&is_edge=1"
```

3. Запустить на выполнение FFMPEG

```bash
ffmpeg -i "https://e1p.starlight.digital/get-playlist/hls-vod/files/19/15/2581519/mq.mp4/index-v1-a1.m3u8?md5=f4mQSfaHHBtKD8GiDh0OJA&testadv=&hash=2a5f3ef3fa860af7dde6ba7e0ccdf6fbc42b44bc55b7f776fb81725b91f74073&is_edge=1" -c copy output/movie.mp4
```
