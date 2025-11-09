# Guide de Configuration des Webhooks Stripe

## 📋 Prérequis

1. **Compte Stripe** : Vous devez avoir un compte Stripe avec des clés API
2. **Stripe CLI** : Installer la CLI Stripe pour recevoir les webhooks en local
3. **Variables d'environnement** : `STRIPE_SECRET` et `STRIPE_WEBHOOK_SECRET` dans `.env`

## 🔧 Étape 1 : Installer Stripe CLI

### Windows (PowerShell)
```powershell
# Télécharger depuis : https://github.com/stripe/stripe-cli/releases
# Ou utiliser Scoop :
scoop install stripe
```

### Vérifier l'installation
```powershell
stripe --version
```

## 🔑 Étape 2 : Se connecter à Stripe CLI

```powershell
stripe login
```

Cela ouvrira votre navigateur pour vous authentifier avec votre compte Stripe.

## 📡 Étape 3 : Lancer Stripe Listen

Dans un **nouveau terminal PowerShell** (laissez le serveur Next.js tourner dans l'autre), exécutez :

```powershell
stripe listen --forward-to localhost:3000/api/payments/webhook
```

### Ce que vous verrez :
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

## 🔐 Étape 4 : Configurer STRIPE_WEBHOOK_SECRET

1. **Copiez le webhook signing secret** affiché (commence par `whsec_...`)
2. **Ouvrez votre fichier `.env`**
3. **Ajoutez ou mettez à jour** la ligne :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
   (Remplacez `whsec_xxxxxxxxxxxxx` par le secret que vous avez copié)

## 🔄 Étape 5 : Redémarrer le serveur Next.js

Après avoir mis à jour `.env`, **redémarrez le serveur Next.js** :

1. Arrêtez le serveur actuel (Ctrl+C dans le terminal où il tourne)
2. Relancez-le :
   ```powershell
   npm run dev
   ```

## ✅ Étape 6 : Tester les webhooks

### Test manuel avec Stripe CLI

Dans le terminal où `stripe listen` tourne, vous pouvez déclencher un événement de test :

```powershell
stripe trigger checkout.session.completed
```

### Test via l'interface

1. Créez une facture via l'interface admin
2. Cliquez sur le lien de paiement Stripe
3. Utilisez une carte de test Stripe :
   - **Numéro** : `4242 4242 4242 4242`
   - **Date** : N'importe quelle date future
   - **CVC** : N'importe quel 3 chiffres
   - **Code postal** : N'importe quel code postal
4. Complétez le paiement
5. Le webhook devrait automatiquement mettre à jour le statut de la facture à "PAID"

## 🔍 Vérification

### Vérifier que le webhook fonctionne

1. **Logs Stripe CLI** : Vous devriez voir les événements dans le terminal où `stripe listen` tourne
2. **Logs Next.js** : Vérifiez les logs du serveur Next.js pour voir si le webhook est reçu
3. **Base de données** : Vérifiez que le statut de la facture est passé à "PAID" dans la base de données

### Tester l'endpoint webhook directement

```powershell
# Note: Ce test nécessite une signature valide, donc utilisez plutôt stripe trigger
curl -X POST http://localhost:3000/api/payments/webhook
```

## ⚠️ Notes importantes

1. **Stripe Listen doit rester actif** : Laissez `stripe listen` tourner pendant que vous testez
2. **Mode test vs Production** : Assurez-vous d'utiliser les clés de test Stripe en développement
3. **Webhook Secret** : Le secret change à chaque fois que vous relancez `stripe listen`, donc mettez à jour `.env` si nécessaire
4. **Production** : En production, configurez les webhooks dans le dashboard Stripe au lieu d'utiliser `stripe listen`

## 🐛 Dépannage

### Erreur : "Stripe not configured"
- Vérifiez que `STRIPE_SECRET` est défini dans `.env`
- Redémarrez le serveur Next.js

### Erreur : "Webhook signature verification failed"
- Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond au secret affiché par `stripe listen`
- Redémarrez le serveur Next.js après avoir mis à jour `.env`

### Le webhook n'est pas reçu
- Vérifiez que `stripe listen` tourne
- Vérifiez que l'URL dans `stripe listen` correspond à votre endpoint (`/api/payments/webhook`)
- Vérifiez les logs du serveur Next.js

