package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"github.com/heroiclabs/nakama-common/runtime"
)

// статистика игрока в хранилище
type PlayerStats struct {
	TotalKills   int `json:"totalKills"`
	TotalDeaths  int `json:"totalDeaths"`
	TotalWins    int `json:"totalWins"`
	TotalMatches int `json:"totalMatches"`
	TotalScore   int `json:"totalScore"`
}

const (
	StatsCollection = "stats"
	StatsKey        = "player_stats"

	LeaderboardKills = "total_kills"
	LeaderboardWins  = "total_wins"
	LeaderboardScore = "total_score"
)

func RegisterStatsRPC(initializer runtime.Initializer) error {
	return initializer.RegisterRpc("get_player_stats", getPlayerStatsRPC)
}

func getPlayerStatsRPC(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, payload string) (string, error) {
	userID, ok := ctx.Value(runtime.RUNTIME_CTX_USER_ID).(string)
	if !ok {
		return "", errors.New("not authenticated")
	}

	stats, err := loadPlayerStats(ctx, nk, userID)
	if err != nil {
		return "", err
	}

	data, _ := json.Marshal(stats)
	return string(data), nil
}

func loadPlayerStats(ctx context.Context, nk runtime.NakamaModule, userID string) (*PlayerStats, error) {
	objects, err := nk.StorageRead(ctx, []*runtime.StorageRead{{
		Collection: StatsCollection,
		Key:        StatsKey,
		UserID:     userID,
	}})
	if err != nil {
		return nil, err
	}

	stats := &PlayerStats{}
	if len(objects) > 0 {
		json.Unmarshal([]byte(objects[0].Value), stats)
	}
	return stats, nil
}

func savePlayerStats(ctx context.Context, nk runtime.NakamaModule, userID string, kills, deaths, score int, won bool) error {
	stats, err := loadPlayerStats(ctx, nk, userID)
	if err != nil {
		return err
	}

	stats.TotalKills += kills
	stats.TotalDeaths += deaths
	stats.TotalScore += score
	stats.TotalMatches++
	if won {
		stats.TotalWins++
	}

	data, _ := json.Marshal(stats)
	_, err = nk.StorageWrite(ctx, []*runtime.StorageWrite{{
		Collection:      StatsCollection,
		Key:             StatsKey,
		UserID:          userID,
		Value:           string(data),
		PermissionRead:  1,
		PermissionWrite: 0,
	}})
	return err
}

func updateLeaderboards(ctx context.Context, nk runtime.NakamaModule, logger runtime.Logger, userID, username string, kills, wins, score int) {
	if _, err := nk.LeaderboardRecordWrite(ctx, LeaderboardKills, userID, username, int64(kills), 0, nil, nil); err != nil {
		logger.Warn("Failed to update kills leaderboard: %v", err)
	}

	if _, err := nk.LeaderboardRecordWrite(ctx, LeaderboardWins, userID, username, int64(wins), 0, nil, nil); err != nil {
		logger.Warn("Failed to update wins leaderboard: %v", err)
	}

	if _, err := nk.LeaderboardRecordWrite(ctx, LeaderboardScore, userID, username, int64(score), 0, nil, nil); err != nil {
		logger.Warn("Failed to update score leaderboard: %v", err)
	}
}
