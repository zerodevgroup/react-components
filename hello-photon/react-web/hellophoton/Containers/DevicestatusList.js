import React from 'react';
import View from '../Components/View'
import Text from '../Components/Text'

class DevicestatusList extends React.Component {
  constructor () {
    super()
    this.state = {devicestatuses: []}
  }

  componentDidMount () {
    let devicestatuses = [
      {
        name : 'nest thermostat'
      },
      {
        name : 'drone'
      }
    ]
    this.setState({'devicestatuses': devicestatuses})

  }
  render() {
    return (
      <View>
      {
        this.state.devicestatuses.map((devicestatus, index) => {
          return(
            <View key={index}>
              <Text>
                {devicestatus.name}
              </Text>
            </View>
          )
        })
      }
      </View>
    )
  }
}
export default DevicestatusList;
