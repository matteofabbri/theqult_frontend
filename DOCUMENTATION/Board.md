# Modello: Board

Le Board sono community gestite dagli utenti.

## Accesso e Privacy
Il campo `accessType` (virtuale, derivato) determina la visibilità:
- **Public**: Accesso libero.
- **Password**: Richiede il campo `password` per l'ingresso.
- **InviteOnly**: Solo gli utenti in `allowedUserIds` possono accedere.
- **Paid**: Richiede il pagamento di `entryFee` per popolare `allowedUserIds`.

## Moderazione
- `creatorId`: Proprietario della board.
- `moderatorIds`: Utenti con permessi di cancellazione contenuti.
- `adminIds`: Utenti con pieni poteri (modifica impostazioni, gestione Ad).
