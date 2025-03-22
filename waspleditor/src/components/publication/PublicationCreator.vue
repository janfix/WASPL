<template>
    <div>
        <div class="row">
            <div v-if="groups.length === 0 && !loading" class="alert alert-warning">
                No groups found. Please check your configuration or add groups.
            </div>
            <div class="col">
                <div class="form-floating mb-3">
                    <input type="text" class="form-control" id="publicationName" placeholder="Publication Name">
                    <label for="publicationName" style="margin-left:10px">Publication Name</label>
                </div>
            </div>
            <div class="col">
                <div class="form-floating">
                    <select class="form-select" v-model="selectedTest" id="TestSelect">
                        <option value="" disabled selected>Select a test in the list</option>
                        <option v-for="test in tests" :key="test._id" :value="test._id">
                            {{ test.title }}
                        </option>
                    </select>
                    <label for="TestSelect">Select a test</label>
                </div>

            </div>
        </div>

        <div class="row">
            <div class="col">
                <div class="form-floating">
                    <select class="form-select" v-model="selectedGroup" id="GroupSelect">
                        <option value="" disabled selected>Open this select menu</option>
                        <option v-for="group in groups" :key="group._id" :value="group._id">
                            {{ group.groupName }}
                        </option>
                    </select>
                    <label for="GroupSelect">Select a Group</label>
                </div>
            </div>
            <!--  <div class="col"><button type="button" class="btn btn-warning mt-2">Add to target</button></div> -->
        </div>
        <!-- <div class="row mt-3 p-3">
            <div class="col targetDefinition">
                <span>Target Definition:</span>
                <div class="row">
                    <div class="col-10">
                        <div class="card card-body mt-2">Group 1 with Info </div>
                    </div>
                    <div class="col-2">
                        <button type="button" class="btn btn-danger mt-3">Remove</button>
                    </div>
                </div>

                <div class="row">
                    <div class="col-10">
                        <div class="card card-body mt-2">Group 2 with other Info </div>
                    </div>
                    <div class="col-2">
                        <button type="button" class="btn btn-danger mt-3">Remove</button>
                    </div>
                </div>
            </div>

        </div> -->

        <div class="row mt-3 ">
            <div class="col">
                <div class="mb-3">
                    <div class="form-floating mb-3">
                        <input type="date" class="form-control" id="startingDate" />
                        <label for="startingDate" class="form-label">Starting Date</label>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="mb-3">
                    <div class="form-floating mb-3">
                        <input type="date" class="form-control" id="endDate" />
                        <label for="endDate" class="form-label">End Date</label>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="mb-3">
                    <div class="form-floating">
                        <select class="form-select" id="access">
                            <option value="unique">Unique</option>
                            <option value="multiple">Multiple</option>
                        </select>
                        <label for="access" class="form-label">Access</label>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mb-4">
            <div class="form-floating">
                <textarea class="form-control" placeholder="Add some important details" id="PubDescription"></textarea>
                <label style="margin-left:10px" for="PubDescription">Description</label>
            </div>
        </div>
        <div class="row mb-4">
            <div class="col-2">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="StudentReport">
                    <label class="form-check-label" for="StudentReport">
                        Student Report
                    </label>
                </div>
            </div>
            <div class="col-2">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="GroupReport">
                    <label class="form-check-label" for="GroupReport">
                        Group Report
                    </label>
                </div>
            </div>
            
            <div class="col-2">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="StatisticReport" checked>
                    <label class="form-check-label" for="StatisticReport">
                        Statistic Report
                    </label>
                </div>
            </div>
        </div>
        <button class="btn btn-primary mb-4" @click="submitForm">Add a new Publication</button>
    </div>

</template>

<script>
import axios from 'axios';



export default {
    data() {
        return {
            tests: [], // Liste des tests
            groups: [], // Liste des groupes
            selectedTest: null,
            selectedGroup: null,
        };
    },
    async created() {
        const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        try {
            // Récupérer les tests
            const testResponse = await axios.get(`${VITE_API_BASE_URL}/api/tests/list`);
            //console.log('Tests:', testResponse.data);
            this.tests = testResponse.data;

            // Récupérer les groupes
            const response = await axios.get(`${VITE_API_BASE_URL}/api/groups/list`);
            //console.log('Groups:', response.data);
            this.groups = response.data;
        } catch (error) {
            console.error('Failed to fetch tests or groups', error);
        }
    },
    methods: {
        async submitForm() {
    const publicationData = {
        publicationName: document.getElementById('publicationName').value,
        testId: this.selectedTest,
        groupId: this.selectedGroup,
        startingDate: document.getElementById('startingDate').value,
        endDate: document.getElementById('endDate').value,
        access: document.getElementById('access').value,
        description: document.getElementById('PubDescription').value,
        attempts: 0,
        reports: {
            studentReport: document.getElementById('StudentReport').checked,
            groupReport: document.getElementById('GroupReport').checked,
            statisticReport: document.getElementById('StatisticReport').checked,
        },
    };

    try {
        console.log(publicationData)
        const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.post(`${VITE_API_BASE_URL}/api/publications`, publicationData); // URL complète
        alert('Publication added successfully');
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Failed to add publication', error.response?.data || error.message);
    }
},

    },
};
</script>



<style scoped></style>