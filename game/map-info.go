package game

import (
	"fmt"
	"math"
)

type MapVNodeNeighborIdx struct {
	TopLeft      uint `json:"topLeft"`
	TopMiddle    uint `json:"topMiddle"`
	TopRight     uint `json:"topRight"`
	MiddleRight  uint `json:"middleRight"`
	BottomRight  uint `json:"bottomRight"`
	BottomMiddle uint `json:"bottomMiddle"`
	BottomLeft   uint `json:"bottomLeft"`
	MiddleLeft   uint `json:"middleLeft"`
}

type MapNode struct {
	G           uint                `json:"g"`
	H           uint                `json:"h"`
	VPosition   UPoint              `json:"position"`
	RPosition   Point               `json:"mapPosition"`
	ParentIdx   *uint               `json:"partnerIdx"`
	NeighborIdx MapVNodeNeighborIdx `json:"neighborIdx"`
	Walkable    bool                `json:"walkable"`
}

func (node *MapNode) F() uint {
	return node.G + node.H
}

func (node *MapNode) SetParams(start UPoint, end UPoint) {
	node.G = MapInfoDistanceBetweenPoints(start, node.VPosition)
	node.H = MapInfoDistanceBetweenPoints(node.VPosition, end)
}

type MapRVTransform struct {
	X MathFnLinear2D `json:"x"`
	Y MathFnLinear2D `json:"y"`
}

type MapInfo struct {
	Nodes       []MapNode      `json:"nodes"`       // Virtual node of size 1x1
	VSize       USize          `json:"size"`        // Virtual map size, can be filled with whole number of VNodes
	RSize       Size           `json:"mapSize"`     // Real map size, as it appears in the game
	RNodeSize   Size           `json:"mapNodeSize"` // Size of the VNode on the real map
	RVTransform MapRVTransform `json:"rvTransform"` // Transform function to get from V space to R space and vice versa
}

func NewMapInfo(pixels []uint8, vSize USize, rSize Size) MapInfo {
	var nodes []MapNode
	rvTransform := MapRVTransform{
		X: NewMathFnLinear2D([]Point{
			{
				X: 0.0,
				Y: 0.0,
			},
			{
				X: rSize.Width,
				Y: float64(vSize.Width),
			},
		}),
		Y: NewMathFnLinear2D([]Point{
			{
				X: 0.0,
				Y: 0.0,
			},
			{
				X: rSize.Height,
				Y: float64(vSize.Height),
			},
		}),
	}
	var x uint = 0
	var y uint = 0
	rNodeSize := Size{
		Width:  rvTransform.X.Inverse(1.0),
		Height: rvTransform.Y.Inverse(1.0),
	}
	for i := 0; i < len(pixels); i++ {
		node := MapNode{
			G:         0,
			H:         0,
			VPosition: NewUPoint(x, y),
			RPosition: Point{
				X: rvTransform.X.Inverse(float64(x)) + rNodeSize.Width/2.0,
				Y: rvTransform.Y.Inverse(float64(y)) + rNodeSize.Height/2.0,
			},
			ParentIdx: nil,
			NeighborIdx: MapVNodeNeighborIdx{
				1000000000,
				1000000000,
				1000000000,
				1000000000,
				1000000000,
				1000000000,
				1000000000,
				1000000000,
			},
			Walkable: false,
		}
		if pixels[i] < 200 {
			node.Walkable = true
		}
		if x > 0 && y > 0 {
			node.NeighborIdx.TopLeft = (x - 1) + (vSize.Width * (y - 1))
		}
		if y > 0 {
			node.NeighborIdx.TopMiddle = x + (vSize.Width * (y - 1))
		}
		if x < vSize.Width-1 && y > 0 {
			node.NeighborIdx.TopRight = (x + 1) + (vSize.Width * (y - 1))
		}
		if x < vSize.Width-1 {
			node.NeighborIdx.MiddleRight = (x + 1) + (vSize.Width * y)
		}
		if x < vSize.Width-1 && y < vSize.Height-1 {
			node.NeighborIdx.BottomRight = (x + 1) + (vSize.Width * (y + 1))
		}
		if y < vSize.Height-1 {
			node.NeighborIdx.BottomMiddle = x + (vSize.Width * (y + 1))
		}
		if x > 0 && y < vSize.Height-1 {
			node.NeighborIdx.BottomLeft = (x - 1) + (vSize.Width * (y + 1))
		}
		if x > 0 {
			node.NeighborIdx.MiddleLeft = (x - 1) + (vSize.Width * y)
		}
		nodes = append(nodes, node)
		x++
		if x == vSize.Width {
			x = 0
			y++
			if y == vSize.Height {
				break
			}
		}
	}
	return MapInfo{
		nodes,
		vSize,
		rSize,
		rNodeSize,
		rvTransform,
	}
}

func (info *MapInfo) GetValidNode(rPosition Point) (*MapNode, bool) {
	x := uint(info.RVTransform.X.Calc(rPosition.X))
	y := uint(info.RVTransform.Y.Calc(rPosition.Y))
	nodeIdx := x + info.VSize.Width*y
	if nodeIdx < uint(len(info.Nodes)) {
		if info.Nodes[nodeIdx].Walkable {
			return &info.Nodes[nodeIdx], true
		} else {
			doLoop := true
			offset := []int{-1, 1}
			for doLoop {
				foundValidNode := false
				for xOffs := offset[0]; xOffs < offset[1]; xOffs++ {
					for yOffs := offset[0]; yOffs < offset[1]; yOffs++ {
						x = info.Nodes[nodeIdx].VPosition.X + uint(xOffs)
						y = info.Nodes[nodeIdx].VPosition.Y + uint(yOffs)
						nodeIdx = x + info.VSize.Width*y
						if nodeIdx < uint(len(info.Nodes)) {
							foundValidNode = true
							if info.Nodes[nodeIdx].Walkable == true {
								return &info.Nodes[nodeIdx], false
							}
						}
					}
				}
				if foundValidNode == false {
					doLoop = false
				}
				offset[0] -= 1
				offset[1] += 1
			}
		}
	}
	return nil, false
}

func (info *MapInfo) GetNodeAtVPosition(vPosition UPoint) *MapNode {
	for i := 0; i < len(info.Nodes); i++ {
		if info.Nodes[i].VPosition.X == vPosition.X && info.Nodes[i].VPosition.Y == vPosition.Y {
			return &info.Nodes[i]
		}
	}
	return nil
}

func MapInfoDistanceBetweenPoints(start UPoint, end UPoint) uint {
	x := uint(math.Abs(float64(end.X - start.X)))
	y := uint(math.Abs(float64(end.Y - start.Y)))
	if x > y {
		return 14*y + 10*(x-y)
	}
	return 14*x + 10*(y-x)
}

func (api *Api) MapInfoSet(pixels []uint8, mapSlug string) MapInfo {
	mapData := StateData.FindMap(mapSlug)
	if mapData == nil {
		panic(fmt.Sprintf("Map with slug %s does not exist", mapSlug))
	}
	StateData.MapInfo = NewMapInfo(pixels, USize{
		Width:  uint(mapData.Nogo.Width),
		Height: uint(mapData.Nogo.Height),
	}, Size{
		Width:  mapData.Width,
		Height: mapData.Height,
	})
	return StateData.MapInfo
}
