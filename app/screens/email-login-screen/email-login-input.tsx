import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { Input, Text, makeStyles } from "@rneui/themed"
import axios, { isAxiosError } from "axios"
import * as React from "react"
import { View } from "react-native"
import validator from "validator"
import { Screen } from "../../components/screen"
import { useAppConfig } from "@app/hooks"

const PLACEHOLDER_EMAIL = "hal@finney.org"
const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    padding: 20,
    flexGrow: 1,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },

  inputContainer: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 48,
  },
  textContainer: {
    marginBottom: 20,
  },
  viewWrapper: { flex: 1 },

  inputContainerStyle: {
    flex: 1,
    borderWidth: 2,
    borderBottomWidth: 2,
    paddingHorizontal: 10,
    borderColor: colors.primary5,
    borderRadius: 8,
  },
  errorContainer: {
    marginBottom: 20,
  },
}))

export const EmailLoginInputScreen: React.FC = () => {
  const styles = useStyles()
  const {
    appConfig: {
      galoyInstance: { authUrl },
    },
  } = useAppConfig()

  const urlEmailCodeRequest = `${authUrl}/auth/email/code-request`

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "emailSetInput">>()

  const [emailInput, setEmailInput] = React.useState<string>("")
  const [errorMessage, setErrorMessage] = React.useState<string>("")
  const [loading, setLoading] = React.useState<boolean>(false)

  const { LL } = useI18nContext()

  const submit = async () => {
    if (!validator.isEmail(emailInput)) {
      setErrorMessage(LL.EmailLoginInputScreen.invalidEmail())
      return
    }

    setLoading(true)

    try {
      const res = await axios({
        url: urlEmailCodeRequest,
        method: "POST",
        data: {
          email: emailInput,
        },
      })
      // TODO: manage error on ip rate limit
      // TODO: manage error when trying the same email too often
      const flow = res.data.result

      if (flow) {
        navigation.navigate("emailLoginValidation", { flow, email: emailInput })
      } else {
        console.warn("no flow returned")
      }
    } catch (err) {
      console.error(err, "error in setEmailMutation")
      if (isAxiosError(err)) {
        console.log(err.message) // Gives you the basic error message
        console.log(err.response?.data) // Gives you the response payload from the server
        console.log(err.response?.status) // Gives you the HTTP status code
        console.log(err.response?.headers) // Gives you the response headers

        // If the request was made but no response was received
        if (!err.response) {
          console.log(err.request)
        }
        setErrorMessage(err.response?.data?.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen
      preset="scroll"
      style={styles.screenStyle}
      keyboardOffset="navigationHeader"
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.viewWrapper}>
        <View style={styles.textContainer}>
          <Text type={"p1"}>{LL.EmailLoginInputScreen.header()}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Input
            autoCapitalize="none"
            placeholder={PLACEHOLDER_EMAIL}
            inputContainerStyle={styles.inputContainerStyle}
            renderErrorMessage={false}
            textContentType="emailAddress"
            keyboardType="email-address"
            value={emailInput}
            onChangeText={setEmailInput}
            autoFocus={true}
          />
        </View>
        {errorMessage && (
          <View style={styles.errorContainer}>
            <GaloyErrorBox errorMessage={errorMessage} />
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <GaloyPrimaryButton
            title={LL.EmailLoginInputScreen.send()}
            loading={loading}
            disabled={!emailInput}
            onPress={submit}
          />
        </View>
      </View>
    </Screen>
  )
}
