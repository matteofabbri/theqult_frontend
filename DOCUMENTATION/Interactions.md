
# Interazioni e Flussi Operativi

## 1. Sistema di Voto
- Applicabile a Post e Commenti.
- Gestione dei voti anonimi tramite `anon-id` locale per le board che lo consentono.

## 2. Flusso di Accesso Board "Invite Only"
A differenza delle board pubbliche, l'accesso segue un protocollo di messaggistica:
1. **Invito**: Un Admin della board cerca un utente e invia un invito.
2. **Messaggio Privato**: Il sistema recapita un `Message` con `type: 'board_invite'` al destinatario.
3. **Pendente**: Il messaggio mostra i pulsanti "Accetta" e "Rifiuta". Lo stato nel `metadata` è `pending`.
4. **Conferma**: 
    - Se l'utente clicca **Accetta**, il suo ID viene aggiunto all'array `allowedUserIds` della board e lo stato diventa `accepted`.
    - Se l'utente clicca **Rifiuta**, l'invito viene rimosso o marcato come `rejected`, senza concedere l'accesso.

## 3. Messaggistica Cifrata (E2EE)
- Se un destinatario ha una `publicKey` nel profilo, il client cifra il testo prima dell'invio.
- Solo il client del destinatario può decifrare il contenuto per la visualizzazione.

## 4. Marketplace Pubblicitario
- Gli utenti propongono annunci specifici per le board.
- Gli amministratori della board agiscono come curatori, approvando solo le inserzioni pertinenti alla loro community.
