import { modifier } from 'ember-modifier';
import { validate } from 'ember-validity-modifier/utils/validate';

const commaSeperate = s => s.split(',').map(i => i.trim()).filter(Boolean);
const reduceValidators = async (validators, ...args) => {
  let errors = await Promise.all(validators.map(validator => validator(...args)));
  return errors.reduce((a, b) => [...a, ...b], []);
};

function getInput(element) {
  if (element.tagName === 'INPUT') {
    return element;
  }

  return element.querySelector('input');
}

export default modifier(function validity(
  element,
  validators,
  { on: eventNames = 'change,input,blur' }
) {
  let input = getInput(element);

  let autoValidationEvents = commaSeperate(eventNames);
  let autoValidationHandler = () => validate(input);
  let validateHandler = async () => {
    let [error = ''] = await reduceValidators(validators, input);
    input.checkValidity();
    input.setCustomValidity(error);
    input.dispatchEvent(new CustomEvent('validated'));
  };
  input.addEventListener('validate', validateHandler);
  autoValidationEvents.forEach(eventName => {
    input.addEventListener(eventName, autoValidationHandler);
  });
  return () => {
    input.removeEventListener('validate', validateHandler);
    autoValidationEvents.forEach(eventName => {
      input.removeEventListener(eventName, autoValidationHandler);
    });
  };
});
