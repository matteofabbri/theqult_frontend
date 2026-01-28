
# Interazioni e Flussi Operativi

## 1. Sistema di Voto
- Universalmente applicabile a Post e Commenti.
- Gli utenti anonimi votano tramite un `anon-id` persistente nel browser per prevenire voti doppi senza login (ove permesso dalla Board).

## 2. Privacy delle Board
- **Password**: Accesso protetto da una stringa segreta impostata dal creatore.
- **InviteOnly**: Solo gli utenti esplicitamente invitati o approvati dagli amministratori possono visualizzare il contenuto.

## 3. Messaggistica
Supporta tre tipi di contenuto:
- Testo semplice (opzionalmente criptato tramite chiavi pubbliche).
- Allegati multimediali.
- Inviti formali a Board private con sistema di accettazione/rifiuto integrato.

## 4. Pubblicità
Le board agiscono come marketplace per contenuti sponsorizzati:
- Gli utenti creano campagne inviando una richiesta agli admin della board.
- Gli admin della board approvano o rifiutano l'annuncio in base alla rilevanza.
