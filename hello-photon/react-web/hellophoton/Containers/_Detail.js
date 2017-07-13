import React from 'react';
class DeviceDetail extends React.Component {
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
export default DeviceDetail;
