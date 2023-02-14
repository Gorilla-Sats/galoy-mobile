import {
  TransactionFragment,
  WalletCurrency,
  useHideBalanceQuery,
} from "@app/graphql/generated"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import { satAmountDisplay } from "@app/utils/currencyConversion"
import { WalletType } from "@app/utils/enum"
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import {
  CompositeNavigationProp,
  ParamListBase,
  useNavigation,
} from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { ListItem } from "@rneui/base"
import * as React from "react"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import EStyleSheet from "react-native-extended-stylesheet"
import Icon from "react-native-vector-icons/Ionicons"
import { prefCurrencyVar as primaryCurrencyVar } from "../../graphql/client-only-query"
import { palette } from "../../theme/palette"
import { IconTransaction } from "../icon-transactions"
import { TransactionDate } from "../transaction-date"

const styles = EStyleSheet.create({
  container: {
    paddingVertical: 9,
    borderColor: palette.lighterGrey,
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

  pending: {
    color: palette.midGrey,
  },

  receive: {
    color: palette.green,
  },

  send: {
    color: palette.darkGrey,
  },
})

export interface TransactionItemProps {
  isFirst?: boolean
  isLast?: boolean
  tx: TransactionFragment
  subtitle?: boolean
}

const computeUsdAmount = (tx: TransactionFragment) => {
  const { settlementAmount, settlementPrice } = tx
  const { base, offset } = settlementPrice
  const usdPerSat = base / 10 ** offset / 100
  return settlementAmount * usdPerSat
}

const descriptionDisplay = (tx: TransactionFragment) => {
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
        ? `From ${settlementVia.counterPartyUsername || "BitcoinBeach Wallet"}`
        : `To ${settlementVia.counterPartyUsername || "BitcoinBeach Wallet"}`
  }
}

const amountDisplayStyle = ({
  isReceive,
  isPending,
}: {
  isReceive: boolean
  isPending: boolean
}) => {
  if (isPending) {
    return styles.pending
  }

  return isReceive ? styles.receive : styles.send
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  tx,
  isFirst = false,
  isLast = false,
  subtitle = false,
}: TransactionItemProps) => {
  const navigation = useNavigation<
    | CompositeNavigationProp<
        BottomTabNavigationProp<ParamListBase>,
        StackNavigationProp<ParamListBase>
      >
    | StackNavigationProp<ParamListBase>
  >()

  const primaryCurrency = primaryCurrencyVar()
  const { data } = useHideBalanceQuery()
  const hideBalance = data?.hideBalance || false

  const isReceive = tx.direction === "RECEIVE"
  const isPending = tx.status === "PENDING"

  const description = React.useMemo(() => descriptionDisplay(tx), [tx])

  const usdAmount = computeUsdAmount(tx)

  const { formatToDisplayCurrency } = useDisplayCurrency()

  const asDisplayCurrency = React.useMemo(
    () => formatToDisplayCurrency(usdAmount),
    [formatToDisplayCurrency, usdAmount],
  )
  const asSatsAmountDisplay = React.useMemo(
    () => satAmountDisplay(tx.settlementAmount),
    [tx.settlementAmount],
  )

  const navigateToTransactionDetail = React.useCallback(
    () =>
      navigation.navigate("transactionDetail", {
        ...tx,
        walletType: tx.settlementCurrency,
        isReceive,
        isPending,
        description,
        usdAmount,
      }),
    [description, isPending, isReceive, navigation, tx, usdAmount],
  )

  const amountDisplayStyleCached = React.useMemo(
    () => amountDisplayStyle({ isReceive, isPending }),
    [isPending, isReceive],
  )

  return (
    <View
      style={[
        isLast ? styles.containerLast : null,
        isFirst ? styles.containerFirst : null,
      ]}
    >
      <ListItem
        containerStyle={[styles.container, isLast ? styles.lastListItemContainer : null]}
        onPress={navigateToTransactionDetail}
      >
        <IconTransaction
          onChain={tx.settlementVia.__typename === "SettlementViaOnChain"}
          isReceive={isReceive}
          pending={isPending}
          walletType={tx.settlementCurrency as WalletType}
        />
        <ListItem.Content>
          <ListItem.Title>{description}</ListItem.Title>
          <ListItem.Subtitle>
            {subtitle ? (
              <TransactionDate tx={tx} diffDate={true} friendly={true} />
            ) : undefined}
          </ListItem.Subtitle>
        </ListItem.Content>
        {hideBalance ? (
          <Icon
            style={styles.hiddenBalanceContainer}
            name="eye"
            // onPress={pressTxAmount}
          />
        ) : (
          <Text
            style={amountDisplayStyleCached}
            // onPress={hideBalance ? pressTxAmount : undefined}
          >
            {primaryCurrency === "BTC" && tx.settlementCurrency === WalletCurrency.Btc
              ? asSatsAmountDisplay
              : asDisplayCurrency}
          </Text>
        )}
      </ListItem>
    </View>
  )
}
