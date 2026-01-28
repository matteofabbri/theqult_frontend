
# Modello: Advertisement

Sistema pubblicitario integrato nelle community.

## Struttura
- `title`: Titolo dell'annuncio.
- `content`: Testo descrittivo breve.
- `imageUrl`: Immagine visualizzata nel banner o nella sidebar.
- `linkUrl`: Destinazione esterna del click.

## Stati
- `pending`: In attesa di approvazione da parte di un admin della Board specifica.
- `active`: In rotazione e visibile agli utenti.
- `rejected`: Rifiutata dall'admin.
- `completed`: Rimossa manualmente o per fine campagna.
