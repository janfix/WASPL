<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div  class="container-fluid">
            <a class="navbar-brand" href="#">WASPL</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link active testMode" aria-current="page" href="#">{{ testData.preset }} mode</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="#top">Test : {{ testData.title }} -
                          {{testData.metadata?.Institution}}</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#" @click.prevent="$emit('toggle-test-map')">Test Map <i class="fa-solid fa-caret-down"></i></a>
                    </li>

                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            Infos
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown" style="font-size: 0.8em;">
                            <li>Test_id:{{ testData._id }}</li>
                            <li>Modif: {{testData.metadata}}</li>
                             <!--<li>items: {{testData.elements.length}}</li>-->
                            <li>duration: {{testData.duration}}</li>
                            <li>Preset: {{testData.preset}}</li>
                            <li>Navigation: {{testData.navigation}}</li> 
                            <li></li>
                        </ul>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            Tools
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a class="dropdown-item" href="#">Calculator</a></li>
                            <li><a  class="dropdown-item disabled" href="#">GeoGebra</a></li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><a class="dropdown-item disabled" href="#">Dictionnary</a></li>
                        </ul>
                    </li>

                </ul>
                <a class="candidate" href="#">Remaining Time : {{ formattedTime || "00:00" }} <div class="spinner">⏳</div></a>


                <div class="dropdown text-end">
          <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle" id="dropdownUser1"
            data-bs-toggle="dropdown" aria-expanded="false">
            <img src="../../src/assets/student.png" alt="mdo" width="42" height="42" class="rounded-circle">
            {{ studentName }}
          </a>
          <ul class="dropdown-menu text-small" aria-labelledby="dropdownUser1" style="">

            <li><a class="dropdown-item" href="#" @click="handleLogout">Sign out</a></li>
          </ul>
        </div>

            </div>
        </div>
    </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { jwtDecode } from 'jwt-decode';

const props = defineProps({
    testData: {
        type: Object,
        required: true,
    },
    stopTimer: {
        type: Boolean,
        required: false,
        default: false,
    }
});

const studentName = ref("Student"); 
defineEmits(['toggle-test-map']);

const parseDuration = (durationStr) => {
    if (!durationStr) return 0;
    const parts = durationStr.split(":");
    if (parts.length === 2) {
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return parseInt(durationStr, 10) || 0;
};

const storageKey = ref("");
const remainingTime = ref(0);
let timerInterval = null;

const initializeTimer = () => {
    if (!props.testData || !props.testData._id || !props.testData.duration) return;
    storageKey.value = `remainingTime_${props.testData._id}`;
    const storedTime = localStorage.getItem(storageKey.value);
    const startTime = storedTime ? parseInt(storedTime, 10) : parseDuration(props.testData.duration);
    remainingTime.value = startTime;
    console.log("Start at:", startTime);

    if (!storedTime || parseInt(storedTime, 10) === 0) {
        localStorage.setItem(storageKey.value, parseDuration(props.testData.duration));
        remainingTime.value = parseDuration(props.testData.duration);
    }

    if (remainingTime.value > 0) {
        startCountdown();
    }
};

const startCountdown = () => {
    if (remainingTime.value > 0) {
        timerInterval = setInterval(() => {
            if (remainingTime.value > 0) {
                remainingTime.value -= 1;
                localStorage.setItem(storageKey.value, remainingTime.value);
            } else {
                clearInterval(timerInterval);
                localStorage.removeItem(storageKey.value);
            }
        }, 1000);
    }
};

const formattedTime = computed(() => {
    const minutes = Math.floor(remainingTime.value / 60);
    const seconds = remainingTime.value % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
});

onMounted(() => {
    initializeTimer();
    fetchStudentName();
});

watch(() => props.testData, () => {
    initializeTimer();
}, { deep: true });

const fetchStudentName = () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const decoded = jwtDecode(token);
        studentName.value = `${decoded.firstname} ${decoded.lastname}`;
    } catch (error) {
        console.error("Erreur lors du décodage du token :", error);
        studentName.value = "Student";
    }
};

const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
};

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
});
</script>






<style scoped>
.candidate {
    color: rgb(6, 75, 101);
    font-weight: bold;
    margin-right: 20px;
}

.testMode {
    font-weight: bold;
    color: darkred !important;
    font-variant: small-caps;
}

#navbarSupportedContent > ul > li.nav-item.dropdown > ul > li:nth-child(1) > a {
    margin:0 0px;
}

.spinner {
  display: inline-block;
  font-size: 1rem;
  animation: rotatePause 14s linear infinite; /* 4s de rotation + 10s de pause */
}

@keyframes rotatePause {
  0% {
    transform: rotate(0deg);
  }
  35.7% {
    transform: rotate(180deg);
  }
  50% {
    transform: rotate(180deg);
  }
  85.7% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(360deg);
  }
}



</style>