import React from 'react';
import View from '../Components/View'
import Text from '../Components/Text'

class RoleList extends React.Component {
  constructor () {
    super()
    this.state = {roles: []}
  }

  componentDidMount () {
    let roles = [
      {
        name : 'nest thermostat'
      },
      {
        name : 'drone'
      }
    ]
    this.setState({'roles': roles})

  }
  render() {
    return (
      <View>
      {
        this.state.roles.map((role, index) => {
          return(
            <View key={index}>
              <Text>
                {role.name}
              </Text>
            </View>
          )
        })
      }
      </View>
    )
  }
}
export default RoleList;
