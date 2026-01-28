
# Modello: Message

Sistema di comunicazione privata inter-utente.

## Tipi di Messaggio
- `text`: Messaggio standard. Se il destinatario ha una `publicKey` impostata, il contenuto viene salvato in formato cifrato.
- `board_invite`: Messaggio speciale che contiene il nome e l'ID di una board. Il destinatario può cliccare su "Accetta" per essere aggiunto agli utenti autorizzati.
- `notification`: Messaggio di sistema per informare l'utente di eventi (es. invito accettato).

## Sicurezza
- **E2EE**: Utilizza la `publicKey` dell'utente per garantire che solo il destinatario possa decifrare il testo.
