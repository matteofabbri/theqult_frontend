
# Modello: Board

Le Board sono community gestite dagli utenti, ognuna con le proprie regole di visibilità e partecipazione.

## Accesso e Privacy
Il tipo di accesso determina chi può visualizzare i contenuti e interagire:

- **Public (Pubblica)**: La board è visibile a tutti. Chiunque può iscriversi e partecipare.
- **Password (Protetta)**: Per visualizzare i post e interagire, l'utente deve inserire una stringa segreta impostata dal creatore. Una volta sbloccata, la board si comporta come una pubblica per quell'utente.
- **Invite Only (Solo Invito)**: La board è invisibile o inaccessibile finché l'utente non viene invitato ufficialmente. 
    - **Meccanismo**: Un amministratore della board deve inviare un invito specifico tramite la funzione "Invite User" (che genera un messaggio privato di tipo `board_invite`).
    - **Accettazione**: L'accesso viene concesso **solo dopo** che il destinatario ha cliccato su "Accetta" all'interno del messaggio ricevuto. Prima dell'accettazione, l'ID dell'utente non compare in `allowedUserIds`.

## Moderazione e Ruoli
- `creatorId`: Il proprietario originale.
- `moderatorIds`: Utenti autorizzati a rimuovere post e commenti.
- `adminIds`: Utenti con pieni poteri, inclusa la gestione degli inviti e delle impostazioni di privacy.
- `allowedUserIds`: Lista di ID utenti che hanno accettato un invito o pagato una fee (se previsto).
