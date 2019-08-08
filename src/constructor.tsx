import * as React from 'react';
import {render} from 'react-dom';

// import {elements} from 'fform/src/fform';

import MainView from './constrView';

import './tacit/main.scss';
import 'fform/addons/styling/fform.css';
import './styles.scss';

if (typeof window != 'undefined') {
  const container = document.querySelector('#root');

  render(<div>
    <h3>FForm constructor</h3>
    <MainView/>
  </div>, container);
}
