package main

const (
	TickRate      = 20
	MatchDuration = 5 * 60 * 1000
	KillsToWin    = 10
	MinPlayers    = 2
	MaxPlayers    = 4

	FreezeTime = 5000 // 5 сек заморозки перед матчем

	// опкоды для сообщений
	OpPosition   = 1
	OpDamage     = 2
	OpKill       = 3
	OpShoot      = 4
	OpDash       = 5
	OpReload     = 6
	OpWeaponSwap = 7
	OpJump       = 8

	OpGameState   = 10
	OpPlayerJoin  = 11
	OpPlayerLeft  = 12
	OpMatchStart  = 13
	OpMatchEnd    = 14
	OpTimeSync    = 15
	OpFreeze      = 16
	OpScoreboard  = 17
	OpPlayerReady = 18
	OpFallDeath   = 19

	OpRoulette     = 20
	OpRouletteSync = 21

	RouletteCooldown = 15000 // кулдаун рулетки 15 сек
	RouletteCost     = 5     // стоимость рулетки в монетах
)
