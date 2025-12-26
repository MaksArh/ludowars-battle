package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/heroiclabs/nakama-common/runtime"
)

type PurchaseRequest struct {
	ItemID string `json:"itemId"`
}

type PurchaseResponse struct {
	Success    bool   `json:"success"`
	Error      string `json:"error,omitempty"`
	NewBalance int    `json:"newBalance,omitempty"`
}

type Wallet struct {
	Coins int `json:"coins"`
}

// каталог товаров с ценами
var shopItems = map[string]int{
	"pistol":            0,
	"shotgun":           500,
	"assault_rifle":     800,
	"light_armor":       0,
	"medium_armor":      400,
	"heavy_armor":       700,
	"perk_fast_reload":  300,
	"perk_extra_ammo":   350,
	"perk_health_regen": 600,
	"skin_red":          100,
	"skin_blue":         100,
	"skin_gold":         1000,
}

func RegisterShopRPC(initializer runtime.Initializer) error {
	return initializer.RegisterRpc("purchase_item", purchaseItemRPC)
}

func purchaseItemRPC(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, payload string) (string, error) {
	userID, ok := ctx.Value(runtime.RUNTIME_CTX_USER_ID).(string)
	if !ok {
		return "", errors.New("not authenticated")
	}

	var req PurchaseRequest
	if err := json.Unmarshal([]byte(payload), &req); err != nil {
		return "", err
	}

	price, exists := shopItems[req.ItemID]
	if !exists {
		return jsonResponse(PurchaseResponse{Success: false, Error: "Item not found"})
	}

	account, err := nk.AccountGetId(ctx, userID)
	if err != nil {
		return "", err
	}

	wallet := parseWallet(account.Wallet)
	if wallet.Coins < price {
		return jsonResponse(PurchaseResponse{Success: false, Error: "Not enough coins"})
	}

	owned, err := checkOwnership(ctx, nk, userID, req.ItemID)
	if err != nil {
		return "", err
	}
	if owned {
		return jsonResponse(PurchaseResponse{Success: false, Error: "Already owned"})
	}

	if price > 0 {
		_, _, err = nk.WalletUpdate(ctx, userID, map[string]int64{"coins": int64(-price)}, nil, true)
		if err != nil {
			return "", err
		}
	}

	if err := recordPurchase(ctx, nk, userID, req.ItemID); err != nil {
		// откат если не получилось записать покупку
		nk.WalletUpdate(ctx, userID, map[string]int64{"coins": int64(price)}, nil, true)
		return "", err
	}

	account, _ = nk.AccountGetId(ctx, userID)
	newWallet := parseWallet(account.Wallet)

	logger.Info("User %s purchased %s for %d coins", userID, req.ItemID, price)

	return jsonResponse(PurchaseResponse{Success: true, NewBalance: newWallet.Coins})
}

func parseWallet(walletStr string) Wallet {
	var wallet Wallet
	json.Unmarshal([]byte(walletStr), &wallet)
	return wallet
}

func checkOwnership(ctx context.Context, nk runtime.NakamaModule, userID, itemID string) (bool, error) {
	objects, err := nk.StorageRead(ctx, []*runtime.StorageRead{{
		Collection: "purchases",
		Key:        itemID,
		UserID:     userID,
	}})
	if err != nil {
		return false, err
	}
	return len(objects) > 0, nil
}

func recordPurchase(ctx context.Context, nk runtime.NakamaModule, userID, itemID string) error {
	data, _ := json.Marshal(map[string]interface{}{
		"purchased_at": time.Now().Unix(),
	})

	_, err := nk.StorageWrite(ctx, []*runtime.StorageWrite{{
		Collection:      "purchases",
		Key:             itemID,
		UserID:          userID,
		Value:           string(data),
		PermissionRead:  1,
		PermissionWrite: 0,
	}})
	return err
}

func jsonResponse(resp PurchaseResponse) (string, error) {
	data, _ := json.Marshal(resp)
	return string(data), nil
}
