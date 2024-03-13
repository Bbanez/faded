package game

import (
	"fdd-wails/bcms"
	"fmt"
	"math"
)

type PlayerStatsDamage struct {
	Min float64
	Max float64
}

type PlayerStats struct {
	Str         float64           `json:"str"`
	Agi         float64           `json:"agi"`
	Int         float64           `json:"int"`
	MaxHp       float64           `json:"mapHp"`
	Hp          float64           `json:"hp"`
	MaxMana     float64           `json:"maxMana"`
	Mana        float64           `json:"mana"`
	MaxStamina  float64           `json:"MaxStamina"`
	Stamina     float64           `json:"stamina"`
	MoveSpeed   float64           `json:"moveSpeed"`
	AttackSpeed float64           `json:"attackSpeed"`
	Armor       float64           `json:"armor"`
	Range       float64           `json:"range"`
	Damage      PlayerStatsDamage `json:"damage"`
}

func NewPlayerStatsFromBaseStats(fdd bcms.FddBaseStatsGroup) PlayerStats {
	return PlayerStats{
		Str:         fdd.Str,
		Agi:         fdd.Agi,
		Int:         fdd.Int,
		MaxHp:       fdd.Hp,
		Hp:          fdd.Hp,
		MaxMana:     fdd.Mana,
		Mana:        fdd.Mana,
		MaxStamina:  fdd.Stamina,
		Stamina:     fdd.Stamina,
		MoveSpeed:   fdd.MoveSpeed,
		AttackSpeed: 1,
		Armor:       fdd.Armor,
		Range:       fdd.Range,
		Damage: PlayerStatsDamage{
			fdd.Damage - fdd.Damage/2.0,
			fdd.Damage,
		},
	}
}

type Player struct {
	Character       bcms.FddCharacterEntryMetaItem `json:"character"`
	Stats           PlayerStats                    `json:"stats"`
	Angle           float64                        `json:"angle"`
	Motion          Point                          `json:"motion"`
	BoundingBox     BoundingBox                    `json:"boundingBox"`
	WantedPositions *[]Point                       `json:"wantedPositions"`
	WantedPosition  *Point                         `json:"wantedPosition"`
}

func NewPlayer(character bcms.FddCharacterEntryMetaItem, position Point) Player {
	return Player{
		Character: character,
		Stats:     NewPlayerStatsFromBaseStats(character.BaseStats),
		Angle:     0.0,
		Motion: Point{
			X: 0.0,
			Y: 0.0,
		},
		BoundingBox: NewBoundingBox(Size{
			Width:  character.Bb.X,
			Height: character.Bb.Z,
		}, position),
		WantedPositions: nil,
	}
}

func (player *Player) popWantedPosition() Point {
	wantedPosition := (*player.WantedPositions)[0]
	player.WantedPosition = &wantedPosition
	*player.WantedPositions = (*player.WantedPositions)[1:]
	return wantedPosition
}

func (player *Player) calcPosition() {
	if player.Motion.X != 0.0 || player.Motion.Y != 0.0 {
		if player.Motion.X != 0.0 {
			player.Angle += 0.02 * player.Motion.X
		}
		if player.Motion.Y != 0.0 {
			player.BoundingBox.SetPosition(Point{
				X: player.BoundingBox.Position.X + player.Stats.MoveSpeed*player.Motion.X*math.Cos(player.Angle),
				Y: player.BoundingBox.Position.Y + player.Stats.MoveSpeed*player.Motion.Y*math.Sin(player.Angle),
			})
		}
	} else {
		if player.WantedPosition != nil {
			player.BoundingBox.SetPosition(Point{
				X: player.BoundingBox.Position.X + player.Stats.MoveSpeed*math.Cos(player.Angle),
				Y: player.BoundingBox.Position.Y + player.Stats.MoveSpeed*math.Sin(player.Angle),
			})
			if MathArePointsNear(player.BoundingBox.Position, *player.WantedPosition, Point{player.Stats.MoveSpeed, player.Stats.MoveSpeed}) {
				if player.WantedPositions != nil && len(*player.WantedPositions) > 0 {
					wantedPosition := player.popWantedPosition()
					player.Angle = MathGetAngle(player.BoundingBox.Position, wantedPosition)
					player.WantedPosition = &wantedPosition
				} else {
					player.WantedPosition = nil
				}
			}
		} else if player.WantedPositions != nil && len(*player.WantedPositions) > 0 {
			wantedPosition := player.popWantedPosition()
			player.Angle = MathGetAngle(player.BoundingBox.Position, wantedPosition)
			player.WantedPosition = &wantedPosition
		}
	}
}

func (player *Player) SetMotion(motion Point) {
	player.WantedPositions = nil
	player.WantedPosition = nil
	player.Motion = motion
}

func (player *Player) OnTick() {
	player.calcPosition()
}

// Api Endpoints

func (api *Api) PlayerLoad(characterSlug string, mapSlug string) Player {
	mapData := StateData.FindMap(mapSlug)
	if mapData == nil {
		panic(fmt.Sprintf("Map with slug %s does not exist", mapSlug))
	}
	char := StateData.FindCharacter(characterSlug)
	if char == nil {
		panic(fmt.Sprintf("Charater with slug %s does not exist", characterSlug))
	}
	player := NewPlayer(*char, Point{
		X: mapData.StartX,
		Y: mapData.StartZ,
	})
	StateData.Player = &player
	return player
}

func (api *Api) PlayerSetMotion(motion Point) {
	if StateData.Player != nil {
		StateData.Player.Motion = motion
	}
}

func (api *Api) PlayerGet() *Player {
	return StateData.Player
}

func (api *Api) PlayerSetWantedPath(wantedPosition Point) {
	path, isEndNodeValid := AStar(StateData.Player.BoundingBox.Position, wantedPosition, &StateData.MapInfo)
	if path != nil {
		if isEndNodeValid == true {
			*path = append(*path, wantedPosition)
		}
		StateData.Player.WantedPositions = path
		StateData.Player.WantedPosition = nil
	}
}
