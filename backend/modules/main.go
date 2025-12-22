package main

import (
	"context"
	"database/sql"

	"github.com/heroiclabs/nakama-common/runtime"
)

func InitModule(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, initializer runtime.Initializer) error {
	logger.Info("Ludowars module loading...")

	// создаем лидерборды
	createLeaderboards(ctx, logger, nk)

	// регистрируем обработчик матчей
	if err := initializer.RegisterMatch("ludowars", func(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule) (runtime.Match, error) {
		return &Match{}, nil
	}); err != nil {
		return err
	}

	if err := RegisterMatchmakingRPC(initializer); err != nil {
		logger.Error("Failed to register matchmaking RPC: %v", err)
		return err
	}

	if err := RegisterShopRPC(initializer); err != nil {
		logger.Error("Failed to register shop RPC: %v", err)
		return err
	}

	if err := RegisterUserHooks(initializer); err != nil {
		logger.Error("Failed to register user hooks: %v", err)
		return err
	}

	if err := RegisterStatsRPC(initializer); err != nil {
		logger.Error("Failed to register stats RPC: %v", err)
		return err
	}

	logger.Info("Ludowars module ready")
	return nil
}

func createLeaderboards(ctx context.Context, logger runtime.Logger, nk runtime.NakamaModule) {
	leaderboards := []string{LeaderboardKills, LeaderboardWins, LeaderboardScore}
	for _, id := range leaderboards {
		if err := nk.LeaderboardCreate(ctx, id, false, "desc", "incr", "", nil, true); err != nil {
			logger.Warn("Leaderboard %s may already exist: %v", id, err)
		} else {
			logger.Info("Created leaderboard: %s", id)
		}
	}
}

func main() {}
