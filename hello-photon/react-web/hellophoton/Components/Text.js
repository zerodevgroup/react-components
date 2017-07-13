import React from 'react';
class Text extends React.Component {
  constructor () {
    super()
  }
  render() {
    return (
      <div style={this.props.style}>
        {this.props.children}
      </div>
    )
  }
}
export default Text;
