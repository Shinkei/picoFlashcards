/*
Flash card
- una tarjeta tiene dos lados, uno contiene la pregunta y 
  el lado opuesto la respues a la pregunta
- deben existir dos modos: el de edición de tarjetas y el de estudio
  y el modo por defecto es el de estudio
- en el modo de edicion:
    - se pueden agregar tarjetas
    - se pueden eliminar tarjetas
    - se pueden editar tarjetas
    - se pueden ver todas las tarjetas
- en el modo de estudio:
    - se deben mostrar cuantas tarjetas existen
    - se deben mostrar cuantas tarjetas cuantas han pasado
    - se debe pasar aleatoriamente por todas las tarjetas
    - se debe poder ver la respuesta a una pregunta o continuar
      sin darle la vuelta
    - se debe poder reiniciar el modo de estudio
    
*/

const {h, patch} = picodom;


function Component (_parent) {
  let element, oldNode;
  const parent = _parent;
  
  this.render = (newNode) =>{
    return element = patch(
      parent,
      element,
      oldNode,
      oldNode = newNode
    );
  };     
}

//--------------------------------------------

const store = (function(){
    
  function createCard (q, a){
    if (typeof q !== 'string' || typeof a !== 'string') {
      return;
    }
    return {
      question: q,
      answer: a,
      open: false
    };
  }
  // state es la lista de cartas y el valor por defecto es la lista vacia
  const cards = []; // ESTADO BASE
  const reducerCards = (state=cards, action) => {
    switch (action.type) {
      case 'ADD_CARD':
        const newCard = createCard(action.question, action.answer)
        return [newCard].concat(state); // card se convierte a un arreglo y se agrega los anteriores al final 
      case 'OPEN':
        const currentCard = state[action.index];
        state.splice(action.index, 1, Object.assign({}, currentCard, {open: true}));
        return state;
      default:
        return state;
    }
  }
  
  const nav = {
    positions: [],
    index: 0,
    cardCount: 0,
    hasNext: false
  }; // ESTADO BASE
  const reducerNav = (state=nav, action) => {
    switch (action.type) {
      case 'NEXT_CARD':
        const nextIndex = state.index + 1;
        if(nextIndex >= state.positions.length){
          return Object.assign({}, state, {hasNext: false});
        }
        return Object.assign({}, state, {index: nextIndex}); // si los hijos son objetos o arreglos los copia como referencia
      case 'START':
      case 'RESET':
        const count = state.cardCount;
        const newPositions = Object.keys(Array.from(new Array(count))).sort(() => (Math.random() * count >> 0) - 1);
        return Object.assign({}, state, {positions: newPositions, index: 0, hasNext: true});
      case 'ADD_CARD':
        const newCount = state.cardCount + 1;
        return Object.assign({}, state, {cardCount: newCount});
      default:
        return state
    }
  }

  return Redux.createStore(Redux.combineReducers({nav: reducerNav, cards: reducerCards}));
}())



//----------------------------------------------
const container = document.getElementById('content');

const changeMode = new Component(container);

changeMode.render(h("button", {
  onclick: () => console.log("cambiando a edicion")
}, "Editar"));

const modeContainer = new Component(container);

const showAnswer = () => {
  const {index} = store.getState().nav;
  store.dispatch({type: 'OPEN', index: index});
}

const nextCard = () => {
  store.dispatch({type: 'NEXT_CARD'});
}

const card = h('div', null, [
  h('div', {id:'question'}),
  h('div', {id:'answer'}),
  h('button',{onclick: showAnswer} , 'view Answer')
]);


const studyMode = h('div', null, [
  h('div', {class: 'nav-container'}, [
    h('span', {id: 'indexCard'}),
    '/',
    h('span', {id: 'cardCount'})
  ]),
  card,
  h('div', {id: 'nextButton'})
]);

modeContainer.render(studyMode);


const cardCount = new Component(document.getElementById('cardCount'));
const indexCard = new Component(document.getElementById('indexCard'));
const nextButton = new Component(document.getElementById('nextButton'));
const questionE = new Component(document.getElementById('question'));
const answerE = new Component(document.getElementById('answer'));

//----------------------------------------------

store.subscribe(() => {
//   debugger;
  const {cards, nav} = store.getState()
  cardCount.render(h('span', null, nav.cardCount));
  indexCard.render(h('span', null, 1 + nav.index));
  nextButton.render(h('button', {disabled: !nav.hasNext, onclick: nextCard}, 'next'));
  const {question, answer, open} = cards[nav.index];
  questionE.render(h('span', {class: open && 'hidden' }, question));
  answerE.render(h('span',{class: open || 'hidden'}, answer));
})


store.dispatch({
  question: 'a?',
  answer: 'a´',
  type: 'ADD_CARD'
});

store.dispatch({
  question: 'b?',
  answer: 'b´',
  type: 'ADD_CARD'
});

store.dispatch({type: 'START'});
// store.dispatch({type: 'NEXT_CARD'});



