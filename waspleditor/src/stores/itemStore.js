import { defineStore } from "pinia";
import axios from "axios";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export const useItemStore = defineStore("item", {
  state: () => ({
    elements: {
      el_ID: "",
      el_label: "",
      el_type: "",
      el_Text: "",
      el_RichText: "",
      options: [],
      gaps: [],
      labels: [],
      correctionAxes: [],
      el_GapsedText: "",
      maxScore: "",
      feedback: {
        correct: "",
        incorrect: "",
      },
      tip: "",
      randomized: false,
      isNewElement: false,
      language: "",
      weight: 1,
      el_version: "",
      el_language: "",
      el_description: "",
      el_subject: "",
      el_location: "",
      el_level: "",
      el_domain: "",
      el_duration: "",
      el_keywords: [],
      metadata: {
        Author: "",
        Created: "",
        LastModif: "",
      },
      param: {}, // Nouvel objet
      reportOption: {}, // Nouvel objet
    },
    selectedElement: null,
    selectedElementLabel: null,
  }),

  actions: {
    resetState() {
      this.selectedElement = null;
      this.selectedElementLabel = null;
      this.currentPage = null;
      this.currentitem = null;
      //console.log("Store state has been reset.");
      
    },
    async saveItem(element) { //CREATE An ITEM 
      try {
        //const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
        const apiBaseUrl =  "http://localhost:4000";
        console.log(apiBaseUrl)
        const response = await axios.post(`${apiBaseUrl}/api/items`, element);
        console.log("Element saved:", response.data);
      } catch (error) {
        console.error("Failed to save element:", error);
      }
    },
    async deleteItem(id) {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
        await axios.delete(`${apiBaseUrl}/api/items/${id}`);
        console.log(`Element with ID ${id} deleted successfully.`);
        
        
      } catch (error) {
        console.error(`Failed to delete element with ID ${id}:`, error);
      }
    },
    async updateItem(id, updatedData) {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
        const response = await axios.put(`${apiBaseUrl}/api/items/${id}`, updatedData);
        console.log(`Element with ID ${id} updated successfully:`, response.data);
    
        // Mettre à jour localement si nécessaire
        if (this.elements[id]) {
          this.elements[id] = response.data.updatedItem || updatedData;
        }
      } catch (error) {
        console.error(`Failed to update element with ID ${id}:`, error);
      }
    },
  },

  getters: {
    getElementById: (state) => (id) => {
      if (!state.itemBank) return null;
      return state.itemBank.elements.find((el) => el.el_ID === id);
    },
  },
});
