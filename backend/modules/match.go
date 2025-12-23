package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"math"
	"math/rand"
	"sort"
	"time"

	"github.com/heroiclabs/nakama-common/runtime"
)

type Match struct{}

type MatchState struct {
	Players         map[string]*PlayerInfo `json:"players"`
	ReadyPlayers    map[string]bool        `json:"-"`
	StartTime       time.Time              `json:"-"`
	Started         bool                   `json:"-"`
	CountdownActive bool                   `json:"-"`
	Open            bool                   `json:"-"`
	SpawnIndex      int                    `json:"-"`
	LastTimeSync    int64                  `json:"-"`
	LastCountdown   int                    `json:"-"`
	CountdownEnded  bool                   `json:"-"`
}

type PlayerInfo struct {
	ID             string   `json:"id"`
	Username       string   `json:"username"`
	SpawnIndex     int      `json:"spawnIndex"`
	Kills          int      `json:"kills"`
	Deaths         int      `json:"deaths"`
	Score          int      `json:"score"`
	LastRoulette   int64    `json:"-"`
	DamageMulti    float64  `json:"-"`
	ShieldEnd      int64    `json:"-"`
	InstakillReady bool     `json:"-"`
	EffectEnd      int64    `json:"-"`
	Perks          []string `json:"-"`
}

type KillMessage struct {
	KillerId string `json:"killerId"`
	VictimId string `json:"victimId"`
	WeaponId string `json:"weaponId"`
}

// символы рулетки: 0=урон 1=хил 2=щит 3=череп
const (
	SymDamage = 0
	SymHeal   = 1
	SymShield = 2
	SymSkull  = 3
)

type RouletteResult struct {
	PlayerId string `json:"playerId"`
	Symbols  [3]int `json:"symbols"`
	Effect   string `json:"effect"`
	Duration int    `json:"duration"`
}

func (m *Match) MatchInit(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, params map[string]interface{}) (interface{}, int, string) {
	state := &MatchState{
		Players:       make(map[string]*PlayerInfo),
		ReadyPlayers:  make(map[string]bool),
		Open:          true,
		LastCountdown: -1,
	}
	label := `{"open":true}`
	return state, TickRate, label
}

func (m *Match) MatchJoinAttempt(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, presence runtime.Presence, metadata map[string]string) (interface{}, bool, string) {
	s := state.(*MatchState)
	if len(s.Players) >= MaxPlayers {
		return state, false, "match full"
	}
	return state, true, ""
}

func (m *Match) MatchJoin(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, presences []runtime.Presence) interface{} {
	s := state.(*MatchState)

	for _, p := range presences {
		spawnIdx := s.SpawnIndex
		s.SpawnIndex++

		logger.Info("Player %s (%s) joined match with spawnIndex %d", p.GetUserId(), p.GetUsername(), spawnIdx)

		s.Players[p.GetUserId()] = &PlayerInfo{
			ID:          p.GetUserId(),
			Username:    p.GetUsername(),
			SpawnIndex:  spawnIdx,
			DamageMulti: 1.0,
		}

		// сообщаем всем о новом игроке
		msg, _ := json.Marshal(map[string]interface{}{
			"playerId":   p.GetUserId(),
			"username":   p.GetUsername(),
			"spawnIndex": spawnIdx,
		})
		dispatcher.BroadcastMessage(OpPlayerJoin, msg, nil, nil, true)
	}

	// отправляем список игроков новичкам
	playersList := make([]map[string]interface{}, 0)
	for _, pl := range s.Players {
		playersList = append(playersList, map[string]interface{}{
			"id":         pl.ID,
			"username":   pl.Username,
			"spawnIndex": pl.SpawnIndex,
		})
	}
	playersMsg, _ := json.Marshal(map[string]interface{}{
		"players": playersList,
	})
	dispatcher.BroadcastMessage(OpGameState, playersMsg, presences, nil, true)

	// если набралось достаточно игроков ждем готовности
	if len(s.Players) >= MinPlayers && !s.Started {
		s.Started = true
		logger.Info("Match has enough players (%d), waiting for all ready", len(s.Players))
	}

	// закрываем матч если полный
	if len(s.Players) >= MaxPlayers && s.Open {
		s.Open = false
		dispatcher.MatchLabelUpdate(`{"open":false}`)
		logger.Info("Match is now full, closed to new players")
	}

	return s
}

func (m *Match) MatchLeave(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, presences []runtime.Presence) interface{} {
	s := state.(*MatchState)

	for _, p := range presences {
		logger.Info("Player %s left match", p.GetUserId())
		delete(s.Players, p.GetUserId())

		msg, _ := json.Marshal(map[string]string{
			"playerId": p.GetUserId(),
		})
		dispatcher.BroadcastMessage(OpPlayerLeft, msg, nil, nil, true)
	}

	if len(s.Players) < MinPlayers && s.Started {
		finalizeMatch(ctx, logger, nk, dispatcher, s, "not_enough_players")
		return nil
	}

	return s
}

func (m *Match) MatchLoop(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, messages []runtime.MatchData) interface{} {
	s := state.(*MatchState)

	// обрабатываем готовность игроков
	for _, msg := range messages {
		if msg.GetOpCode() == OpPlayerReady {
			playerId := msg.GetUserId()
			if _, exists := s.Players[playerId]; exists && !s.ReadyPlayers[playerId] {
				s.ReadyPlayers[playerId] = true
				logger.Info("Player %s is ready (%d/%d)", playerId, len(s.ReadyPlayers), len(s.Players))
			}
		}
	}

	// когда все готовы запускаем обратный отсчет
	if s.Started && !s.CountdownActive && len(s.ReadyPlayers) >= len(s.Players) && len(s.Players) >= MinPlayers {
		s.CountdownActive = true
		s.StartTime = time.Now()
		logger.Info("All players ready, starting countdown")

		startMsg, _ := json.Marshal(map[string]interface{}{
			"duration":     MatchDuration,
			"killsToWin":   KillsToWin,
			"freezeTime":   FreezeTime,
			"startTimeUtc": s.StartTime.UnixMilli(),
		})
		dispatcher.BroadcastMessage(OpMatchStart, startMsg, nil, nil, true)
	}

	if !s.CountdownActive {
		return s
	}

	elapsedMs := time.Since(s.StartTime).Milliseconds()
	remainingMs := int64(MatchDuration) - elapsedMs

	// время вышло
	if remainingMs <= 0 {
		finalizeMatch(ctx, logger, nk, dispatcher, s, "time_up")
		return nil
	}

	// обратный отсчет
	frozen := elapsedMs < int64(FreezeTime)
	if frozen {
		remainingFreeze := int64(FreezeTime) - elapsedMs
		currentSecond := int((remainingFreeze + 999) / 1000)

		if currentSecond != s.LastCountdown && currentSecond >= 1 && currentSecond <= 5 {
			s.LastCountdown = currentSecond
			freezeMsg, _ := json.Marshal(map[string]interface{}{
				"countdown": currentSecond,
				"frozen":    true,
			})
			dispatcher.BroadcastMessage(OpFreeze, freezeMsg, nil, nil, true)
		}
	} else if !s.CountdownEnded {
		s.CountdownEnded = true
		freezeMsg, _ := json.Marshal(map[string]interface{}{
			"countdown": 0,
			"frozen":    false,
		})
		dispatcher.BroadcastMessage(OpFreeze, freezeMsg, nil, nil, true)
		logger.Info("Countdown ended, players unfrozen")
	}

	// синхронизация времени каждые 30 сек
	if s.CountdownEnded && tick-s.LastTimeSync >= 600 {
		s.LastTimeSync = tick
		syncMsg, _ := json.Marshal(map[string]interface{}{
			"remainingMs": remainingMs,
		})
		dispatcher.BroadcastMessage(OpTimeSync, syncMsg, nil, nil, true)
	}

	// пересылаем сообщения от игроков
	for _, msg := range messages {
		op := msg.GetOpCode()

		if op == OpPlayerReady {
			continue
		}
		if frozen && op == OpPosition {
			continue
		}

		switch op {
		case OpPosition, OpShoot, OpDash, OpJump, OpReload, OpWeaponSwap:
			relayMsg, _ := json.Marshal(map[string]interface{}{
				"playerId": msg.GetUserId(),
				"data":     json.RawMessage(msg.GetData()),
			})
			dispatcher.BroadcastMessage(op, relayMsg, nil, msg, true)

		case OpRoulette:
			playerId := msg.GetUserId()
			player, ok := s.Players[playerId]
			if !ok {
				continue
			}

			now := time.Now().UnixMilli()
			if now-player.LastRoulette < RouletteCooldown {
				continue
			}

			// списываем монеты
			_, _, err := nk.WalletUpdate(ctx, playerId, map[string]int64{"coins": -RouletteCost}, nil, false)
			if err != nil {
				logger.Warn("Roulette failed for %s: %v", playerId, err)
				continue
			}

			player.LastRoulette = now
			result := generateRoulette(player.Perks, playerId)

			resultMsg, _ := json.Marshal(result)
			dispatcher.BroadcastMessage(OpRouletteSync, resultMsg, nil, nil, true)
			logger.Info("Roulette: %s got %v -> %s (cost: %d coins)", playerId, result.Symbols, result.Effect, RouletteCost)

		case OpKill:
			var kill KillMessage
			if err := json.Unmarshal(msg.GetData(), &kill); err != nil {
				logger.Warn("Failed to parse kill message: %v", err)
				continue
			}

			// обновляем статистику
			if killer, ok := s.Players[kill.KillerId]; ok {
				killer.Kills++
				killer.Score += 10
			}
			if victim, ok := s.Players[kill.VictimId]; ok {
				victim.Deaths++
				victim.Score -= 2
				if victim.Score < 0 {
					victim.Score = 0
				}
			}

			// собираем таблицу очков
			scoreboard := make([]map[string]interface{}, 0, len(s.Players))
			for _, p := range s.Players {
				scoreboard = append(scoreboard, map[string]interface{}{
					"id":       p.ID,
					"username": p.Username,
					"kills":    p.Kills,
					"deaths":   p.Deaths,
					"score":    p.Score,
				})
			}

			scoreMsg, _ := json.Marshal(map[string]interface{}{
				"killerId":   kill.KillerId,
				"victimId":   kill.VictimId,
				"weaponId":   kill.WeaponId,
				"scoreboard": scoreboard,
			})
			dispatcher.BroadcastMessage(OpScoreboard, scoreMsg, nil, nil, true)
			logger.Info("Kill: %s killed %s (K:%d D:%d)", kill.KillerId, kill.VictimId,
				s.Players[kill.KillerId].Kills, s.Players[kill.VictimId].Deaths)

			// проверяем победу
			if killer, ok := s.Players[kill.KillerId]; ok && killer.Kills >= KillsToWin {
				finalizeMatch(ctx, logger, nk, dispatcher, s, "kills_reached")
				return nil
			}

		default:
			dispatcher.BroadcastMessage(op, msg.GetData(), nil, msg, true)
		}
	}

	return s
}

// finalizeMatch завершает матч и раздает награды
func finalizeMatch(ctx context.Context, logger runtime.Logger, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, s *MatchState, reason string) {
	players := make([]*PlayerInfo, 0, len(s.Players))
	for _, p := range s.Players {
		players = append(players, p)
	}
	sort.Slice(players, func(i, j int) bool {
		return players[i].Score > players[j].Score
	})

	var winnerId string
	if len(players) > 0 {
		winnerId = players[0].ID
	}

	stats := make(map[string]interface{})
	for i, p := range players {
		isWinner := i == 0 || len(players) == 1

		// награда по формуле kills/deaths * score * 0.25
		deaths := p.Deaths
		if deaths == 0 {
			deaths = 1
		}
		reward := int(math.Ceil(float64(p.Kills) / float64(deaths) * float64(p.Score) * 0.25))
		if reward < 0 {
			reward = 0
		}

		if reward > 0 {
			if _, _, err := nk.WalletUpdate(ctx, p.ID, map[string]int64{"coins": int64(reward)}, nil, true); err != nil {
				logger.Warn("Failed to award coins to %s: %v", p.ID, err)
			}
		}

		if err := savePlayerStats(ctx, nk, p.ID, p.Kills, p.Deaths, p.Score, isWinner); err != nil {
			logger.Warn("Failed to save stats for %s: %v", p.ID, err)
		}

		updatedStats, err := loadPlayerStats(ctx, nk, p.ID)
		if err == nil {
			wins := 0
			if isWinner {
				wins = 1
			}
			updateLeaderboards(ctx, nk, logger, p.ID, p.Username, p.Kills, wins, p.Score)
			_ = updatedStats
		}

		stats[p.ID] = map[string]interface{}{
			"username": p.Username,
			"kills":    p.Kills,
			"deaths":   p.Deaths,
			"score":    p.Score,
			"reward":   reward,
		}
	}

	endMsg, _ := json.Marshal(map[string]interface{}{
		"reason":   reason,
		"winnerId": winnerId,
		"stats":    stats,
	})
	dispatcher.BroadcastMessage(OpMatchEnd, endMsg, nil, nil, true)
	logger.Info("Match finalized: reason=%s winner=%s", reason, winnerId)
}

// generateRoulette генерирует результат рулетки с учетом перков
func generateRoulette(perks []string, playerId string) RouletteResult {
	symbols := [3]int{}
	luckBonus := 0

	fixers := map[int]int{}
	for _, perk := range perks {
		switch perk {
		case "roulette_luck_5":
			luckBonus += 5
		case "roulette_luck_10":
			luckBonus += 10
		case "roulette_luck_15":
			luckBonus += 15
		case "roulette_fix_1_damage":
			fixers[0] = SymDamage
		case "roulette_fix_1_heal":
			fixers[0] = SymHeal
		case "roulette_fix_1_shield":
			fixers[0] = SymShield
		case "roulette_fix_2_damage":
			fixers[1] = SymDamage
		case "roulette_fix_2_heal":
			fixers[1] = SymHeal
		case "roulette_fix_2_shield":
			fixers[1] = SymShield
		case "roulette_fix_3_damage":
			fixers[2] = SymDamage
		case "roulette_fix_3_heal":
			fixers[2] = SymHeal
		case "roulette_fix_3_shield":
			fixers[2] = SymShield
		}
	}

	for i := 0; i < 3; i++ {
		if sym, fixed := fixers[i]; fixed {
			symbols[i] = sym
		} else {
			if luckBonus > 0 && i > 0 && rand.Intn(100) < luckBonus {
				symbols[i] = symbols[rand.Intn(i)]
			} else {
				symbols[i] = rand.Intn(4)
			}
		}
	}

	effect, duration := calculateEffect(symbols)
	return RouletteResult{
		PlayerId: playerId,
		Symbols:  symbols,
		Effect:   effect,
		Duration: duration,
	}
}

// calculateEffect определяет эффект по комбинации символов
func calculateEffect(symbols [3]int) (string, int) {
	counts := map[int]int{}
	for _, s := range symbols {
		counts[s]++
	}

	// тройка
	for sym, count := range counts {
		if count == 3 {
			switch sym {
			case SymDamage:
				return "damage_100", 10000
			case SymHeal:
				return "heal_100", 0
			case SymShield:
				return "shield_7", 7000
			case SymSkull:
				return "instakill", 0
			}
		}
	}

	// пара
	for sym, count := range counts {
		if count == 2 {
			switch sym {
			case SymDamage:
				return "damage_50", 8000
			case SymHeal:
				return "heal_50", 0
			case SymShield:
				return "shield_5", 5000
			case SymSkull:
				return "damage_75", 5000
			}
		}
	}

	// один символ
	for _, sym := range symbols {
		if counts[sym] == 1 {
			switch sym {
			case SymDamage:
				return "damage_25", 5000
			case SymHeal:
				return "heal_25", 0
			case SymShield:
				return "shield_3", 3000
			case SymSkull:
				return "nothing", 0
			}
		}
	}

	// все разные
	effects := []struct {
		e string
		d int
	}{
		{"damage_25", 5000},
		{"heal_25", 0},
		{"shield_3", 3000},
	}
	pick := effects[rand.Intn(len(effects))]
	return pick.e, pick.d
}

func (m *Match) MatchTerminate(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, graceSeconds int) interface{} {
	return nil
}

func (m *Match) MatchSignal(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, data string) (interface{}, string) {
	return state, ""
}
