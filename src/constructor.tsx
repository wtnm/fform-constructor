import * as React from 'react';
import {render} from 'react-dom';

import {elements} from 'fform/src/fform';

// import {FFormSchema, constrElements} from './FFEditor';

// import FFView from './FFView';

//import constrSchema from './constrSchema';
// import constrObj from './constrLib';
// import * as styling from 'fform/addons/styles.json';

import MainView from './constrView';

import './tacit/main.scss';
import './styles.scss';


// const editFormElements = elements.extend([styling, constrObj]);
// const getObjects = () => editFormElements;

if (typeof window != 'undefined') {
  const container = document.querySelector('#root');


  render(<div>
    <h3>FForm constructor</h3>
    <MainView/>
  </div>, container);
}

// export {getObjects}