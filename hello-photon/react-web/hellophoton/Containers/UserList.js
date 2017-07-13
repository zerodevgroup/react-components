import React from 'react';
import View from '../Components/View'
import Text from '../Components/Text'

class UserList extends React.Component {
  constructor () {
    super()
    this.state = {users: []}
  }

  componentDidMount () {
    let users = [
      {
        name : 'nest thermostat'
      },
      {
        name : 'drone'
      }
    ]
    this.setState({'users': users})

  }
  render() {
    return (
      <View>
      {
        this.state.users.map((user, index) => {
          return(
            <View key={index}>
              <Text>
                {user.name}
              </Text>
            </View>
          )
        })
      }
      </View>
    )
  }
}
export default UserList;
