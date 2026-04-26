
# Documentazione Endpoints API

## Messaggistica & Inviti

### `POST /messages`
Invia un messaggio o un invito a una board.
- **Payload**: `{ recipientId, content, type, metadata? }`
- **Nota**: Per gli inviti, `type` deve essere `'board_invite'` e `metadata` deve contenere `boardId`.

### `POST /messages/:msgId/invite`
Gestisce la risposta dell'utente a un invito pendente.
- **Payload**: `{ action: 'accept' | 'reject' }`
- **Logica lato server**:
    - Se `accept`: Aggiunge l'utente corrente a `allowedUserIds` della board indicata nel messaggio.
    - Aggiorna lo stato del messaggio in `accepted` o `rejected`.
    - Genera una notifica per l'amministratore che ha inviato l'invito.

---

## Board & Community

### `POST /boards`
Crea una nuova community.
- **AccessType**: Può essere definito come pubblico, con password o solo invito.

### `DELETE /boards/:id/users/:userId`
Rimuove un utente dalla lista degli autorizzati (revoca dell'invito o dell'accesso pagato).

---

## Contenuti e Social
... (Rotte standard per Post, Commenti e Voti)