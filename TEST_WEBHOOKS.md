# 🧪 Test des Webhooks Stripe

## ✅ Configuration actuelle
- ✅ STRIPE_SECRET configuré (sk_test_...)
- ✅ STRIPE_WEBHOOK_SECRET configuré (whsec_...)
- ✅ Serveur Next.js actif sur http://localhost:3000

## 🚀 Étapes pour tester

### 1. Lancer Stripe Listen (si pas déjà fait)

**Ouvrez un NOUVEAU terminal PowerShell** et exécutez :

```powershell
cd C:\Users\BJI\medflow
stripe listen --forward-to localhost:3000/api/payments/webhook
```

**Important :** 
- Si vous voyez un secret différent de celui dans `.env`, mettez à jour `.env` avec le nouveau secret
- Si le secret est le même, c'est parfait !

### 2. Redémarrer Next.js (si vous avez modifié .env)

Si vous avez mis à jour `STRIPE_WEBHOOK_SECRET` dans `.env` :
1. Arrêtez Next.js (Ctrl+C)
2. Relancez : `npm run dev`

### 3. Tester les webhooks

#### Option A : Test rapide avec Stripe CLI

Dans le terminal où `stripe listen` tourne :

```powershell
stripe trigger checkout.session.completed
```

**Vous devriez voir :**
- Dans le terminal `stripe listen` : L'événement reçu
- Dans les logs Next.js : Le webhook traité

#### Option B : Test complet avec paiement

1. **Créer une facture** via l'interface admin :
   - Allez sur http://localhost:3000/login
   - Connectez-vous : `admin@clinique.test` / `admin123`
   - Allez sur http://localhost:3000/admin/invoices
   - Créez une facture (si vous avez un formulaire) ou utilisez l'API

2. **Utiliser le lien de paiement Stripe** retourné

3. **Paiement test** :
   - **Carte** : `4242 4242 4242 4242`
   - **Date** : N'importe quelle date future (ex: 12/25)
   - **CVC** : N'importe quel 3 chiffres (ex: 123)
   - **Code postal** : N'importe quel code (ex: 12345)

4. **Complétez le paiement**

5. **Vérifiez** :
   - La facture passe automatiquement à "PAID"
   - Les logs montrent le webhook reçu

## 🔍 Vérification

### Vérifier que le webhook fonctionne

1. **Logs Stripe CLI** : Vous devriez voir les événements dans le terminal `stripe listen`
2. **Logs Next.js** : Vérifiez les logs du serveur pour voir si le webhook est reçu
3. **Base de données** : Vérifiez que le statut de la facture est "PAID"

### Tester l'endpoint webhook

```powershell
# Test simple (sans signature valide, devrait échouer mais confirme que l'endpoint répond)
Invoke-WebRequest -Uri http://localhost:3000/api/payments/webhook -Method POST
```

## ⚠️ Dépannage

### Erreur : "Webhook signature verification failed"
- Le `STRIPE_WEBHOOK_SECRET` dans `.env` ne correspond pas au secret de `stripe listen`
- **Solution** : Copiez le secret de `stripe listen` et mettez à jour `.env`, puis redémarrez Next.js

### Le webhook n'est pas reçu
- Vérifiez que `stripe listen` tourne
- Vérifiez que l'URL dans `stripe listen` correspond à `/api/payments/webhook`
- Vérifiez les logs du serveur Next.js

### Erreur : "Stripe not configured"
- Vérifiez que `STRIPE_SECRET` est défini dans `.env`
- Redémarrez le serveur Next.js

