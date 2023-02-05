import messaging, { FirebaseMessagingTypes } from "@react-native-firebase/messaging"
import * as React from "react"
import { useEffect } from "react"
import { AppState, AppStateStatus } from "react-native"

import { logEnterBackground, logEnterForeground } from "@app/utils/analytics"
import PushNotification from "react-native-push-notification"

import { hasNotificationPermission, useAddDeviceToken } from "../utils/notifications"
import PushNotificationIOS from "@react-native-community/push-notification-ios"
import { useIsAuthed } from "@app/graphql/is-authed-context"

// TODO:
// replace PushNotificationIOS and PushNotification (both deprecated?) with
// https://wix.github.io/react-native-notifications
// although react-native-notifications might have issue with 0.71

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister(token) {
    console.debug("TOKEN:", token)
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification(notification) {
    console.debug("NOTIFICATION:", notification)

    // process the notification

    // (required) Called when a remote is received or opened, or local notification is opened
    notification.finish(PushNotificationIOS.FetchResult.NoData)
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction(notification) {
    console.debug("ACTION:", notification.action)
    console.debug("NOTIFICATION:", notification)

    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError(err) {
    console.error(`onRegistration error: ${err.message}`, err)
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: false,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: false,
})

export const NotificationWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const isAuthed = useIsAuthed()

  const appState = React.useRef(AppState.currentState)

  const handleAppStateChange = React.useCallback(async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/background/) && nextAppState === "active") {
      console.info("App has come to the foreground!")
      logEnterForeground()
    }

    if (appState.current.match(/active/) && nextAppState === "background") {
      logEnterBackground()
    }

    appState.current = nextAppState
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => subscription.remove()
  }, [handleAppStateChange])

  const showNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    const soundName = undefined
    if (remoteMessage.notification?.body) {
      PushNotification.localNotification({
        /* Android Only Properties */
        ticker: "My Notification Ticker", // (optional)
        autoCancel: true, // (optional) default: true
        largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
        smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
        // bigText: 'My big text that will be shown when notification is expanded', // (optional) default: "message" prop
        // subText: 'This is a subText', // (optional) default: none
        // color: 'red', // (optional) default: system default
        vibrate: true, // (optional) default: true
        vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
        tag: "some_tag", // (optional) add tag to message
        group: "group", // (optional) add group to message
        ongoing: false, // (optional) set whether this is an "ongoing" notification
        // actions: ['Yes', 'No'], // (Android only) See the doc for notification actions to know more
        // invokeApp: true, // (optional) This enable click on actions to bring back the application to foreground or stay in background, default: true

        /* iOS only properties */
        // alertAction: "view", // (optional) default: view
        category: "", // (optional) default: empty string

        /* iOS and Android properties */
        // id: this.lastId, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
        title: remoteMessage.notification?.title, // (optional)
        message: remoteMessage.notification?.body, // (required)
        userInfo: { screen: "home" }, // (optional) default: {} (using null throws a JSON value '<null>' error)
        playSound: Boolean(soundName), // (optional) default: true
        soundName: soundName || "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
        // number: 18, // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero) --> badge
      })
    }
  }

  // TODO: need to add isHeadless?
  // https://rnfirebase.io/messaging/usage

  // TODO: check whether react-native-push-notification can give a FCM token
  // for iOS, which would remove the need for firebase.messaging() dependency
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.debug("onMessage")
      showNotification(remoteMessage)
    })

    return unsubscribe
  }, [])

  // useEffect(() => {
  // const isDeviceRegisteredForRemoteMessages = messaging().isDeviceRegisteredForRemoteMessages
  // Alert.alert(`isDeviceRegisteredForRemoteMessages: ${isDeviceRegisteredForRemoteMessages ? true:false}`)
  // const isAutoInitEnabled = messaging().isAutoInitEnabled
  // Alert.alert(`isAutoInitEnabled: ${isAutoInitEnabled ? true:false}`) // true
  // }, []);

  useEffect(() => {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.debug("background arrived from setBackgroundMessageHandler")
      showNotification(remoteMessage)
    })
  }, [])

  useEffect(() => {
    // onNotificationOpenedApp: When the application is running, but in the background.
    messaging().onNotificationOpenedApp((_remoteMessage) => {
      // console.log(
      //   'Notification caused app to open from background state:',
      //   remoteMessage.notification,
      // );
      // navigation.navigate(remoteMessage.data.type);
    })

    // getInitialNotification: When the application is opened from a quit state.
    messaging()
      .getInitialNotification()
      .then((_remoteMessage) => {
        // if (remoteMessage) {
        //   console.log(
        //     'Notification caused app to open from quit state:',
        //     remoteMessage.notification,
        //   );
        //   setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
        // }
        // setLoading(false);
      })
  }, [])

  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await hasNotificationPermission()
      if (hasPermission) {
        messaging().onTokenRefresh(useAddDeviceToken)
      }
    }
    setupNotifications()
  }, [isAuthed])

  return <>{children}</>
}
