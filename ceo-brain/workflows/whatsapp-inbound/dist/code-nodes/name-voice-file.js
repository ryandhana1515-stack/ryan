return $input.all().map((item) => {
  if (item.binary && item.binary.data) {
    item.binary.data.fileName = 'voice-note.ogg';
    item.binary.data.fileExtension = 'ogg';
    if (!/^audio\//.test(String(item.binary.data.mimeType || ''))) item.binary.data.mimeType = 'audio/ogg';
  }
  return item;
});
