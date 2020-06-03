import React from 'react';
import { Text, View, Button, Vibration, Platform } from 'react-native';
import { Notifications, Device } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import axios from 'axios';

export default class AppContainer extends React.Component {
  state = {
    expoPushToken: '',
    notification: {},
    mantra: '',
  };

  registerForPushNotificationsAsync = async () => {
    if (
      (Platform.OS === 'android' || Platform.OS === 'ios') &&
      Constants.isDevice
    ) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = await Notifications.getExpoPushTokenAsync();
      console.log(token, 'this is the token');
      this.setState({ expoPushToken: token });
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('default', {
        name: 'default',
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
      });
    }
  };

  componentDidMount() {
    this.registerForPushNotificationsAsync();
    this.callMantras();

    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
    // Notifications.scheduleLocalNotificationAsync(
    //   { title: 'the title', body: 'this isthe body' },
    //   { time: new Date().getTime() + 1000, repeat: 'minute' }
    // );
  }

  callMantras = async () => {
    const mantra = await axios
      .get('https://help-for-heroes.herokuapp.com/mantras')
      .then((response) => {
        return response.data;
      });

    this.setState({ mantra: mantra });
  };

  setNotificationTimer = () => {
    Notifications.scheduleLocalNotificationAsync(
      { title: 'the title', body: this.filterMantra(this.state.mantra) },
      { time: new Date().getTime() + 1000 }
    );
  };

  cancelNotificationTimers = () => {
    Notifications.cancelAllScheduledNotificationsAsync();
  };

  _handleNotification = (notification) => {
    Vibration.vibrate();
    console.log(notification), 'this is the notification';
    this.setState({ notification: notification });
  };

  filterMantra = (array) => {
    let rand = Math.random();
    let arrayLength = array.length;
    let randIndex = Math.floor(rand * arrayLength);
    let randomMantra = array[randIndex].mantra;
    return randomMantra;
  };

  // Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/dashboard/notifications
  sendPushNotification = async () => {
    // const realMantra = this.filterMantra(this.state.mantra);
    const message = {
      owner: 'me',
      slug: 'this is the slugg',
      to: this.state.expoPushToken,
      sound: 'default',
      title: 'Mantra Reminder',
      body: this.filterMantra(this.state.mantra),
      data: { data: 'goes here' },
      _displayInForeground: true,
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text>Origin: {this.state.notification.origin}</Text>
          <Text>Data: {JSON.stringify(this.state.notification.data)}</Text>
        </View>
        <Button
          title={'Send me a Random Mantra'}
          onPress={() => this.sendPushNotification()}
        />
        <Button
          title={'console.log the state'}
          onPress={() => console.log(this.state.mantra, 'state button press')}
        />
        <Button
          title={'Set a time fo a mantra'}
          onPress={() => this.setNotificationTimer()}
        />
        <Button
          title={'Cancel all my notifications'}
          onPress={() => this.cancelNotificationTimers()}
        />
      </View>
    );
  }
}
