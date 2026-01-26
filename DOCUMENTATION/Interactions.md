# Interazioni e Flussi Operativi

## 1. Sistema di Voto
Il voto (`castVote`) è universale per post e commenti. 
- Gli utenti loggati votano con il proprio `userId`.
- Gli utenti anonimi possono votare se la Board lo consente; in tal caso, viene generato un `anon-id` persistente nel LocalStorage per evitare voti multipli dalla stessa sessione.

## 2. Economia dei Kopeki
Il sistema gestisce transazioni virtuali tra utenti:
- **Premi (Awards)**: Un utente spende Kopeki per dare un premio a un post; i Kopeki vengono trasferiti all'autore (meno eventuali fee di sistema).
- **Paywall**: Sblocco di post nel profilo o accesso a board a pagamento.
- **P2P Transfer**: Invio diretto di denaro tramite messaggistica privata.

## 3. Messaggistica E2EE (Mock)
Quando un utente invia un messaggio a un destinatario dotato di `publicKey`:
1. Il contenuto viene "criptato" (Base64 con prefisso `ENC::`) prima di essere salvato.
2. Solo chi possiede il contesto corretto può visualizzarlo decriptato nella propria UI.

## 4. Sistema Pubblicitario
Le board sono marketplace pubblicitari.
- Gli inserzionisti creano un Ad specificando budget e bid.
- Gli admin della board approvano o rifiutano la richiesta.
- Impression e Click vengono tracciati automaticamente dal frontend e scalati dal budget dell'Ad.
