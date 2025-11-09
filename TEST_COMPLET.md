# 🧪 Test Complet - MedFlow

## 📋 Plan de Test Complet

### 🔐 1. Authentification

#### Test de Connexion
- [ ] Se connecter en tant qu'ADMIN
- [ ] Se connecter en tant que DOCTOR
- [ ] Se connecter en tant que RECEPTIONIST
- [ ] Se connecter en tant que PATIENT
- [ ] Tester la déconnexion
- [ ] Tester l'accès non autorisé (redirection)

**Comptes de test** (à vérifier dans `prisma/seed.ts`) :
- Admin : `admin@clinique.test` / `admin123`
- Docteur : `doc1@clinique.test` / `doctor123`
- Réceptionniste : `recep1@clinique.test` / `receptionist123`
- Patient : (créer un compte patient)

---

### 👨‍💼 2. Interface ADMIN

#### Dashboard Admin
- [ ] Accéder à `/admin/dashboard`
- [ ] Vérifier les statistiques (patients, rendez-vous, recettes)
- [ ] Vérifier les graphiques/charts
- [ ] Vérifier la navigation

#### Gestion des Patients
- [ ] Accéder à `/admin/patients`
- [ ] Créer un nouveau patient
- [ ] Modifier un patient existant
- [ ] Supprimer un patient
- [ ] Rechercher un patient
- [ ] Vérifier la validation des champs

#### Gestion des Rendez-vous
- [ ] Accéder à `/admin/appointments`
- [ ] Créer un nouveau rendez-vous
- [ ] Modifier un rendez-vous
- [ ] Annuler un rendez-vous
- [ ] Filtrer par date/docteur/statut
- [ ] Vérifier la détection de conflits

#### Gestion des Factures
- [ ] Accéder à `/admin/invoices`
- [ ] Créer une nouvelle facture
- [ ] Vérifier la génération du PDF
- [ ] Vérifier l'intégration Stripe
- [ ] Vérifier le statut après paiement

#### Gestion des Services
- [ ] Accéder à `/admin/dashboard/services`
- [ ] Créer un nouveau service
- [ ] Modifier un service
- [ ] Supprimer un service

---

### 👨‍⚕️ 3. Interface DOCTOR

#### Consultations
- [ ] Accéder à `/doctor/consultations`
- [ ] Voir la liste des consultations
- [ ] Rechercher une consultation
- [ ] Créer une nouvelle consultation (`/doctor/consultations/new`)
  - [ ] Sélectionner un patient
  - [ ] Lier un rendez-vous (optionnel)
  - [ ] Entrer un diagnostic
  - [ ] Ajouter des notes
- [ ] Voir les détails d'une consultation (`/doctor/consultations/[id]`)
- [ ] Vérifier que le statut du rendez-vous passe à "DONE" si lié

#### Prescriptions
- [ ] Accéder à `/doctor/prescriptions`
- [ ] Voir la liste des prescriptions
- [ ] Rechercher une prescription
- [ ] Créer une nouvelle prescription (`/doctor/prescriptions/new`)
  - [ ] Sélectionner une consultation
  - [ ] Ajouter des médicaments (nom, dosage, durée, fréquence)
  - [ ] Ajouter des instructions
- [ ] Vérifier la génération automatique du PDF
- [ ] Voir les détails d'une prescription (`/doctor/prescriptions/[id]`)
- [ ] Télécharger le PDF d'une prescription

---

### 👩‍💼 4. Interface RECEPTIONIST

#### Dashboard Réceptionniste
- [ ] Accéder à `/reception/dashboard`
- [ ] Vérifier les statistiques du jour
- [ ] Vérifier la liste des rendez-vous du jour
- [ ] Vérifier les actions rapides
- [ ] Vérifier les alertes

#### Gestion des Rendez-vous
- [ ] Accéder à `/reception/appointments`
- [ ] Créer un nouveau rendez-vous
- [ ] Modifier un rendez-vous
- [ ] Annuler un rendez-vous
- [ ] Vérifier les filtres

#### Gestion des Factures
- [ ] Accéder à `/admin/invoices` (partagé avec admin)
- [ ] Créer une facture
- [ ] Vérifier le paiement

---

### 👤 5. Interface PATIENT

#### Dashboard Patient
- [ ] Accéder à `/patient/dashboard`
- [ ] Vérifier les statistiques personnelles
- [ ] Vérifier les rendez-vous à venir
- [ ] Vérifier les consultations récentes
- [ ] Vérifier les prescriptions récentes
- [ ] Vérifier les factures en attente
- [ ] Tester les actions rapides

#### Prise de Rendez-vous
- [ ] Accéder à `/patient/appointments/new`
- [ ] Sélectionner un docteur
- [ ] Choisir une date/heure
- [ ] Ajouter une raison
- [ ] Créer le rendez-vous
- [ ] Vérifier la confirmation

#### Mes Rendez-vous
- [ ] Accéder à `/patient/appointments`
- [ ] Voir tous les rendez-vous
- [ ] Filtrer par "À venir" / "Passés"
- [ ] Voir les détails d'un rendez-vous

#### Mes Consultations
- [ ] Accéder à `/patient/consultations`
- [ ] Voir la liste des consultations
- [ ] Rechercher une consultation
- [ ] Voir les détails d'une consultation (`/patient/consultations/[id]`)

#### Mes Prescriptions
- [ ] Accéder à `/patient/prescriptions`
- [ ] Voir la liste des prescriptions
- [ ] Rechercher une prescription
- [ ] Voir les détails d'une prescription (`/patient/prescriptions/[id]`)
- [ ] Télécharger le PDF d'une prescription

#### Mes Factures
- [ ] Accéder à `/patient/dashboard/invoices`
- [ ] Voir toutes les factures
- [ ] Voir les statistiques (total, en attente, payées)
- [ ] Payer une facture en attente
- [ ] Vérifier le paiement Stripe
- [ ] Télécharger le PDF d'une facture

---

### 🧭 6. Navigation et UX

#### Navigation
- [ ] Vérifier que le menu s'affiche correctement
- [ ] Vérifier que les liens sont adaptés au rôle
- [ ] Vérifier l'indication de la page active
- [ ] Tester le menu mobile (responsive)
- [ ] Vérifier l'affichage de l'utilisateur connecté
- [ ] Tester la déconnexion depuis le menu

#### Breadcrumbs
- [ ] Vérifier que les breadcrumbs s'affichent
- [ ] Vérifier que les labels sont corrects
- [ ] Tester la navigation via les breadcrumbs
- [ ] Vérifier sur différentes pages

#### Toasts
- [ ] Tester un message de succès
- [ ] Tester un message d'erreur
- [ ] Tester un message d'avertissement
- [ ] Tester un message d'info
- [ ] Vérifier la fermeture automatique
- [ ] Vérifier la fermeture manuelle

---

### 💳 7. Paiements Stripe

#### Création de Facture
- [ ] Créer une facture depuis l'admin
- [ ] Vérifier la génération du PDF
- [ ] Vérifier la création de la session Stripe
- [ ] Vérifier l'URL de checkout

#### Paiement
- [ ] Cliquer sur "Payer" une facture
- [ ] Vérifier la redirection vers Stripe
- [ ] Tester le paiement (carte de test)
- [ ] Vérifier le retour après paiement

#### Webhooks
- [ ] Vérifier que `stripe listen` est actif
- [ ] Vérifier que le webhook secret est configuré
- [ ] Tester un paiement et vérifier le webhook
- [ ] Vérifier que le statut de la facture passe à "PAID"
- [ ] Vérifier dans la base de données

---

### 📄 8. Génération de PDF

#### PDF Factures
- [ ] Créer une facture
- [ ] Vérifier que le PDF est généré
- [ ] Vérifier le contenu du PDF
- [ ] Vérifier le téléchargement

#### PDF Prescriptions
- [ ] Créer une prescription
- [ ] Vérifier que le PDF est généré
- [ ] Vérifier le contenu du PDF (médicaments, instructions)
- [ ] Vérifier le téléchargement

---

### 🔒 9. Sécurité et Permissions

#### Vérification des Rôles
- [ ] Tester l'accès admin avec un compte docteur
- [ ] Tester l'accès docteur avec un compte patient
- [ ] Tester l'accès réceptionniste avec un compte patient
- [ ] Vérifier les redirections appropriées

#### Vérification des Cliniques
- [ ] Vérifier que les données sont filtrées par clinique
- [ ] Vérifier qu'un admin ne voit que ses patients
- [ ] Vérifier qu'un docteur ne voit que ses consultations

#### Validation des Données
- [ ] Tester la création avec des données invalides
- [ ] Vérifier les messages d'erreur
- [ ] Vérifier la validation côté client et serveur

---

### 📱 10. Responsive Design

#### Mobile
- [ ] Tester sur mobile (< 768px)
- [ ] Vérifier le menu mobile
- [ ] Vérifier les cartes et grilles
- [ ] Vérifier les formulaires
- [ ] Vérifier la navigation

#### Tablette
- [ ] Tester sur tablette (768px - 1024px)
- [ ] Vérifier l'adaptation du layout

#### Desktop
- [ ] Tester sur desktop (> 1024px)
- [ ] Vérifier l'utilisation optimale de l'espace

---

### 🐛 11. Gestion des Erreurs

#### Erreurs API
- [ ] Tester avec une API qui retourne une erreur
- [ ] Vérifier l'affichage du message d'erreur
- [ ] Vérifier que l'application ne plante pas

#### Erreurs de Validation
- [ ] Tester avec des champs vides
- [ ] Tester avec des formats invalides
- [ ] Vérifier les messages d'erreur spécifiques

#### Erreurs Réseau
- [ ] Simuler une perte de connexion
- [ ] Vérifier le comportement de l'application

---

## 📝 Checklist de Test Rapide

### Test Minimal (15 minutes)
1. [ ] Se connecter en tant qu'admin
2. [ ] Créer un patient
3. [ ] Créer un rendez-vous
4. [ ] Créer une consultation (docteur)
5. [ ] Créer une prescription (docteur)
6. [ ] Créer une facture (admin)
7. [ ] Payer la facture (patient)
8. [ ] Vérifier la navigation

### Test Complet (1-2 heures)
- Suivre tous les points ci-dessus dans l'ordre

---

## 🚨 Problèmes Connus à Vérifier

1. **Session utilisateur** : Vérifier que `session.user.id` est bien présent après reconnexion
2. **Filtrage patient** : Les APIs retournent tous les patients/clinique, pas seulement ceux du patient connecté
3. **Layout** : Vérifier que les pages utilisent bien le layout `(dashboard)`

---

## 📊 Résultats Attendus

Après tous les tests, vous devriez avoir :
- ✅ Toutes les fonctionnalités principales fonctionnelles
- ✅ Navigation fluide entre les pages
- ✅ Messages d'erreur clairs
- ✅ PDF générés correctement
- ✅ Paiements Stripe fonctionnels
- ✅ Responsive design opérationnel

---

## 🔧 Commandes Utiles pour les Tests

```bash
# Démarrer le serveur
npm run dev

# Vérifier la base de données
npx prisma studio

# Vérifier les logs
# Regarder le terminal où Next.js tourne

# Tester les webhooks Stripe
stripe listen --forward-to localhost:3000/api/payments/webhook
```

---

**Bon test ! 🚀**

