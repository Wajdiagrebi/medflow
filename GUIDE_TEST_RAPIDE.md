# 🚀 Guide de Test Rapide - MedFlow

## ⚡ Démarrage Rapide (5 minutes)

### 1. Vérifier que tout est prêt

```bash
# Vérifier que le serveur tourne
npm run dev

# Dans un autre terminal, vérifier les webhooks Stripe (si vous testez les paiements)
stripe listen --forward-to localhost:3000/api/payments/webhook
```

### 2. Comptes de Test

#### Comptes disponibles (créés par le seed) :

**ADMIN**
- Email: `admin@clinique.test`
- Password: `admin123`

**DOCTEUR**
- Email: `doc1@clinique.test`
- Password: `doctor123`
- Email: `doc2@clinique.test`
- Password: `doctor123`

**RÉCEPTIONNISTE**
- ⚠️ Pas de compte réceptionniste dans le seed par défaut
- Vous pouvez en créer un via l'interface admin ou directement en base
- Pour créer un compte réceptionniste rapidement, ajoutez ceci dans `prisma/seed.ts` :
```typescript
const receptionistPassword = await bcrypt.hash('receptionist123', 10);
await prisma.user.upsert({
  where: { email: 'recep1@clinique.test' },
  update: {},
  create: {
    name: 'Réceptionniste Demo',
    email: 'recep1@clinique.test',
    password: receptionistPassword,
    role: 'RECEPTIONIST',
    clinicId: clinic.id,
  },
});
```

**PATIENT**
- ⚠️ Les patients ne sont pas des Users, ils sont dans la table Patient
- Pour tester l'interface patient, vous devez créer un User avec le rôle PATIENT

### 3. Test Minimal (15 minutes)

#### Étape 1 : Connexion Admin
1. Aller sur http://localhost:3000/login
2. Se connecter avec `admin@clinique.test` / `admin123`
3. Vérifier que le dashboard admin s'affiche
4. Vérifier la navigation

#### Étape 2 : Créer un Patient
1. Aller sur `/admin/patients` (ou via le menu)
2. Créer un nouveau patient
3. Vérifier qu'il apparaît dans la liste

#### Étape 3 : Créer un Rendez-vous
1. Aller sur `/admin/appointments`
2. Créer un nouveau rendez-vous
   - Sélectionner un patient
   - Sélectionner un docteur
   - Choisir une date/heure
3. Vérifier qu'il apparaît dans la liste

#### Étape 4 : Créer une Consultation (Docteur)
1. Se déconnecter
2. Se connecter avec `doc1@clinique.test` / `doctor123`
3. Aller sur `/doctor/consultations/new`
4. Créer une consultation
   - Sélectionner un patient
   - (Optionnel) Lier un rendez-vous
   - Entrer un diagnostic
5. Vérifier qu'elle apparaît dans la liste

#### Étape 5 : Créer une Prescription
1. Aller sur `/doctor/prescriptions/new`
2. Créer une prescription
   - Sélectionner la consultation créée
   - Ajouter des médicaments
   - Ajouter des instructions
3. Vérifier que le PDF est généré
4. Télécharger le PDF

#### Étape 6 : Créer une Facture (Admin)
1. Se déconnecter
2. Se reconnecter en admin
3. Aller sur `/admin/invoices`
4. Créer une facture
   - Sélectionner un patient
   - Entrer un montant
5. Vérifier que le PDF est généré
6. Vérifier l'URL Stripe

#### Étape 7 : Tester le Paiement (Patient)
1. Créer un User avec le rôle PATIENT (via admin ou directement)
2. Se connecter en tant que patient
3. Aller sur `/patient/dashboard/invoices`
4. Cliquer sur "Payer" une facture
5. Tester le paiement Stripe (carte de test : 4242 4242 4242 4242)
6. Vérifier que le statut passe à "PAID"

### 4. Points de Vérification Rapides

- [ ] Navigation s'affiche correctement
- [ ] Breadcrumbs s'affichent
- [ ] Les pages se chargent sans erreur
- [ ] Les formulaires fonctionnent
- [ ] Les PDFs se génèrent
- [ ] Les toasts s'affichent (si implémentés)

### 5. Problèmes Courants

#### Problème : "Session invalide - ID du docteur manquant"
**Solution** : Se déconnecter et se reconnecter (le token JWT doit être régénéré)

#### Problème : "Patient introuvable" ou "Docteur introuvable"
**Solution** : Vérifier que les données sont bien dans la base de données avec `npx prisma studio`

#### Problème : Les PDFs ne se génèrent pas
**Solution** : Vérifier que le dossier `public/invoices` existe et est accessible

#### Problème : Les webhooks Stripe ne fonctionnent pas
**Solution** : 
1. Vérifier que `stripe listen` est actif
2. Vérifier que `STRIPE_WEBHOOK_SECRET` est dans `.env`
3. Vérifier que l'URL du webhook est correcte

### 6. Commandes Utiles

```bash
# Ouvrir Prisma Studio pour voir la base de données
npx prisma studio

# Réinitialiser la base de données
npx prisma migrate reset

# Re-seeder la base de données
npx prisma db seed

# Vérifier les logs du serveur
# Regarder le terminal où npm run dev tourne
```

### 7. Checklist de Test Complet

Consultez `TEST_COMPLET.md` pour la liste complète de tous les tests à effectuer.

---

## 🎯 Objectif du Test

L'objectif est de vérifier que :
1. ✅ Toutes les fonctionnalités principales fonctionnent
2. ✅ La navigation est fluide
3. ✅ Les permissions sont respectées
4. ✅ Les PDFs se génèrent correctement
5. ✅ Les paiements Stripe fonctionnent
6. ✅ L'interface est responsive

---

**Bon test ! 🚀**

