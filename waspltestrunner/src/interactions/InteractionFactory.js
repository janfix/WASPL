import { ChoiceInteraction } from "./ChoiceInteraction";
import { ShortAnswerInteraction } from "./ShortAnswerInteraction";
import { MessageInteraction } from "./MessageInteraction";
import { OrderInteraction } from "./OrderInteraction";
import { TextGapsInteraction } from "./TextGapsInteraction";
// Importez d'autres interactions ici

export function createInteraction(question, testData) {
  switch (question.el_Type) {
    case "choice":
      return new ChoiceInteraction(question, testData);
    case "shortAnswer":
      return new ShortAnswerInteraction(question, testData);
    case "message":
      return new MessageInteraction(question, testData);
    case "order":
      return new OrderInteraction(question, testData);
    case "textGaps":
      return new TextGapsInteraction(question, testData);
    // Ajoutez d'autres cas pour textGaps, order
    default:
      throw new Error(`Unknown interaction type: ${question.el_Type}`);
  }
}
