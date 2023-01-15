import React, { useEffect } from "react"
import { StyleSheet, Text, View } from "react-native"
import LottieView from "lottie-react-native"

import { palette } from "@app/theme"
import successLottieJson from "../send-bitcoin-screen/success_lottie.json"
import { StackScreenProps } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useApolloClient } from "@apollo/client"

export const ConversionSuccessScreen = ({
  navigation,
}: StackScreenProps<RootStackParamList, "conversionSuccess">) => {
  const client = useApolloClient()

  const { LL } = useI18nContext()
  const CALLBACK_DELAY = 2000
  useEffect(() => {
    client.refetchQueries({
      include: ["mainQuery"],
    })

    const navigateToHomeTimeout = setTimeout(() => navigation.popToTop(), CALLBACK_DELAY)
    return () => clearTimeout(navigateToHomeTimeout)
  }, [navigation, client])

  return (
    <View style={styles.lottieContainer}>
      <LottieView
        source={successLottieJson}
        loop={false}
        autoPlay
        style={styles.lottie}
        resizeMode="cover"
      />
      <Text style={styles.successLottieText}>{LL.ConversionSuccessScreen.message()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  lottie: {
    height: 100,
    width: 100,
  },
  successLottieText: {
    color: palette.darkGrey,
    fontSize: 18,
    textAlign: "center",
  },
  lottieContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
