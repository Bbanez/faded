package game

import (
	math2 "math"
)

type MathFnLinear2D struct {
	Points []Point   `json:"points"`
	K      []float64 `json:"k"`
	N      []float64 `json:"n"`
}

func NewMathFnLinear2D(points []Point) MathFnLinear2D {
	var k []float64
	var n []float64
	for i := 1; i < len(points); i++ {
		k = append(k, (points[i].Y-points[i-1].Y)/(points[i].X-points[i-1].X))
		n = append(n, points[i-1].Y-k[i-1]*points[i-1].X)
	}
	return MathFnLinear2D{
		Points: points,
		K:      k,
		N:      n,
	}
}

func (math *MathFnLinear2D) Calc(x float64) float64 {
	bestSectionIdx := 0
	l := len(math.Points) - 1
	if x >= math.Points[l].X {
		bestSectionIdx = l
	} else {
		for i := 0; i < l; i++ {
			if x >= math.Points[i].X && x < math.Points[i+1].X {
				bestSectionIdx = i
				break
			}
		}
	}
	return math.K[bestSectionIdx]*x + math.N[bestSectionIdx]
}

func (math *MathFnLinear2D) Inverse(y float64) float64 {
	bestSectionIdx := 0
	l := len(math.Points) - 1
	if y >= math.Points[l].Y {
		bestSectionIdx = l
	} else {
		for i := 0; i < l; i++ {
			if y >= math.Points[i].Y && y < math.Points[i+1].Y {
				bestSectionIdx = i
				break
			}
		}
	}
	return (y - math.N[bestSectionIdx]) / math.K[bestSectionIdx]
}

func MathDistanceBetweenPoint(start Point, end Point) float64 {
	x := math2.Abs(end.X - start.X)
	y := math2.Abs(end.Y - start.Y)
	return math2.Sqrt(x*x + y*y)
}

func MathArePointsNear(point1 Point, point2 Point, delta Point) bool {
	return point1.X > point2.X-delta.X && point1.X < point2.X+delta.X && point1.Y > point2.Y-delta.Y && point1.Y < point2.Y+delta.Y
}

func MathGetAngle(position Point, target Point) float64 {
	dx := target.X - position.X
	dz := target.Y - position.Y
	var angle = 0.0
	if dx == 0.0 {
		angle = PI12
		if dz < 0.0 {
			angle = PI32
		}
	} else if dz == 0.0 {
		if dx < 0.0 {
			angle = PI
		}
	} else {
		angle = math2.Atan(dz / dx)
		if dx < 0.0 && dz > 0.0 {
			angle = PI + angle
		} else if dx < 0.0 && dz < 0.0 {
			angle = PI + angle
		} else if dx > 0.0 && dz < 0.0 {
			angle = 2.0*PI + angle
		}
	}
	return angle
}

func MathRadToDeg(rad float64) float64 {
	return 180.0 * rad / PI
}

func MathDegToRad(deg float64) float64 {
	return PI * deg / 180.0
}
