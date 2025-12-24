package main

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/heroiclabs/nakama-common/runtime"
)

func RegisterMatchmakingRPC(initializer runtime.Initializer) error {
	return initializer.RegisterRpc("join_or_create_match", joinOrCreateMatch)
}

// joinOrCreateMatch ищет открытый матч или создает новый
func joinOrCreateMatch(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, payload string) (string, error) {
	matches, err := nk.MatchList(ctx, 10, true, `{"open":true}`, nil, nil, "")
	if err != nil {
		logger.Error("Failed to list matches: %v", err)
		return "", err
	}

	// ищем матч с местом
	for _, match := range matches {
		if match.Size < MaxPlayers {
			logger.Info("Found open match %s with %d players", match.MatchId, match.Size)
			result, _ := json.Marshal(map[string]string{"matchId": match.MatchId})
			return string(result), nil
		}
	}

	// создаем новый матч
	matchId, err := nk.MatchCreate(ctx, "ludowars", nil)
	if err != nil {
		logger.Error("Failed to create match: %v", err)
		return "", err
	}

	logger.Info("Created new match %s", matchId)
	result, _ := json.Marshal(map[string]string{"matchId": matchId})
	return string(result), nil
}
