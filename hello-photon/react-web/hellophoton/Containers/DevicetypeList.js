import React from 'react';
import View from '../Components/View'
import Text from '../Components/Text'

class DevicetypeList extends React.Component {
  constructor () {
    super()
    this.state = {devicetypes: []}
  }

  componentDidMount () {
    let devicetypes = [
      {
        name : 'nest thermostat'
      },
      {
        name : 'drone'
      }
    ]
    this.setState({'devicetypes': devicetypes})

  }
  render() {
    return (
      <View>
      {
        this.state.devicetypes.map((devicetype, index) => {
          return(
            <View key={index}>
              <Text>
                {devicetype.name}
              </Text>
            </View>
          )
        })
      }
      </View>
    )
  }
}
export default DevicetypeList;
