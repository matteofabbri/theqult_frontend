# Modello: Transaction

Il registro contabile immutabile dell'economia interna.

## Tipi di Transazione
- `buy`: Acquisto Kopeki (ricarica carta).
- `sell`: Prelievo Kopeki (accredito IBAN).
- `fee_payment` / `fee_income`: Pagamento/incasso per accesso a board.
- `p2p_transfer`: Trasferimento tra utenti.
- `award_given` / `award_received`: Gestione premi sociali.
- `post_unlock` / `post_income`: Sblocco contenuti profilo.
- `ad_payment` / `ad_refund`: Gestione budget pubblicitario.
