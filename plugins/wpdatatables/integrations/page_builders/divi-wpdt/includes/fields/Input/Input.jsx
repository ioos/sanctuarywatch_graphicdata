// External Dependencies
import React, { Component } from 'react';

// Internal Dependencies
import './style.css';

class Input extends Component {

  static slug = 'divi_input';
  mount = false;

  /**
   * Handle input value change.
   *
   * @param {object} event
   */
  _onChange = (event) => {
    this.props._onChange(this.props.name, event.target.value);
  }

  constructor (props) {
    super(props)
    if (this.mount) {
      this.state = {}
    }
  }

  componentDidMount () {
    this.mount = true
    if (this.props.name === 'id') {
        //AJAX
    }
  }

  componentWillUnmount () {
    this.mount = false
  }

  render() {
    return(
        <div>
        </div>
    );
  }
}

export default Input;
