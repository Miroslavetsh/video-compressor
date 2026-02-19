#!/bin/bash

INPUT_FILE="$1"

if [ -z "$INPUT_FILE" ]; then
  echo "Usage: ./compress.sh <input_filename>"
  echo "Example: ./compress.sh Screening.mov"
  exit 1
fi

OUTPUT_FILE="${INPUT_FILE%.*}_1GB.mp4"

node index.js "source/$INPUT_FILE" "output/$OUTPUT_FILE" 1000 --height 720 --fps 30 --codec h264
