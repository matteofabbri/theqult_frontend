
# Modello: Message

Sistema di comunicazione privata tra utenti, utilizzato anche per notifiche di sistema e gestione permessi.

## Tipi di Messaggio
- `text`: Comunicazione standard. Supporta la crittografia E2EE se le chiavi sono presenti.
- `board_invite`: Un invito formale a unirsi a una community privata.
    - **Contenuto**: Include l'ID e il nome della board nel campo `metadata`.
    - **Interattività**: Presenta pulsanti d'azione (Accetta/Rifiuta) che attivano logiche di aggiornamento del database delle Board.
- `notification`: Messaggi informativi non interattivi generati dal sistema (es. "L'utente X ha accettato il tuo invito").

## Struttura Metadata (per inviti)
```typescript
{
  boardId: string;     // ID della board a cui si è invitati
  boardName: string;   // Nome visualizzato (b/nome)
  inviteStatus: 'pending' | 'accepted' | 'rejected';
}
```

## Sicurezza e Privacy
- Gli utenti possono spostare mittenti indesiderati in `junkSenders` per silenziare le notifiche e nascondere le conversazioni.
