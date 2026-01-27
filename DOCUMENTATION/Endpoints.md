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

## Wallet & Economia
### `POST /wallet/buy`
Acquisto di Kopeki (Deposito).
- **Payload**: `{ amount }` (numero di Kopeki)
- **Risposta**: `200 OK`.

### `POST /wallet/sell`
Conversione Kopeki in valuta (Prelievo).
- **Payload**: `{ amount }`
- **Risposta**: `200 OK`.

### `POST /profile-posts/:id/unlock`
Sblocca un post a pagamento sul profilo di un utente.
- **Payload**: nessuno (l'ID è nell'URL)
- **Risposta**: `200 OK`.

---

## Board & Community
### `POST /boards`
Crea una nuova board.
- **Payload**: `{ name, description, allowAnonymousComments, allowAnonymousPosts, password?, isInviteOnly?, entryFee?, iconUrl?, bannerUrl? }`
- **Risposta**: `201 Created`.

### `POST /boards/:id/pay`
Paga la quota di ingresso per una board a pagamento.
- **Payload**: nessuno.
- **Risposta**: `200 OK`.

### `POST /boards/:id/moderators`
Nomina un moderatore.
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
- **Payload**: `{ id, senderId, recipientId, content, media, kopekiAmount, isEncrypted, type, metadata? }`
- **Risposta**: `201 Created`.

### `POST /messages/:msgId/invite`
Risponde a un invito a una board.
- **Payload**: `{ action }` (action: 'accept' | 'reject')
- **Risposta**: `200 OK`.

### `POST /awards`
Invia un premio sociale.
- **Payload**: `{ entityId, entityType, awardId, receiverId }`
- **Risposta**: `200 OK`.

---

## Pubblicità (Advertising)
### `POST /ads`
Crea una campagna pubblicitaria.
- **Payload**: `{ id, userId, boardId, title, content, linkUrl, imageUrl, budget, model, bidAmount }`
- **Risposta**: `201 Created`.

### `POST /ads/:id/impression`
Traccia la visualizzazione di un annuncio (per modelli CPM).
- **Payload**: nessuno.
- **Risposta**: `204 No Content`.

### `POST /ads/:id/click`
Traccia il click su un annuncio (per modelli CPC).
- **Payload**: nessuno.
- **Risposta**: `204 No Content`.
