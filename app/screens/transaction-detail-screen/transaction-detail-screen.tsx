import { StackNavigationProp } from "@react-navigation/stack"
import { RouteProp } from "@react-navigation/native"
import * as React from "react"
import { Text, View, Linking, TouchableWithoutFeedback } from "react-native"
import { Divider } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import { CloseCross } from "../../components/close-cross"
import { IconTransaction } from "../../components/icon-transactions"
import { Screen } from "../../components/screen"
import { TextCurrencyForAmount } from "../../components/text-currency"
import { translateUnknown as translate } from "@galoymoney/client"
import type { ScreenType } from "../../types/jsx"
import type { RootStackParamList } from "../../navigation/stack-param-lists"
import { palette } from "../../theme"
import moment from "moment"
import { formatUsdAmount } from "../../hooks"
import Icon from "react-native-vector-icons/Ionicons"
import { BLOCKCHAIN_EXPLORER_URL } from "../../constants/support"
import { WalletType } from "@app/utils/enum"
import { WalletSummary } from "@app/components/wallet-summary"

const viewInExplorer = (hash: string): Promise<Linking> =>
  Linking.openURL(BLOCKCHAIN_EXPLORER_URL + hash)

const styles = EStyleSheet.create({
  amount: {
    color: palette.white,
    fontSize: "32rem",
  },

  amountSecondary: {
    color: palette.white,
    fontSize: "16rem",
  },

  amountText: {
    color: palette.white,
    fontSize: "18rem",
    marginVertical: "6rem",
  },

  amountView: {
    alignItems: "center",
    paddingBottom: "24rem",
    paddingTop: "48rem",
  },

  description: {
    marginVertical: 12,
  },
  divider: {
    backgroundColor: palette.midGrey,
    marginVertical: "12rem",
  },
  entry: {
    color: palette.darkGrey,
    marginBottom: "6rem",
  },
  transactionDetailText: {
    color: palette.darkGrey,
    fontSize: "18rem",
    fontWeight: "bold",
  },
  transactionDetailView: {
    marginHorizontal: "24rem",
    marginVertical: "24rem",
  },
  valueContainer: {
    flexDirection: "row",
    height: 50,
    backgroundColor: palette.white,
    alignItems: "center",
    borderRadius: 8,
  },
  value: {
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14rem",
    fontWeight: "bold",
  },
})

const Row = ({
  entry,
  value,
  type,
  content,
}: {
  entry: string
  value?: string
  type?: SettlementViaType
  content?: unknown
}) => (
  <View style={styles.description}>
    <Text style={styles.entry}>
      {entry + " "}
      {type === "SettlementViaOnChain" && (
        <Icon name="open-outline" size={18} color={palette.darkGrey} />
      )}
    </Text>
    {content || (
      <View style={styles.valueContainer}>
        <Text selectable style={styles.value}>
          {value}
        </Text>
      </View>
    )}
  </View>
)

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "transactionDetail">
  route: RouteProp<RootStackParamList, "transactionDetail">
}

const typeDisplay = (type: SettlementViaType) => {
  switch (type) {
    case "SettlementViaOnChain":
      return "OnChain"
    case "SettlementViaLn":
      return "Lightning"
    case "SettlementViaIntraLedger":
      return "BitcoinBeach"
  }
}

export const TransactionDetailScreen: ScreenType = ({ route, navigation }: Props) => {
  const {
    id,
    description,
    walletType,
    settlementAmount,
    settlementFee,
    settlementPrice,
    usdAmount,

    settlementVia,
    initiationVia,

    isReceive,
    createdAt,
  } = route.params

  const spendOrReceiveText = isReceive
    ? translate("TransactionDetailScreen.received")
    : translate("TransactionDetailScreen.spent")

  const { base, offset } = settlementPrice
  const usdPerSat = base / 10 ** offset / 100

  const feeEntry = `${settlementFee} sats ($${formatUsdAmount(
    settlementFee * usdPerSat,
  )})`

  const dateDisplay = moment.unix(createdAt).toDate().toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  })

  const walletSummary = (
    <WalletSummary
      walletType={walletType}
      amountType={isReceive ? "RECEIVE" : "SEND"}
      usdBalanceInDollars={Math.abs(usdAmount)}
      btcBalanceInSats={walletType === WalletType.BTC && Math.abs(settlementAmount)}
    />
  )

  return (
    <Screen backgroundColor={palette.lighterGrey} unsafe preset="scroll">
      <View
        style={[
          styles.amountView,
          {
            backgroundColor:
              walletType === WalletType.USD ? palette.usdPrimary : palette.btcPrimary,
          },
        ]}
      >
        <IconTransaction
          isReceive={isReceive}
          walletType={walletType}
          pending={false}
          onChain={false}
        />
        <Text style={styles.amountText}>{spendOrReceiveText}</Text>
        <TextCurrencyForAmount
          amount={Math.abs(usdAmount)}
          currency="USD"
          style={styles.amount}
        />
        {walletType === WalletType.BTC && (
          <TextCurrencyForAmount
            amount={Math.abs(settlementAmount)}
            currency="BTC"
            style={styles.amountSecondary}
            satsIconSize={20}
            iconColor={palette.white}
          />
        )}
      </View>
      <View style={styles.transactionDetailView}>
        <Text style={styles.transactionDetailText}>
          {translate("TransactionDetailScreen.detail")}
        </Text>
        <Divider style={styles.divider} />
        {/* NEED TRANSLATION */}
        <Row
          entry={isReceive ? "Receiving Wallet" : "Sending Wallet"}
          content={walletSummary}
        />
        <Row entry={translate("common.date")} value={dateDisplay} />
        {!isReceive && <Row entry={translate("common.fees")} value={feeEntry} />}
        <Row entry={translate("common.description")} value={description} />
        {settlementVia.__typename === "SettlementViaIntraLedger" && (
          <Row
            entry={translate("TransactionDetailScreen.paid")}
            value={settlementVia.counterPartyUsername || "BitcoinBeach Wallet"}
          />
        )}
        <Row
          entry={translate("common.type")}
          value={typeDisplay(settlementVia.__typename)}
        />
        {settlementVia.__typename === "SettlementViaLn" && (
          <Row entry="Hash" value={initiationVia.paymentHash} />
        )}
        {settlementVia.__typename === "SettlementViaOnChain" && (
          <TouchableWithoutFeedback
            onPress={() => viewInExplorer(settlementVia.transactionHash)}
          >
            <View>
              <Row
                entry="Hash"
                value={settlementVia.transactionHash}
                type={settlementVia.__typename}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
        {id && <Row entry="id" value={id} />}
      </View>
      <CloseCross color={palette.white} onPress={() => navigation.goBack()} />
    </Screen>
  )
}
