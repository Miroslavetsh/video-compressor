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
