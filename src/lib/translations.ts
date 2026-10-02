// French translations for the application
export const translations = {
  fr: {
    // Navigation
    navigation: {
      productFamilies: "Familles de Produits",
      industrialEquipmentCategories: "Catégories d'Équipements Industriels",
      allProducts: "Tous les Produits",
      newArrivals: "Nouveautés",
      topSelling: "Meilleures Ventes",
      home: "Accueil",
      shop: "Boutique",
      cart: "Panier",
      admin: "Admin",
      search: "Rechercher",
      searchPlaceholder: "Rechercher des équipements industriels..."
    },
    
    // Homepage
    homepage: {
      newArrivals: "NOUVEAUTéS",
      topSelling: "MEILLEURES VENTES",
      errorLoadingProducts: "Erreur lors du chargement des produits. Veuillez réessayer plus tard.",
      viewAll: "Voir tout"
    },
    
    // Shop Page
    shop: {
      allProducts: "Tous les Produits",
      showing: "Affichage",
      of: "de",
      products: "produits",
      sortBy: "Trier par:",
      none: "Aucun",
      lowPrice: "Prix bas",
      highPrice: "Prix élevé",
      previous: "Précédent",
      next: "Suivant",
      noProducts: "Aucun produit disponible",
      loadingProducts: "Chargement des produits..."
    },
    
    // Product Details
    product: {
      startingFrom: "À partir de",
      contactForPricing: "Contactez-nous pour le prix",
      viewDetails: "Voir les détails",
      addToCart: "Ajouter au panier",
      specifications: "Spécifications",
      description: "Description",
      rating: "Note",
      category: "Catégorie",
      productNotFound: "Produit non trouvé",
      backToShop: "Retour à la boutique",
      relatedProducts: "Produits associés",
      selectConfiguration: "Sélectionnez la configuration",
      required: "Requis",
      optional: "Optionnel"
    },
    
    // Cart Page
    cart: {
      yourCart: "Votre Panier",
      emptyCart: "Votre panier est vide",
      continueShopping: "Continuer les achats",
      subtotal: "Sous-total",
      total: "Total",
      checkout: "Finaliser la commande",
      remove: "Supprimer",
      quantity: "Quantité",
      selectedConfiguration: "Configuration sélectionnée",
      proceedToCheckout: "Passer à la commande",
      orderInquiry: "Demande de commande",
      customerInformation: "Informations client",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      phoneNumber: "Numéro de téléphone",
      companyName: "Nom de l'entreprise",
      shippingAddress: "Adresse de livraison",
      dateLimit: "Date limite",
      submit: "Envoyer",
      cancel: "Annuler",
      allFieldsRequired: "Tous les champs sont requis",
      validEmailRequired: "Veuillez entrer un email valide",
      validPhoneRequired: "Veuillez entrer un numéro de téléphone valide (10-15 chiffres)",
      dateMustBeFuture: "La date limite doit être dans le futur",
      orderSentSuccessfully: "Commande envoyée avec succès",
      orderSentMessage: "Votre demande de commande a été envoyée avec succès. Notre équipe vous contactera bientôt.",
      errorSendingOrder: "Erreur lors de l'envoi de la commande",
      pricedProducts: "Produits avec prix",
      productsRequiringPriceConfirmation: "Produits nécessitant une confirmation de prix",
      ourTeamWillContact: "Notre équipe vous contactera pour fournir les détails de prix pour les articles suivants.",
      image: "Image",
      product: "Produit",
      price: "Prix"
    },
    
    // Admin Page
    admin: {
      adminDashboard: "Tableau de bord Admin",
      products: "Produits",
      families: "Familles",
      manageParameters: "Gérer les paramètres",
      selectProductToManage: "Sélectionnez le produit à gérer",
      selectProduct: "Sélectionnez un produit",
      addNewParameter: "Ajouter nouveau paramètre",
      editParameter: "Modifier le paramètre",
      parameterName: "Nom du paramètre",
      parameterType: "Type de paramètre",
      displayOrder: "Ordre d'affichage",
      requiredParameter: "Paramètre requis",
      parameterValues: "Valeurs du paramètre",
      valueName: "Nom de la valeur",
      addAnotherValue: "Ajouter une autre valeur",
      addParameter: "Ajouter paramètre",
      updateParameter: "Modifier paramètre",
      currentParameters: "Paramètres actuels",
      type: "Type",
      required: "Requis",
      order: "Ordre",
      values: "Valeurs",
      addValue: "Ajouter valeur",
      confirmDeletion: "Confirmer la suppression",
      areYouSure: "Êtes-vous sûr de vouloir supprimer",
      delete: "Supprimer",
      
      // Product Management
      addNewProduct: "Ajouter nouveau produit",
      updateProduct: "Modifier produit",
      productFamily: "Famille de produits",
      selectFamily: "Sélectionnez une famille",
      category: "Catégorie",
      title: "Titre",
      productImages: "Images du produit",
      mainImage: "Image principale",
      setAsMain: "Définir comme principale",
      remove: "Supprimer",
      uploadImages: "Télécharger images",
      uploading: "Téléchargement...",
      priceSettings: "Paramètres de prix",
      showPrice: "Afficher le prix",
      contactForPricing: "Contactez pour le prix",
      priceWillBeHidden: "Le prix sera masqué. Les clients verront : \"Contactez-nous pour les détails de prix\"",
      startingPrice: "Prix de départ",
      willBeDisplayed: "Sera affiché comme",
      rating: "Note",
      description: "Description",
      specifications: "Spécifications",
      label: "Étiquette",
      value: "Valeur",
      addSpecification: "Ajouter spécification",
      productList: "Liste des produits",
      family: "Famille",
      noFamily: "Aucune famille",
      edit: "Modifier",
      
      // Family Management
      manageProductFamilies: "Gérer les familles de produits",
      addNewFamily: "Ajouter nouvelle famille",
      editFamily: "Modifier famille",
      familyName: "Nom de la famille",
      addFamily: "Ajouter famille",
      updateFamily: "Modifier famille",
      
      // Form Controls
      cancel: "Annuler",
      save: "Sauvegarder",
      yes: "Oui",
      no: "Non",
      
      // Parameter Types
      parameterTypes: {
        dropdown: "Liste déroulante (sélection unique)",
        multiselect: "Sélection multiple",
        checkbox: "Case à cocher",
        radio: "Boutons radio",
        text: "Saisie de texte",
        number: "Saisie numérique",
        textarea: "Zone de texte"
      },
      
      // Categories
      categories: {
        newArrivals: "Nouveautés",
        topSelling: "Meilleures Ventes",
        relatedProducts: "Produits associés"
      }
    },
    
    // General
    general: {
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      close: "Fermer",
      back: "Retour",
      continue: "Continuer",
      confirm: "Confirmer",
      currency: "MAD",
      contactUs: "Contactez-nous",
      readMore: "Lire plus",
      showLess: "Afficher moins",
      and: "et",
      or: "ou",
      search: "Rechercher",
      filter: "Filtrer",
      sort: "Trier",
      reset: "Réinitialiser",
      apply: "Appliquer"
    },
    
    // Error Messages
    errors: {
      pageNotFound: "Cette page n'a pas pu être trouvée",
      somethingWentWrong: "Quelque chose s'est mal passé",
      tryAgain: "Essayer à nouveau",
      networkError: "Erreur réseau",
      serverError: "Erreur serveur",
      invalidInput: "Entrée invalide",
      required: "Requis",
      tooShort: "Trop court",
      tooLong: "Trop long",
      invalidEmail: "Email invalide",
      invalidPhone: "Numéro de téléphone invalide"
    },
    
    // Success Messages
    success: {
      saved: "Sauvegardé avec succès",
      updated: "Mis à jour avec succès",
      deleted: "Supprimé avec succès",
      created: "Créé avec succès",
      sent: "Envoyé avec succès"
    }
  }
};

// Helper function to get translation
export function t(key: string, lang: string = 'fr'): string {
  const keys = key.split('.');
  let value: any = translations[lang as keyof typeof translations];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
  }
  
  return value || key;
}

// Hook for translations
export function useTranslations(lang: string = 'fr') {
  return {
    t: (key: string) => t(key, lang),
    translations: translations[lang as keyof typeof translations]
  };
}