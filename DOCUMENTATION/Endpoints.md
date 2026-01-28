
# Documentazione Endpoints API

Questa sezione descrive le rotte API richiamate dal frontend. Tutti i dati sono inviati e ricevuti in formato `application/json`.

## Autenticazione
### `POST /auth/login`
Effettua il login dell'utente.
- **Payload**: `{ username, password }`
- **Risposta**: `200 OK` con oggetto `User`.

### `POST /auth/register`
Registra un nuovo account.
- **Payload**: `{ username, password }`
- **Risposta**: `201 Created` con oggetto `User`.

---

## Board & Community
### `POST /boards`
Crea una nuova board.
- **Payload**: `{ name, description, allowAnonymousComments, allowAnonymousPosts, password?, isInviteOnly?, iconUrl?, bannerUrl? }`
- **Risposta**: `201 Created`.

### `POST /boards/:id/moderators`
Nomina un moderatore per la board.
- **Payload**: `{ userId }`
- **Risposta**: `200 OK`.

---

## Contenuti (Post & Commenti)
### `POST /posts`
Crea un post in una board.
- **Payload**: `{ id, title, content, media, boardId, authorId }`
- **Risposta**: `201 Created`.

### `POST /votes`
Invia un voto (Upvote/Downvote).
- **Payload**: `{ entityId, type, userId }` (type: 'up' | 'down')
- **Risposta**: `200 OK`.

### `POST /comments`
Invia un commento o una risposta.
- **Payload**: `{ id, content, postId, authorId, parentId, media }`
- **Risposta**: `201 Created`.

---

## Messaggistica & Social
### `POST /messages`
Invia un messaggio privato o un invito.
- **Payload**: `{ id, senderId, recipientId, content, media, isEncrypted, type, metadata? }`
- **Risposta**: `201 Created`.

### `POST /messages/:msgId/invite`
Risponde a un invito a una board.
- **Payload**: `{ action }` (action: 'accept' | 'reject')
- **Risposta**: `200 OK`.

---

## Pubblicità (Advertising)
### `POST /ads`
Invia una richiesta di sponsorizzazione per una board.
- **Payload**: `{ id, userId, boardId, title, content, linkUrl, imageUrl }`
- **Risposta**: `201 Created`.

### `POST /ads/:id/impression`
Traccia la visualizzazione di un annuncio.
- **Payload**: nessuno.
- **Risposta**: `204 No Content`.

### `POST /ads/:id/click`
Traccia il click su un annuncio.
- **Payload**: nessuno.
- **Risposta**: `204 No Content`.
