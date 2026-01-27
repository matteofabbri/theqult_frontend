# Modello: Post

Contenuti pubblicati all'interno delle Board.

## Struttura
- `title`: Titolo del post.
- `content`: Testo in formato Markdown/HTML.
- `boardId`: Riferimento alla board ospitante.
- `authorId`: ID dell'utente o `null` se anonimo.
- `media`: Array di `MediaItem` (immagini, video, audio).

## Visualizzazione
Nel feed vengono visualizzati con un'anteprima limitata (mask-gradient). La visualizzazione completa è disponibile nella pagina dedicata.
