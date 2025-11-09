# 🎯 Étapes Finales - Configuration Webhooks Stripe

## ✅ État actuel
- ✅ Stripe CLI installé et connecté
- ✅ Serveur Next.js actif
- ✅ Endpoint webhook prêt : `/api/payments/webhook`

## 📋 Actions à faire maintenant

### Étape 1 : Lancer Stripe Listen

**Ouvrez un NOUVEAU terminal PowerShell** et exécutez :

```powershell
cd C:\Users\BJI\medflow
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Vous verrez quelque chose comme :
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

### Étape 2 : Copier le Webhook Secret

**Copiez le secret** qui commence par `whsec_...` (exemple : `whsec_abc123...`)

### Étape 3 : Mettre à jour .env

1. Ouvrez le fichier `.env` à la racine du projet
2. Cherchez la ligne `STRIPE_WEBHOOK_SECRET=`
3. Remplacez la valeur par le secret que vous avez copié :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
4. Sauvegardez le fichier

### Étape 4 : Redémarrer le serveur Next.js

1. Dans le terminal où Next.js tourne, appuyez sur **Ctrl+C** pour l'arrêter
2. Relancez-le :
   ```powershell
   npm run dev
   ```

## ✅ Vérification

Une fois tout configuré, vous pouvez tester :

### Test rapide avec Stripe CLI

Dans le terminal où `stripe listen` tourne :
```powershell
stripe trigger checkout.session.completed
```

Vous devriez voir l'événement dans les logs.

### Test complet

1. Créez une facture via l'interface admin (http://localhost:3000/admin/invoices)
2. Utilisez le lien de paiement Stripe
3. Paiement test :
   - **Carte** : `4242 4242 4242 4242`
   - **Date** : N'importe quelle date future (ex: 12/25)
   - **CVC** : N'importe quel 3 chiffres (ex: 123)
   - **Code postal** : N'importe quel code (ex: 12345)
4. Complétez le paiement
5. La facture devrait automatiquement passer à "PAID"

## 📝 Notes importantes

- ⚠️ **Laissez `stripe listen` actif** pendant que vous testez
- ⚠️ Si vous relancez `stripe listen`, le secret change → mettez à jour `.env`
- ⚠️ En production, configurez les webhooks dans le dashboard Stripe (pas `stripe listen`)

## 🎉 C'est tout !

Une fois ces étapes terminées, vos webhooks Stripe seront configurés et fonctionnels !

