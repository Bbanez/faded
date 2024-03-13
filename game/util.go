package game

type Point struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

func NewPoint(x float64, y float64) Point {
	return Point{
		X: x,
		Y: y,
	}
}

type UPoint struct {
	X uint `json:"x"`
	Y uint `json:"y"`
}

func NewUPoint(x uint, y uint) UPoint {
	return UPoint{
		X: x,
		Y: y,
	}
}

type Size struct {
	Width  float64 `json:"width"`
	Height float64 `json:"height"`
}

func NewSize(width float64, height float64) Size {
	return Size{width, height}
}

type USize struct {
	Width  uint `json:"width"`
	Height uint `json:"height"`
}

func NewUSize(width uint, height uint) USize {
	return USize{width, height}
}
