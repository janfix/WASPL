import { InteractionInterface } from './InteractionInterface';
import OrderRender from '../components/interactions/OrderRender.vue';

export class OrderInteraction extends InteractionInterface {
  constructor(question,testData) {
    super(question);
    this.testData = testData;
    this.userAnswer = '';
  }



   render() {
        return {
          component:OrderRender ,
          props: {
            question: this.question,
            testData: this.testData, // Passe testData ici
          },
        };
      }

  restoreAnswer() {
    // Les messages n'ont pas de réponse à restaurer
  }

  calculateScore() {
    // Les messages ne contribuent pas au score
    return 0;
  }

  saveAnswer() {
    // Les messages n'ont pas de réponse à sauvegarder
    return null;
  }
}