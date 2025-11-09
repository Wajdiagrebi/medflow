# 🚀 Démarrage Rapide - Webhooks Stripe

## ✅ Étape 1 : Lancer Stripe Listen

**Ouvrez un NOUVEAU terminal PowerShell** et exécutez :

```powershell
cd C:\Users\BJI\medflow
stripe listen --forward-to localhost:3000/api/payments/webhook
```

**Vous verrez :**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

## 🔐 Étape 2 : Copier le Secret

**Copiez le secret** qui commence par `whsec_...` (exemple : `whsec_abc123...`)

## 📝 Étape 3 : Mettre à jour .env

1. Ouvrez le fichier `.env` à la racine du projet
2. Cherchez ou ajoutez : `STRIPE_WEBHOOK_SECRET=`
3. Remplacez par votre secret :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
4. Sauvegardez

## 🔄 Étape 4 : Redémarrer Next.js

1. Dans le terminal où Next.js tourne : **Ctrl+C**
2. Relancez : `npm run dev`

## ✅ C'est fait !

Vos webhooks Stripe sont maintenant configurés ! 🎉

---

**Note :** Laissez `stripe listen` actif dans son terminal pendant que vous testez.

