import { defineStore } from "pinia";


function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}


const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useTestStore = defineStore("test", {
  state: () => ({
    testData: {
      _id:"",
      ID: "",
      title: "",
      type: "",
      isNewElement: false,
      version: "",
      language: "",
      navigation: "",
      progression: "",
      Description: "",
      submission: "",
      preset: "",
      Subject: "",
      location: "",
      level: "",
      domain: "",
      duration: "",
      Keywords: [],
      metadata: {
        Author: "",
        Created: "",
        LastModif: "",
      },
      pages: [],
      elements: [],
      settings: {
        timeLimit: false,
        sufflePages: false,
        shuffleQuestions: false,
        shuffleoptions: false,
        NavigationPanel: false,
        progressBar: false,
        feedbackAllowed: false,
        directScore_FB: false,
        countDown: false,
      },
    },
    selectedElement: null,
    selectedElementLabel: null,
  }),
  
  actions: {
    resetState() {
      this.selectedElement = null;
      this.selectedElementLabel = null;
      this.currentPage = null;
      this.currentTest = null;
      //console.log("Store state has been reset.");
      this.clearSelectedElement();
    },

    fetchTestDataFromDatabase() {
      fetch(`http://localhost:4000/api/tests/get`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données.");
          }
          return response.json();
        })
        .then((data) => {
          console.log("📌 Test récupéré :", data);
          if(!data._id){
            console.error("⚠️ Avertissement : `_id` manquant dans les données récupérées.");
            return;
          }
          this.testData = { ...data };  // Synchronisez les données avec le store
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des données :", error);
        });
    },

    saveTestDataToDatabase: debounce(function () {
      //console.log("Sauvegarde des données :", JSON.stringify(this.testData, null, 2));
      // Validation des données avant l'envoi
      const validateData = (data) => {
        // Exclure les éléments ou pages marqués comme supprimés
        data.pages = data.pages.filter(page => !page.isDeleted);
        data.elements = data.elements.filter(el => !el.isDeleted);
      
        // Vérification des éléments spéciaux
        data.elements.forEach(element => {
          switch (element.el_Type) {
            case 'order':
              if (!element.labels) element.labels = [];
              if (!element.weight) element.weight = 0;
              break;
            case 'shortAnswer':
              if (!element.correctionAxes) element.correctionAxes = [];
              break;
            case 'textGaps':
              if (!element.gaps) element.gaps = [];
              if (!element.el_GapsedText) element.el_GapsedText = '';
              break;
          }
        });
        return data;
      };
    
      const validatedData = validateData(this.testData);
      //console.log("Données avant la sauvegarde :", JSON.stringify(validatedData, null, 2));
    
      return fetch(`http://localhost:4000/api/tests/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      })
      .then((response) => {
        if (!response.ok) throw new Error("Erreur de sauvegarde");
        return response.json();
      })
      .then((data) => {
       // console.log("Sauvegarde réussie :", data);
        return data;
      })
      .catch((error) => {
        console.error("Erreur de sauvegarde :", error);
        throw error;
      });
    }, 1000),
    

    updateTestData(updatedData) {
      // Vérification : Ne mettre à jour que si le contenu a changé
      const hasChanges = JSON.stringify(updatedData) !== JSON.stringify(this.testData);
    
      if (hasChanges) {
        this.testData = {
          ...this.testData,
          ...updatedData,
          metadata: {
            ...this.testData?.metadata,
            ...(updatedData.metadata || {}),
            //LastModif: new Date().toISOString() // Mettre à jour seulement si nécessaire
          },
          settings: {
            ...this.testData?.settings,
            ...(updatedData.settings || {})
          }
        };
    
        // Sauvegarde uniquement si les données ont changé
        this.saveTestDataToDatabase();
      }
    },

    saveTestData() {
      try {
        // Si vous utilisez une API pour la sauvegarde
        fetch(`http://localhost:4000/api/tests/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.testData),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Erreur lors de la sauvegarde.");
            }
            return response.json();
          })
          .then((data) => {
            //console.log("Sauvegarde réussie :", data);
          })
          .catch((error) => {
            console.error("Erreur de sauvegarde :", error);
          });

        // Sauvegarde dans localStorage en complément
        localStorage.setItem("testData", JSON.stringify(this.testData));
      } catch (error) {
        console.error(
          "Erreur lors de la sauvegarde dans localStorage :",
          error
        );
      }
    },
    setTestData(data) {
      this.testData = data;
    },
    getTestData() {
      return this.testData;
    },
    setCurrentTest(test) {
      this.resetState();
      this.currentTest = test;
      this.currentPage = null;
      this.currentElement = null;
    },
    setSelectedElement(element, label) {
      this.selectedElement = element;
      this.selectedElementLabel = label;
    },
    updateElementLabel(newLabel) {
      if (!this.testData || !this.selectedElement) return;

      // Update the label in pages.children immediately
      this.testData.pages.forEach((page) => {
        const child = page.children.find(
          (child) => child.id === this.selectedElement.el_ID
        );
        if (child) {
          child.label = newLabel;
        }
      });

      this.selectedElementLabel = newLabel;
      localStorage.setItem("testData", JSON.stringify(this.testData));
    },
    
    updateElement(updatedElement) {
      if (!this.testData) return;

      console.log(updatedElement)
    
      const elementIndex = this.testData.elements.findIndex(
        (el) => el.el_ID === updatedElement.el_ID
      );
    
      if (elementIndex !== -1) {
        const existingElement = this.testData.elements[elementIndex];
    
        // Définir des valeurs par défaut pour les champs manquants
        const defaultElement = {
          el_ID: "",
          el_Type: "",
          el_Text: "",
          el_RichText: "",
          options: [],
          multiple: false,
          maxScore: "0",
          feedback: {
            correct: "",
            incorrect: "",
          },
          gaps: [],
          el_GapsedText: "",
          labels: [],
          correctionAxes: [],
          tip: "",
          randomized: false,
          isNewElement: false,
          language: "en",
        };
    
        // Fusionner les valeurs par défaut, les données existantes et les mises à jour
        this.testData.elements[elementIndex] = {
          ...defaultElement,       // Valeurs par défaut
          ...existingElement,      // Données existantes
          ...updatedElement,       // Données mises à jour
        };
    
        //console.log("Élément après mise à jour :", JSON.stringify(this.testData.elements[elementIndex], null, 2));
      } else {
        console.warn("Élément non trouvé :", updatedElement.el_ID);
      }
    
      localStorage.setItem("testData", JSON.stringify(this.testData));
      this.saveTestDataToDatabase(); // Sauvegarder les modifications dans MongoDB
    }, 
    
    removeElement(el_ID) {
      if (!this.testData || !this.testData.pages || !this.testData.elements) {
        console.error("Test data or pages/elements are not initialized.");
        return;
      }
    
      // Supprimer l'élément de la liste globale des éléments
      const elementIndex = this.testData.elements.findIndex(el => el.el_ID === el_ID);
      if (elementIndex !== -1) {
        this.testData.elements.splice(elementIndex, 1);
        console.log(`Element with ID ${el_ID} removed from elements.`);
      } else {
        console.warn(`Element with ID ${el_ID} not found in elements.`);
      }
    
      // Supprimer les références de l'élément dans les pages
      this.testData.pages.forEach(page => {
        const initialLength = page.children.length;
        page.children = page.children.filter(child => child.id !== el_ID);
        if (page.children.length < initialLength) {
          console.log(`Element with ID ${el_ID} removed from page ${page.id}.`);
        }
      });
    
      // Sauvegarder les modifications dans localStorage
      localStorage.setItem("testData", JSON.stringify(this.testData));
    },    

    // Gestion des pages et des éléments
    addPage(newPage) {
      if (!this.testData || !this.testData.pages) {
        console.error("Test data or pages are not initialized.");
        return;
      }

      // Ajout de la nouvelle page
      this.testData.pages.push({
        ...newPage,
        Randomized: false,
      });

      // Sauvegarde dans localStorage pour persistance
      localStorage.setItem("testData", JSON.stringify(this.testData));
    },

    addElement(pageID, elementID, customData = null) {
      if (!this.testData || !this.testData.pages) {
        console.error("Test data or pages are not initialized.");
        return;
      }
    
      console.log(customData);

      // Ajout dans la page identifiée par pageID
      const page = this.testData.pages.find((p) => p.id === pageID);
      if (!page) {
        console.error(`Page with ID ${pageID} not found.`);
        return;
      }
    
      // Ajoute un enfant à la page
      const newChild = {
        id: elementID,
        label: "New Element", // Nom par défaut pour le child
      };
      page.children.push(newChild);
    
      // Création des données de l'élément avec des valeurs par défaut
      const defaultElement = {
        el_ID: elementID,
        el_Type: "default",
        el_Text: "A brand new question ?",
        el_RichText: "This is some instruction with Rich Text",
        options: [
          {
            id: "choice1" + elementID,
            text: "Choice 1",
            isCorrect: false,
          },
          {
            id: "choice2" + elementID,
            text: "Choice 2",
            isCorrect: true,
            weight: 1,
          },
        ],
        maxScore: "1",
        feedback: {
          correct: "Correct !",
          incorrect: "Incorrect",
        },
        tip: "This is a hint",
        isNewElement: false,
        labels: ["Label 1", "Label 2", "Label 3"],
      };
    
      // Fusion avec les données personnalisées si fournies
      const newElement = customData
        ? { ...defaultElement, ...customData }
        : defaultElement;
    
      // Initialisation du tableau global des éléments s'il n'existe pas
      if (!this.testData.elements) {
        this.testData.elements = [];
      }
    
      // Ajout de l'élément dans le tableau global
      this.testData.elements.push(newElement);
    
      // Sauvegarde dans localStorage
      localStorage.setItem("testData", JSON.stringify(this.testData));
    },
    

    deletePage(pageId) {
      if (!this.testData || !this.testData.pages) {
        console.error("Test data or pages are not initialized.");
        return;
      }

      // Supprime la page par ID
      this.testData.pages = this.testData.pages.filter(
        (page) => page.id !== pageId
      );

      // Sauvegarde dans localStorage pour persistance
      localStorage.setItem("testData", JSON.stringify(this.testData));
    },
    deleteElement(elementId) {
      console.log(elementId)
      if (!this.testData || !this.testData.pages) {
        console.error("Test data or pages are not initialized.");
        return;
      }

      // Parcourt toutes les pages pour trouver et supprimer l'élément
      this.testData.pages.forEach((page) => {
        page.children = page.children.filter((child) => child.id !== elementId);
      });

      // Supprimer également l'élément de la liste globale des éléments (si applicable)
      if (this.testData.elements) {
        this.testData.elements = this.testData.elements.filter(
          (el) => el.el_ID !== elementId
        );
      }

      // Sauvegarde dans localStorage
      localStorage.setItem("testData", JSON.stringify(this.testData));
    },
    clearSelectedElement() {
      this.selectedElement = null;
      this.selectedElementLabel = null;
    },
    updatePageOrder(pageId, newOrder) {
      const page = this.testData.pages.find((p) => p.id === pageId);
      if (page) {
        page.children = newOrder;
        localStorage.setItem("testData", JSON.stringify(this.testData)); // Sauvegarde dans localStorage
        this.saveTestDataToDatabase(); // Sauvegarde dans MongoDB
      }
    },
    deleteTestById(id) {
      console.log(`Suppression du test avec ID : ${id}`);
    
      // Vérifiez si l'ID correspond au test actuel
      if (this.testData.ID === id) {
        // Supprimer complètement les données locales
        this.testData = null; // Supprime l'objet test
    
        console.log(`Test avec ID ${id} supprimé du store.`);
    
        // Supprimer également du localStorage
        localStorage.removeItem("testData");
    
        console.log(`Test avec ID ${id} supprimé de localStorage.`);
      } else {
        console.error(`Test avec ID ${id} non trouvé dans les données locales.`);
      }
    }, 
    
    getElementPage(el_ID) {
      if (!this.testData || !this.testData.pages) {
        console.error("Test data or pages are not initialized.");
        return null;
      }
    
      // Parcourt toutes les pages pour trouver celle qui contient l'élément
      const page = this.testData.pages.find((page) =>
        page.children.some((child) => child.id === el_ID)
      );
    
      if (page) {
        return page; // Retourne la page si trouvée
      } else {
        console.warn(`Element with ID ${el_ID} not found in any page.`);
        return null; // Retourne null si l'élément n'est pas trouvé
      }
    },
   
    
    
    
  },

  
  getters: {
    getElementById: (state) => (id) => {
      if (!state.testData) return null;
      return state.testData.elements.find((el) => el.el_ID === id);
    },
    getElementLabel: (state) => (id) => {
      if (!state.testData) return null;
      let label = null;
      state.testData.pages.some((page) => {
        const child = page.children.find((child) => child.id === id);
        if (child) {
          label = child.label;
          return true;
        }
        return false;
      });
      return label;
    },
  }
});
