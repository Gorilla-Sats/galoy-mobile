import * as React from "react"
import { useI18nContext } from "@app/i18n/i18n-react"
import { StackNavigationProp } from "@react-navigation/stack"
import { StyleSheet, View } from "react-native"
import { Screen } from "../../components/screen"
import { VersionComponent } from "../../components/version"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { testProps } from "../../utils/testProps"

import AppLogoLightMode from "../../assets/logo/app-logo-light.svg"
import AppLogoDarkMode from "../../assets/logo/app-logo-dark.svg"
import { useTheme } from "@rneui/themed"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useFeatureFlags } from "@app/config/feature-flags-context"
import useDeviceToken from "./use-device-token"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"

const styles = StyleSheet.create({
  bottom: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "flex-end",
    marginBottom: 36,
    width: "100%",
  },

  buttonContainer: {
    marginVertical: 12,
  },

  screen: {
    alignItems: "center",
    flex: 1,
    width: "100%",
  },

  version: { paddingTop: 18 },
})

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "getStarted">
}

export const GetStartedScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme()
  const AppLogo = theme.mode === "dark" ? AppLogoDarkMode : AppLogoLightMode

  const { LL } = useI18nContext()

  const { deviceAccountEnabled } = useFeatureFlags()

  const [deviceToken] = useDeviceToken({ skip: !deviceAccountEnabled })
  return (
    <Screen style={styles.screen}>
      <AppLogo width={"100%"} height={"60%"} />
      <VersionComponent style={styles.version} />
      <View style={styles.bottom}>
        <GaloyPrimaryButton
          title={LL.GetStartedScreen.createAccount()}
          onPress={() => navigation.navigate("phoneFlow")}
          containerStyle={styles.buttonContainer}
          {...testProps(LL.GetStartedScreen.createAccount())}
        />
        {deviceToken && (
          <GaloySecondaryButton
            title={LL.GetStartedScreen.startLiteAccount()}
            onPress={() =>
              navigation.replace("liteDeviceAccount", {
                deviceToken,
              })
            }
            {...testProps(LL.GetStartedScreen.startLiteAccount())}
          />
        )}
      </View>
    </Screen>
  )
}
