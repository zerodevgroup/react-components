import React from 'react';
import DeviceList from './Containers/DeviceList'
import DevicestatusList from './Containers/DevicestatusList'
import DevicetypeList from './Containers/DevicetypeList'
import RoleList from './Containers/RoleList'
import UserList from './Containers/UserList'
class App extends React.Component {
  render() {
    return (
      <div>
        <DeviceList/>
        <DevicestatusList/>
        <DevicetypeList/>
        <RoleList/>
        <UserList/>
      </div>
    )
  }
}
export default App;
