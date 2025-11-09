# ⚡ Configuration Rapide des Webhooks Stripe

## ✅ État actuel
- ✅ Stripe CLI installé (v1.32.0)
- ✅ Serveur Next.js actif sur http://localhost:3000
- ✅ Endpoint webhook configuré : `/api/payments/webhook`

## 🚀 Étapes rapides

### 1. Se connecter à Stripe (si pas déjà fait)
```powershell
stripe login
```

### 2. Lancer Stripe Listen
**Ouvrez un NOUVEAU terminal PowerShell** et exécutez :

```powershell
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Vous verrez quelque chose comme :
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

### 3. Configurer le secret dans .env
1. **Copiez le secret** affiché (commence par `whsec_...`)
2. **Ouvrez `.env`** à la racine du projet
3. **Ajoutez ou modifiez** :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
   (Remplacez par votre secret)

### 4. Redémarrer Next.js
1. Arrêtez le serveur actuel (Ctrl+C)
2. Relancez : `npm run dev`

## 🧪 Tester

### Option 1 : Test avec Stripe CLI
Dans le terminal où `stripe listen` tourne :
```powershell
stripe trigger checkout.session.completed
```

### Option 2 : Test complet
1. Créez une facture via l'interface admin
2. Utilisez le lien de paiement Stripe
3. Paiement test : `4242 4242 4242 4242` (n'importe quelle date/CVC)
4. Vérifiez que la facture passe à "PAID" automatiquement

## 📝 Notes
- Laissez `stripe listen` actif pendant les tests
- Le secret change si vous relancez `stripe listen`
- En production, configurez les webhooks dans le dashboard Stripe

