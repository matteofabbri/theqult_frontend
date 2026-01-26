# Modelli di Dati

L'applicazione utilizza interfacce TypeScript rigorose per definire la struttura dei dati.

## Entità Principali

### User
L'utente è l'entità centrale.
- `role`: 'user' o 'admin'.
- `kopeki`: Saldo della valuta virtuale.
- `publicKey`: Chiave crittografica per la messaggistica E2EE.
- `isVerified`: Stato della verifica KYC.

### Board
Le community della piattaforma.
- `accessType`: Può essere Public, Password-protected, Invite-only o Paid.
- `entryFee`: Costo in Kopeki per accedere (se applicabile).
- `moderatorIds` / `adminIds`: Gestione dei permessi locali alla board.

### Post & ProfilePost
- `Post`: Contenuto pubblicato all'interno di una Board.
- `ProfilePost`: Contenuto pubblicato sul profilo personale dell'utente (può essere messo in vendita).

### Transaction
Tiene traccia di ogni movimento di Kopeki (Acquisti, Vendite, Premi, Sblocchi post).

### Advertisement
Gestito dai proprietari delle Board per monetizzare il proprio traffico.
- `model`: CPC (Cost Per Click) o CPM (Cost Per Mille).
- `budget`: Kopeki totali allocati per la campagna.
