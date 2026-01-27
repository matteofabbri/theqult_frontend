# Modello: MediaItem

Gestione degli asset multimediali.

## Tipi Supportati
- `image`: JPG, PNG, GIF, WebP.
- `video`: MP4, WebM (visualizzati con controlli nativi).
- `audio`: MP3, WAV (visualizzati con player audio).

## Storage
Nel prototipo i file sono salvati in **Base64 Data URLs**. In produzione, il campo `url` conterrà il link permanente all'Object Storage (S3/Cloudinary).
