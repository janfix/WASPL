<template>
  <div class="countdown-timer">
    <div v-if="timeRemaining > 0">
      {{ formattedTime }}
      <div class="lasting">Time Left</div>
    </div>
    <div v-else>
      <div class="lasting">Times Up !</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed,watch } from 'vue';

const emit = defineEmits(['time-up']);

const props = defineProps({
  duration: {
    type: String, // La durée est reçue comme chaîne
    required: true,
  },
  stopTimer: {
    type: Boolean, // Nouvelle prop pour arrêter le timer
    default: false,
  },
});

const timeRemaining = ref(parseInt(props.duration, 10) * 60); // Convertit la durée en secondes
let timer = null;

// Formatte le temps en minutes et secondes
const formattedTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60);
  const seconds = timeRemaining.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Décompte du temps
function startCountdown() {
  timer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      clearInterval(timer);
      emit('time-up'); // Émet un événement lorsque le temps est écoulé
    }
  }, 1000);
}

// Arrête le timer si `stopTimer` change
watch(
  () => props.stopTimer,
  (newVal) => {
    if (newVal && timer) {
      clearInterval(timer);
    }
  }
);

// Nettoie l'intervalle lorsque le composant est détruit
onMounted(() => {
  startCountdown();
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.countdown-timer {
  border : 1px gainsboro solid;
  border-radius: 5px;
  font-weight: bold;
  color: tomato;
  text-align: center;
  font-size: clamp(1rem, 3vw, 3.5rem);
}

.countdown-timer .lasting{
  font-size: 0.8rem!important;
  color: darkgrey!important;
}
</style>
