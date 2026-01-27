# Modello: User

L'utente è l'entità centrale del sistema.

## Campi Chiave
- `id`: UUID univoco.
- `username`: Nome identificativo pubblico.
- `role`: 'user' o 'admin'. Gli admin gestiscono gli Editoriali e le Ad globali.
- `kopeki`: Saldo della valuta virtuale.
- `isVerified`: Stato del KYC. Solo gli utenti verificati possono depositare/prelevare fondi.
- `publicKey`: Stringa RSA per la messaggistica cifrata.
- `junkSenders`: Lista di ID utenti le cui conversazioni sono state spostate nel cestino.
