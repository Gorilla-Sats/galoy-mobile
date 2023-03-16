import React from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"

// eslint-disable-next-line camelcase
import { useFragment_experimental } from "@apollo/client"
import {
  TransactionFragment,
  TransactionFragmentDoc,
  useHideBalanceQuery,
  WalletCurrency,
} from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { testProps } from "@app/utils/testProps"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem } from "@rneui/base"

import { palette } from "../../theme/palette"
import { IconTransaction } from "../icon-transactions"
import { TransactionDate } from "../transaction-date"
import { useAppConfig } from "@app/hooks"
import { useDarkMode } from "@app/hooks/use-darkmode"

const styles = EStyleSheet.create({
  containerLight: {
    height: 60,
    paddingVertical: 9,
    borderColor: palette.lighterGrey,
    borderBottomWidth: "2rem",
    overflow: "hidden",
  },
  containerDark: {
    height: 60,
    paddingVertical: 9,
    borderColor: palette.black,
    backgroundColor: palette.darkGrey,
    borderBottomWidth: "2rem",
    overflow: "hidden",
  },
  containerFirst: {
    overflow: "hidden",
    borderTopLeftRadius: "12rem",
    borderTopRightRadius: "12rem",
  },
  containerLast: {
    overflow: "hidden",
    borderBottomLeftRadius: "12rem",
    borderBottomRightRadius: "12rem",
  },
  lastListItemContainer: {
    borderBottomWidth: 0,
  },
  hiddenBalanceContainer: {
    fontSize: "16rem",
  },
  pendingLight: {
    color: palette.midGrey,
    textAlign: "right",
    flexWrap: "wrap",
  },
  pendingDark: {
    color: palette.lightGrey,
    textAlign: "right",
    flexWrap: "wrap",
  },
  receive: {
    color: palette.green,
    textAlign: "right",
    flexWrap: "wrap",
  },
  sendLight: {
    color: palette.darkGrey,
    textAlign: "right",
    flexWrap: "wrap",
  },
  sendDark: {
    color: palette.lightGrey,
    textAlign: "right",
    flexWrap: "wrap",
  },
  textDark: {
    color: palette.white,
  },
})

// This should extend the Transaction directly from the cache
export const descriptionDisplay = ({
  tx,
  bankName,
}: {
  tx: TransactionFragment
  bankName: string
}) => {
  const { memo, direction, settlementVia } = tx
  if (memo) {
    return memo
  }

  const isReceive = direction === "RECEIVE"

  switch (settlementVia.__typename) {
    case "SettlementViaOnChain":
      return "OnChain Payment"
    case "SettlementViaLn":
      return "Invoice"
    case "SettlementViaIntraLedger":
      return isReceive
        ? `From ${settlementVia.counterPartyUsername || bankName + " User"}`
        : `To ${settlementVia.counterPartyUsername || bankName + " User"}`
  }
}

const amountDisplayStyle = ({
  isReceive,
  isPending,
  darkMode,
}: {
  isReceive: boolean
  isPending: boolean
  darkMode: boolean
}) => {
  if (isPending) {
    return darkMode ? styles.pendingDark : styles.pendingLight
  }

  return isReceive ? styles.receive : darkMode ? styles.sendDark : styles.sendLight
}

type Props = {
  isFirst?: boolean
  isLast?: boolean
  txid: string
  subtitle?: boolean
}

export const TransactionItem: React.FC<Props> = ({
  txid,
  subtitle = false,
  isFirst = false,
  isLast = false,
}) => {
  const darkMode = useDarkMode()

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const { data: tx } = useFragment_experimental<TransactionFragment>({
    fragment: TransactionFragmentDoc,
    fragmentName: "Transaction",
    from: {
      __typename: "Transaction",
      id: txid,
    },
  })

  const { data: { hideBalance } = {} } = useHideBalanceQuery()
  const {
    appConfig: { galoyInstance },
  } = useAppConfig()
  const { formatMoneyAmount, formatCurrency } = useDisplayCurrency()

  if (!tx || Object.keys(tx).length === 0) {
    return null
  }

  const isReceive = tx.direction === "RECEIVE"
  const isPending = tx.status === "PENDING"
  const description = descriptionDisplay({
    tx,
    bankName: galoyInstance.name,
  })
  const walletCurrency = tx.settlementCurrency as WalletCurrency

  const formattedSettlementAmount = formatMoneyAmount({
    amount: tx.settlementAmount,
    currency: tx.settlementCurrency,
  })

  const formattedDisplayAmount = formatCurrency({
    amountInMajorUnits: tx.settlementDisplayAmount,
    currency: tx.settlementDisplayCurrency,
  })

  const formattedSecondaryAmount =
    tx.settlementDisplayCurrency === tx.settlementCurrency
      ? undefined
      : formattedSettlementAmount

  return (
    <View
      style={[isLast ? styles.containerLast : {}, isFirst ? styles.containerFirst : {}]}
    >
      <ListItem
        {...testProps("transaction-item")}
        containerStyle={[
          darkMode ? styles.containerDark : styles.containerLight,
          isLast ? styles.lastListItemContainer : {},
        ]}
        onPress={() =>
          navigation.navigate("transactionDetail", {
            txid: tx.id,
          })
        }
      >
        <IconTransaction
          onChain={tx.settlementVia.__typename === "SettlementViaOnChain"}
          isReceive={isReceive}
          pending={isPending}
          walletCurrency={walletCurrency}
        />
        <ListItem.Content {...testProps("list-item-content")}>
          <ListItem.Title
            numberOfLines={1}
            ellipsizeMode="tail"
            style={darkMode ? styles.textDark : {}}
            {...testProps("tx-description")}
          >
            {description}
          </ListItem.Title>
          <ListItem.Subtitle style={darkMode ? styles.textDark : {}}>
            {subtitle ? (
              <TransactionDate diffDate={true} friendly={true} {...tx} />
            ) : undefined}
          </ListItem.Subtitle>
        </ListItem.Content>

        {hideBalance ? (
          <Icon style={styles.hiddenBalanceContainer} name="eye" />
        ) : (
          <View>
            <Text style={amountDisplayStyle({ isReceive, isPending, darkMode })}>
              {formattedDisplayAmount}
            </Text>
            {formattedSecondaryAmount ? (
              <Text style={amountDisplayStyle({ isReceive, isPending, darkMode })}>
                {formattedSecondaryAmount}
              </Text>
            ) : null}
          </View>
        )}
      </ListItem>
    </View>
  )
}
