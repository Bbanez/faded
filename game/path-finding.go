package game

import "fmt"

func lowestF(nodes *[]MapNode, mapInfo *MapInfo) (MapNode, uint, uint) {
	var lowestIdx uint = 0
	var lowestFValue uint = 1000000000
	for i := 0; i < len(*nodes); i++ {
		node := (*nodes)[i]
		if node.F() < lowestFValue {
			lowestFValue = node.F()
			lowestIdx = uint(i)
		} else if node.F() == lowestFValue && node.G < (*nodes)[lowestIdx].G {
			lowestIdx = uint(i)
		}
	}
	return (*nodes)[lowestIdx], (*nodes)[lowestIdx].VPosition.X + mapInfo.VSize.Width*(*nodes)[lowestIdx].VPosition.Y, lowestIdx
}

func isNodeInSet(node *MapNode, nodes *[]MapNode) int {
	for i, inNode := range *nodes {
		if node.VPosition.X == inNode.VPosition.X && node.VPosition.Y == inNode.VPosition.Y {
			return i
		}
	}
	return -1
}

func getNeighborNodes(start *MapNode, end *MapNode, neighborIdx MapVNodeNeighborIdx, nodes *[]MapNode) []MapNode {
	var outOfRangeValue uint = 1000000000
	var res []MapNode
	if neighborIdx.TopLeft < outOfRangeValue {
		node := (*nodes)[neighborIdx.TopLeft]
		if node.Walkable {
			node.SetParams(start.VPosition, end.VPosition)
			res = append(res, node)
		}
	}
	if neighborIdx.TopMiddle < outOfRangeValue {
		node := (*nodes)[neighborIdx.TopMiddle]
		if node.Walkable {
			node.SetParams(start.VPosition, end.VPosition)
			res = append(res, node)
		}
	}
	if neighborIdx.TopRight < outOfRangeValue {
		node := (*nodes)[neighborIdx.TopRight]
		if node.Walkable {
			node.SetParams(start.VPosition, end.VPosition)
			res = append(res, node)
		}
	}
	if neighborIdx.MiddleRight < outOfRangeValue {
		node := (*nodes)[neighborIdx.MiddleRight]
		if node.Walkable {
			node.SetParams(start.VPosition, end.VPosition)
			res = append(res, node)
		}
	}
	if neighborIdx.BottomRight < outOfRangeValue {
		node := (*nodes)[neighborIdx.BottomRight]
		if node.Walkable {
			node.SetParams(start.VPosition, end.VPosition)
			res = append(res, node)
		}
	}
	if neighborIdx.BottomMiddle < outOfRangeValue {
		node := (*nodes)[neighborIdx.BottomMiddle]
		if node.Walkable {
			node.SetParams(start.VPosition, end.VPosition)
			res = append(res, node)
		}
	}
	if neighborIdx.BottomLeft < outOfRangeValue {
		node := (*nodes)[neighborIdx.BottomLeft]
		if node.Walkable {
			node.SetParams(start.VPosition, end.VPosition)
			res = append(res, node)
		}
	}
	if neighborIdx.MiddleLeft < outOfRangeValue {
		node := (*nodes)[neighborIdx.MiddleLeft]
		if node.Walkable {
			node.SetParams(start.VPosition, end.VPosition)
			res = append(res, node)
		}
	}
	return res
}

func getNodeAtVPosition(vPosition UPoint, nodes *[]MapNode) *MapNode {
	for i := 0; i < len(*nodes); i++ {
		node := (*nodes)[i]
		if vPosition.X == node.VPosition.X && vPosition.Y == node.VPosition.Y {
			return &node
		}
	}
	return nil
}

func resolvePath(startNode *MapNode, endNode *MapNode, mapInfo *MapInfo, closedSet *[]MapNode) *[]Point {
	buffer := []Point{startNode.RPosition}
	currentNode := startNode
	doLoop := true
	for doLoop {
		if currentNode.VPosition.X == endNode.VPosition.X && currentNode.VPosition.Y == endNode.VPosition.Y {
			doLoop = false
		} else {
			if currentNode.ParentIdx == nil {
				doLoop = false
			} else {
				parentIdx := *currentNode.ParentIdx
				node := mapInfo.Nodes[parentIdx]
				buffer = append(buffer, node.RPosition)
				currentNode = &node
			}
		}
	}
	var output []Point
	for i := len(buffer) - 1; i > 0; i-- {
		output = append(output, buffer[i])
	}
	return &output
}

func AStar(rStart Point, rEnd Point, mapInfo *MapInfo) (*[]Point, bool) {
	startNode, _ := mapInfo.GetValidNode(rStart)
	if startNode == nil {
		fmt.Printf("PF: failed to find start node for %+v", rStart)
	} else {
		endNode, includeEndNode := mapInfo.GetValidNode(rEnd)
		if endNode == nil {
			fmt.Printf("PF: failed to find end node for %+v", rStart)
		} else {
			if startNode.VPosition.X == endNode.VPosition.X && startNode.VPosition.Y == endNode.VPosition.Y {
				return &[]Point{}, true
			}
			openSet := []MapNode{*startNode}
			var closedSet []MapNode
			loops := 0
			for len(openSet) > 0 {
				loops++
				currentNode, nodeIdx, inSetNodeIdx := lowestF(&openSet, mapInfo)
				openSet[inSetNodeIdx] = openSet[len(openSet)-1]
				openSet = openSet[:len(openSet)-1]
				closedSet = append(closedSet, currentNode)
				if currentNode.VPosition.X == endNode.VPosition.X && currentNode.VPosition.Y == endNode.VPosition.Y {
					return resolvePath(&currentNode, startNode, mapInfo, &closedSet), includeEndNode
				}
				neighborNodes := getNeighborNodes(startNode, endNode, currentNode.NeighborIdx, &mapInfo.Nodes)
				for i := 0; i < len(neighborNodes); i++ {
					neighborNodes[i].ParentIdx = &nodeIdx
					if isNodeInSet(&neighborNodes[i], &closedSet) != -1 {
						continue
					}
					newMoveCost := currentNode.G + MapInfoDistanceBetweenPoints(currentNode.VPosition, neighborNodes[i].VPosition)
					neighborNodeInOpenSetId := isNodeInSet(&neighborNodes[i], &openSet)
					if neighborNodeInOpenSetId == -1 {
						neighborNodes[i].G = newMoveCost
						neighborNodes[i].H = MapInfoDistanceBetweenPoints(neighborNodes[i].VPosition, endNode.VPosition)
						openSet = append(openSet, neighborNodes[i])
					} else if newMoveCost < openSet[neighborNodeInOpenSetId].G {
						openSet[neighborNodeInOpenSetId].G = newMoveCost
						openSet[neighborNodeInOpenSetId].H = MapInfoDistanceBetweenPoints(neighborNodes[i].VPosition, endNode.VPosition)
						openSet[neighborNodeInOpenSetId].ParentIdx = &nodeIdx
					}
				}
			}
			fmt.Printf("PF: failed to find path from %+v to %+v", rStart, rEnd)
		}
	}
	return nil, false
}
