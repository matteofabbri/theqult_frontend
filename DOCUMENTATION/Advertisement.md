# Modello: Advertisement

Sistema pubblicitario integrato.

## Modelli di Billing
- `CPC` (Cost Per Click): Il budget cala solo al click dell'utente.
- `CPM` (Cost Per Mille): Il budget cala ogni 1000 visualizzazioni.

## Stati
- `pending`: In attesa di approvazione admin.
- `approved` / `active`: In rotazione nelle board.
- `rejected`: Rifiutata (il budget residuo viene rimborsato all'utente).
- `completed`: Budget esaurito.
