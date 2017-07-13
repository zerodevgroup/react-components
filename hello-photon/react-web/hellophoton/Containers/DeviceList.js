import React from 'react';
import View from '../Components/View'
import Text from '../Components/Text'

class DeviceList extends React.Component {
  constructor () {
    super()
    this.state = {devices: []}
  }

  componentDidMount () {
    let devices = [
      {
        name : 'nest thermostat'
      },
      {
        name : 'drone'
      }
    ]
    this.setState({'devices': devices})

  }
  render() {
    return (
      <View>
      {
        this.state.devices.map((device, index) => {
          return(
            <View key={index}>
              <Text>
                {device.name}
              </Text>
            </View>
          )
        })
      }
      </View>
    )
  }
}
export default DeviceList;
