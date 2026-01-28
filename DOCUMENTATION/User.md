
# Modello: User

L'utente è l'entità centrale del sistema.

## Campi Chiave
- `id`: UUID univoco.
- `username`: Nome identificativo pubblico.
- `role`: 'user' o 'admin'. Gli admin gestiscono gli Editoriali e le Ad globali.
- `publicKey`: Stringa RSA per la messaggistica cifrata (E2EE).
- `junkSenders`: Lista di ID utenti le cui conversazioni sono state spostate nel cestino.
- `bio`: Biografia opzionale visualizzata sul profilo.
