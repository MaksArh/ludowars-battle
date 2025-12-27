package main

import (
	"context"
	"database/sql"

	"github.com/heroiclabs/nakama-common/api"
	"github.com/heroiclabs/nakama-common/runtime"
)

const StartingCoins = 1000

func RegisterUserHooks(initializer runtime.Initializer) error {
	if err := initializer.RegisterAfterAuthenticateEmail(afterAuthEmail); err != nil {
		return err
	}
	if err := initializer.RegisterAfterAuthenticateDevice(afterAuthDevice); err != nil {
		return err
	}
	return nil
}

func afterAuthEmail(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, out *api.Session, in *api.AuthenticateEmailRequest) error {
	userID, _ := ctx.Value(runtime.RUNTIME_CTX_USER_ID).(string)
	return grantStartingCoins(ctx, logger, nk, userID)
}

func afterAuthDevice(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, out *api.Session, in *api.AuthenticateDeviceRequest) error {
	userID, _ := ctx.Value(runtime.RUNTIME_CTX_USER_ID).(string)
	return grantStartingCoins(ctx, logger, nk, userID)
}

// grantStartingCoins выдает стартовые монеты новым игрокам
func grantStartingCoins(ctx context.Context, logger runtime.Logger, nk runtime.NakamaModule, userID string) error {
	account, err := nk.AccountGetId(ctx, userID)
	if err != nil {
		return err
	}

	wallet := parseWallet(account.Wallet)
	if wallet.Coins == 0 {
		_, _, err = nk.WalletUpdate(ctx, userID, map[string]int64{"coins": StartingCoins}, nil, true)
		if err != nil {
			logger.Error("Failed to add starting coins: %v", err)
		} else {
			logger.Info("Added %d starting coins to user %s", StartingCoins, userID)
		}
	}

	return nil
}
