import { Screen } from "@app/components/screen"
import { WalletCurrency } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { requestNotificationPermission } from "@app/utils/notifications"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import React, { useEffect } from "react"
import { TouchableOpacity, View } from "react-native"
import { testProps } from "../../utils/testProps"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { ButtonGroup } from "@app/components/button-group"
import { AmountInput } from "@app/components/amount-input"
import { NoteInput } from "@app/components/note-input"
import Icon from "react-native-vector-icons/Ionicons"
import { SetLightningAddressModal } from "@app/components/set-lightning-address-modal"
import { GaloyCurrencyBubble } from "@app/components/atomic/galoy-currency-bubble"
import { Test } from "mocha"

const BuyLightningBitcoin = () => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const navigation = useNavigation()

  const isAuthed = useIsAuthed()
  const isFocused = useIsFocused()

  return (
    <>
      <Screen
        preset="scroll"
        keyboardOffset="navigationHeader"
        keyboardShouldPersistTaps="handled"
        style={styles.screenStyle}
      >
        <Text>This is a test</Text>
      </Screen>
    </>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  screenStyle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  tabRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    marginTop: 12,
  },
  usdActive: {
    backgroundColor: colors.green,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  btcActive: {
    backgroundColor: colors.primary,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  inactiveTab: {
    backgroundColor: colors.grey3,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    height: 30,
    margin: 5,
  },
  qrView: {
    marginBottom: 10,
  },
  receivingWalletPicker: {
    marginBottom: 10,
  },
  invoiceTypePicker: {
    marginBottom: 10,
  },
  note: {
    marginTop: 10,
  },
  extraDetails: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    minHeight: 20,
  },
  invoiceActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    minHeight: 20,
  },
  copyInvoiceContainer: {
    flex: 2,
    marginLeft: 10,
  },
  shareInvoiceContainer: {
    flex: 2,
    alignItems: "flex-end",
    marginRight: 10,
  },
  onchainCharges: { marginTop: 10, alignItems: "center" },
}))

export default BuyLightningBitcoin;
