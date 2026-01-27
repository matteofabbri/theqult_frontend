# Modello: Message

Sistema di comunicazione privata inter-utente.

## Tipi di Messaggio
- `text`: Messaggio standard (può essere criptato se il destinatario ha una `publicKey`).
- `board_invite`: Contiene metadati per invitare un utente a una board chiusa.
- `notification`: Messaggio di sistema non interattivo.

## Funzionalità Economiche
- `kopekiAmount`: Se presente, il messaggio funge da transazione P2P (trasferimento di denaro in chat).
