<template>
    <div v-if="selectedItem">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col">
                        <h1 class="card-title">{{ selectedItem.el_Label }} </h1>
                    </div>
                    <div class="col">
                        <span class="itemID"> ID : {{ selectedItem.el_ID }}</span>
                    </div>
                    <div class="col" style="text-align: right">
                        <h2><span class="badge mr-2 bg-Success"> {{ selectedItem.el_Type }}</span></h2>
                    </div>
                </div>
            </div>

            <div class="card-body">
                <div class="row">
                    <!-- Metadata -->
                    <div class="col">
                        <h2>Metadata</h2>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="author" v-model="formItem.metadata.author"
                                placeholder="Author" />
                            <label for="author">Author</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="institution"
                                v-model="formItem.metadata.institution" placeholder="Institution" />
                            <label for="institution">Institution</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="date" class="form-control" id="created" v-model="formItem.metadata.created"
                                placeholder="Created" />
                            <label for="created">Created</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="date" class="form-control" id="lastModification"
                                v-model="formItem.metadata.lastModif" placeholder="Last Modification" />
                            <label for="lastModification">Last Modification</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="createdFrom"
                                v-model="formItem.metadata.createdFrom" placeholder="Created From" />
                            <label for="createdFrom">Created From</label>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="col">
                        <h2>Content</h2>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="subject" v-model="formItem.metadata.subject"
                                placeholder="Subject" />
                            <label for="subject">Subject</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="domain" v-model="formItem.metadata.domain"
                                placeholder="Domain" />
                            <label for="domain">Domain</label>
                        </div>
                        <div class="form-floating mb-3">
                            <textarea class="form-control" id="taskDefinition" v-model="formItem.metadata.description"
                                placeholder="Task Definition" style="height: 100px"></textarea>
                            <label for="taskDefinition">Task Definition / Description</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="keywords" v-model="formItem.metadata.keywords"
                                placeholder="Keywords" />
                            <label for="keywords">Keywords</label>
                        </div>
                        <div class="form-floating mb-3">
                            <select class="form-select" id="gradeISCED" v-model="formItem.metadata.gradeISCED">
                                <option selected>Choose...</option>
                                <option value="Primary">Primary</option>
                                <option value="Secondary">Secondary</option>
                                <option value="Tertiary">Tertiary</option>
                            </select>
                            <label for="gradeISCED">Grade ISCED</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="framework" placeholder="Framework"
                                v-model="formItem.param.framework" />
                            <label for="framework">Framework</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="frameworkKey" placeholder="Framework Key"
                                v-model="formItem.param.frameworkKey" />
                            <label for="frameworkKey">Framework Key</label>
                        </div>
                        <div class="form-floating mb-3">
                            <select class="form-select" id="applicationBased" v-model="formItem.param.applicationBase">
                                <option selected>Choose...</option>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                            <label for="applicationBased">Application Based</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="complementaryTools"
                                placeholder="Complementary Tools" v-model="formItem.param.complementaryTools" />
                            <label for="complementaryTools">Complementary Tools</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="stimulusReferences"
                                placeholder="Stimulus References" v-model="formItem.param.stimulusReferences" />
                            <label for="stimulusReferences">Stimulus References</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="license" placeholder="license"
                                v-model="formItem.metadata.license" />
                            <label for="license">License</label>
                        </div>
                    </div>



                    <!-- Localisation -->
                    <div class="col">
                        <h2>Localisation</h2>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="country" v-model="formItem.metadata.country"
                                placeholder="Country" />
                            <label for="country">Country</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="originalLanguage"
                                v-model="formItem.metadata.originalLanguage" placeholder="Original Language" />
                            <label for="originalLanguage">Original Language</label>
                        </div>
                        <div class="form-floating mb-3">
                            <textarea class="form-control" id="translations" v-model="formItem.metadata.translations"
                                placeholder="Translations" style="height: 100px"></textarea>
                            <label for="translations">Translations</label>
                        </div>
                        <div class="form-floating mb-3">
                            <select class="form-select" id="multilingualItem"
                                v-model="formItem.metadata.multilingualItem">
                                <option selected>Choose...</option>
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                            <label for="multilingualItem">Multilingual Item</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card-footer">
                <button type="button" class="btn btn-primary" @click="updateItem">
                    Update Item complementary data
                </button>
            </div>
        </div>
    </div>
    <div v-else>
        <p>Select an item from the table to view details.</p>
    </div>
</template>


<script setup>
import { ref, watch } from "vue";
import axios from "axios";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Définir les props
const props = defineProps({
    selectedItem: {
        type: Object,
        default: () => null,
    },
});

// Créer une copie réactive de selectedItem
const formItem = ref({});

// Surveiller les changements dans selectedItem
watch(
    () => props.selectedItem,
    (newItem) => {
        if (newItem) {
            formItem.value = {
                ...newItem,
                metadata: {
                    author: newItem.metadata?.author || "",
                    institution: newItem.metadata?.institution || "",
                    created: newItem.metadata?.created || "",
                    lastModif: newItem.metadata?.lastModif || "",
                    createdFrom: newItem.metadata?.createdFrom || "",
                    subject: newItem.metadata?.subject || "",
                    domain: newItem.metadata?.domain || "",
                    description:newItem.metadata?.description || "",
                    keywords:newItem.metadata?.keywords || "",
                    gradeISCED:newItem.metadata?.gradeISCED || "",
                    country: newItem.metadata?.country || "",
                    originalLanguage: newItem.metadata?.originalLanguage || "",
                    translations: newItem.metadata?.translations || "",
                    multilingualItem: newItem.metadata?.multilingualItem || "false",
                    license: newItem.metadata?.license || "",

                },
                param: {
                    stimulusReferences: newItem.param?.stimulusReferences || "",
                    complementaryTools: newItem.param?.complementaryTools || "",
                    applicationBase: newItem.param?.applicationBase || "No",
                    frameworkKey: newItem.param?.frameworkKey || "",
                    framework: newItem.param?.framework || "",
                }
            };
        } else {
            formItem.value = {}; // Réinitialiser formItem si selectedItem est null
        }
    },
    { immediate: true }
);

// Fonction pour mettre à jour l'élément dans la base de données
const updateItem = async () => {
  try {
    // Nettoyer les données avant l'envoi (si nécessaire)
    const cleanedData = {
      ...formItem.value,
      metadata: {
        ...formItem.value.metadata,
        author: formItem.value.metadata.author || "",
        institution: formItem.value.metadata.institution || "",
        created: formItem.value.metadata.created || "",
        lastModif: formItem.value.metadata.lastModif || "",
        createdFrom: formItem.value.metadata.createdFrom || "",
        subject: formItem.value.metadata.subject || "",
        domain: formItem.value.metadata.domain || "",
        description: formItem.value.metadata.description || "",
        keywords: formItem.value.metadata.keywords || "",
        gradeISCED: formItem.value.metadata.gradeISCED || "",
        country:formItem.value.metadata.country || "",
        originalLanguage:formItem.value.metadata.originalLanguage || "",
        translations:formItem.value.metadata.translations || "",
        multilingualItem:formItem.value.metadata.multilingualItem || "false",
        license:formItem.value.metadata.license || "",
      },
      param: {
        ...formItem.value.param,
        framework: formItem.value.param.framework || "",
        frameworkKey: formItem.value.param.frameworkKey || "",
        applicationBase: formItem.value.param.applicationBase || "No",
        complementaryTools: formItem.value.param.complementaryTools || "",
        stimulusReferences: formItem.value.param.stimulusReferences || "",
      },
    };

    console.log("Data sent to the server:", cleanedData);

    // Effectuer la requête PUT avec Axios
    const response = await axios.put(
      `${VITE_API_BASE_URL}/api/items/${formItem.value._id}`,
      cleanedData
    );

    console.log("Item updated successfully:", response.data);
    alert("Item updated successfully!");
  } catch (error) {
    console.error("Error updating item:", error.response?.data || error.message);
    alert("Failed to update the item. Please try again.");
  }
};

</script>




<style scoped>
h1 {
    text-transform: capitalize;
    font-size: 1.5rem;
    font-weight: bold;
}

h2 {
    font-size: 1.25rem;
    font-weight: bold;
}

.mr-2 {
    margin-right: 0.5rem;
}

.itemID {

    font-size: 1rem;
    margin-left: 0.5rem;
}

.bg-Success {
    background-color: #81aaf5;
}
</style>