import React, { PropTypes } from 'react'
import { View, Text } from 'react-native'
import styles from './HomeStyles'

export default class Home extends React.Component {
  static defaultProps = { show: true }

  static propTypes = {
    title: PropTypes.string,
    icon: PropTypes.string,
    style: PropTypes.object,
    show: PropTypes.bool
  }

  render () {
    <View>
      <Text>Hello Home!</Text>
    </View>
  }
}
