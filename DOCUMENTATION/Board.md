
# Modello: Board

Le Board sono community gestite dagli utenti.

## Accesso e Privacy
Il campo `accessType` (virtuale, derivato) determina la visibilità:
- **Public**: Accesso libero a chiunque.
- **Password**: Richiede il campo `password` per l'ingresso e la visualizzazione dei post.
- **InviteOnly**: Solo gli utenti presenti in `allowedUserIds` possono accedere. Gli inviti vengono gestiti via messaggistica privata.

## Moderazione
- `creatorId`: Proprietario della board.
- `moderatorIds`: Utenti con permessi di cancellazione dei contenuti altrui.
- `adminIds`: Utenti con pieni poteri (modifica impostazioni, approvazione Ad).
