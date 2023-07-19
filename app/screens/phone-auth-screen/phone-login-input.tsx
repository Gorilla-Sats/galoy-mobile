import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import * as React from "react"
import { useEffect } from "react"
import { ActivityIndicator, View } from "react-native"
import CountryPicker, {
  CountryCode,
  DARK_THEME,
  DEFAULT_THEME,
  Flag,
} from "react-native-country-picker-modal"
import {
  CountryCode as PhoneNumberCountryCode,
  getCountryCallingCode,
} from "libphonenumber-js/mobile"
import { ContactSupportButton } from "@app/components/contact-support-button/contact-support-button"
import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, useTheme, Text, Input } from "@rneui/themed"
import { Screen } from "../../components/screen"
import type { PhoneValidationStackParamList } from "../../navigation/stack-param-lists"
import {
  ErrorType,
  RequestPhoneCodeStatus,
  useRequestPhoneCodeLogin,
} from "./request-phone-code-login"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { GaloyErrorBox } from "@app/components/atomic/galoy-error-box"
import { PhoneCodeChannelType } from "@app/graphql/generated"
import { TouchableOpacity } from "react-native-gesture-handler"

const DEFAULT_COUNTRY_CODE = "SV"
const PLACEHOLDER_PHONE_NUMBER = "123-456-7890"

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

  activityIndicator: { marginTop: 12 },

  keyboardContainer: {
    paddingHorizontal: 10,
  },

  codeTextStyle: {},
  countryPickerButtonStyle: {
    minWidth: 110,
    borderColor: colors.primary5,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  inputComponentContainerStyle: {
    flex: 1,
    marginLeft: 20,
    paddingLeft: 0,
    paddingRight: 0,
  },
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
  whatsAppButton: {
    marginBottom: 20,
  },
  contactSupportButton: {
    marginTop: 10,
  },

  loadingView: { flex: 1, justifyContent: "center", alignItems: "center" },
}))

export const PhoneLoginSetScreen: React.FC = () => {
  const styles = useStyles()

  const navigation =
    useNavigation<
      StackNavigationProp<PhoneValidationStackParamList, "phoneLoginInitiate">
    >()

  const {
    theme: { colors, mode: themeMode },
  } = useTheme()

  const {
    submitPhoneNumber,
    captchaLoading,
    status,
    setPhoneNumber,
    isSmsSupported,
    isWhatsAppSupported,
    phoneInputInfo,
    phoneCodeChannel,
    error,
    validatedPhoneNumber,
    setStatus,
    setCountryCode,
    supportedCountries,
    loadingSupportedCountries,
  } = useRequestPhoneCodeLogin()

  const { LL } = useI18nContext()

  useEffect(() => {
    if (status === RequestPhoneCodeStatus.SuccessRequestingCode) {
      setStatus(RequestPhoneCodeStatus.InputtingPhoneNumber)
      navigation.navigate("phoneLoginValidate", {
        phone: validatedPhoneNumber || "",
        channel: phoneCodeChannel,
      })
    }
  }, [status, phoneCodeChannel, validatedPhoneNumber, navigation, setStatus])

  if (status === RequestPhoneCodeStatus.LoadingCountryCode || loadingSupportedCountries) {
    return (
      <Screen>
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    )
  }

  let errorMessage: string | undefined
  if (error) {
    switch (error) {
      case ErrorType.FailedCaptchaError:
        errorMessage = LL.PhoneLoginSetScreen.errorRequestingCaptcha()
        break
      case ErrorType.RequestCodeError:
        errorMessage = LL.PhoneLoginSetScreen.errorRequestingCode()
        break
      case ErrorType.TooManyAttemptsError:
        errorMessage = LL.errors.tooManyRequestsPhoneCode()
        break
      case ErrorType.InvalidPhoneNumberError:
        errorMessage = LL.PhoneLoginSetScreen.errorInvalidPhoneNumber()
        break
      case ErrorType.UnsupportedCountryError:
        errorMessage = LL.PhoneLoginSetScreen.errorUnsupportedCountry()
        break
    }
  }
  if (!isSmsSupported && !isWhatsAppSupported) {
    errorMessage = LL.PhoneLoginSetScreen.errorUnsupportedCountry()
  }

  let PrimaryButton = undefined
  let SecondaryButton = undefined
  switch (true) {
    case isSmsSupported && isWhatsAppSupported:
      PrimaryButton = (
        <GaloyPrimaryButton
          title={LL.PhoneLoginSetScreen.sms()}
          loading={captchaLoading && phoneCodeChannel === PhoneCodeChannelType.Sms}
          onPress={() => submitPhoneNumber(PhoneCodeChannelType.Sms)}
        />
      )
      SecondaryButton = (
        <GaloySecondaryButton
          title={LL.PhoneLoginSetScreen.whatsapp()}
          containerStyle={styles.whatsAppButton}
          loading={captchaLoading && phoneCodeChannel === PhoneCodeChannelType.Whatsapp}
          onPress={() => submitPhoneNumber(PhoneCodeChannelType.Whatsapp)}
        />
      )
      break
    case isSmsSupported && !isWhatsAppSupported:
      PrimaryButton = (
        <GaloyPrimaryButton
          title={LL.PhoneLoginSetScreen.sms()}
          loading={captchaLoading && phoneCodeChannel === PhoneCodeChannelType.Sms}
          onPress={() => submitPhoneNumber(PhoneCodeChannelType.Sms)}
        />
      )
      break
    case !isSmsSupported && isWhatsAppSupported:
      PrimaryButton = (
        <GaloyPrimaryButton
          title={LL.PhoneLoginSetScreen.whatsapp()}
          loading={captchaLoading && phoneCodeChannel === PhoneCodeChannelType.Whatsapp}
          onPress={() => submitPhoneNumber(PhoneCodeChannelType.Whatsapp)}
        />
      )
      break
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
          <Text type={"p1"}>{LL.PhoneLoginSetScreen.header()}</Text>
        </View>

        <View style={styles.inputContainer}>
          <CountryPicker
            theme={themeMode === "dark" ? DARK_THEME : DEFAULT_THEME}
            countryCode={
              (phoneInputInfo?.countryCode || DEFAULT_COUNTRY_CODE) as CountryCode
            }
            countryCodes={supportedCountries as CountryCode[]}
            onSelect={(country) => setCountryCode(country.cca2 as PhoneNumberCountryCode)}
            renderFlagButton={({ countryCode, onOpen }) => {
              return (
                countryCode && (
                  <TouchableOpacity
                    style={styles.countryPickerButtonStyle}
                    onPress={onOpen}
                  >
                    <Flag countryCode={countryCode} flagSize={24} />
                    <Text type="p1">
                      +{getCountryCallingCode(countryCode as PhoneNumberCountryCode)}
                    </Text>
                  </TouchableOpacity>
                )
              )
            }}
            withCallingCodeButton={true}
            withFilter={true}
            filterProps={{
              autoFocus: true,
            }}
            withCallingCode={true}
          />
          <Input
            placeholder={PLACEHOLDER_PHONE_NUMBER}
            containerStyle={styles.inputComponentContainerStyle}
            inputContainerStyle={styles.inputContainerStyle}
            renderErrorMessage={false}
            textContentType="telephoneNumber"
            keyboardType="phone-pad"
            value={phoneInputInfo?.rawPhoneNumber}
            onChangeText={setPhoneNumber}
            autoFocus={true}
          />
        </View>
        {errorMessage && (
          <View style={styles.errorContainer}>
            <GaloyErrorBox errorMessage={errorMessage} />
            <ContactSupportButton containerStyle={styles.contactSupportButton} />
          </View>
        )}

        <View style={styles.buttonsContainer}>
          {SecondaryButton}
          {PrimaryButton}
        </View>
      </View>
    </Screen>
  )
}
