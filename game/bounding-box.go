package game

type BoundingBoxCorners struct {
	Top    float64 `json:"top"`
	Right  float64 `json:"right"`
	Bottom float64 `json:"bottom"`
	Left   float64 `json:"left"`
}

func NewBoundingBoxCorners(top float64, right float64, bottom float64, left float64) BoundingBoxCorners {
	return BoundingBoxCorners{top, right, bottom, left}
}

type BoundingBox struct {
	Position Point              `json:"position"`
	Size     Size               `json:"size"`
	Corners  BoundingBoxCorners `json:"corners"`
}

func NewBoundingBox(size Size, position Point) BoundingBox {
	bb := BoundingBox{
		Size:     size,
		Position: position,
		Corners:  NewBoundingBoxCorners(0.0, 0.0, 0.0, 0.0),
	}
	return bb
}

func (bb *BoundingBox) Update() {
	bb.Corners.Top = bb.Position.Y - bb.Size.Height/2.0
	bb.Corners.Right = bb.Position.X + bb.Size.Width/2.0
	bb.Corners.Bottom = bb.Position.Y + bb.Size.Height/2.0
	bb.Corners.Left = bb.Position.X - bb.Size.Width/2.0
}

func (bb *BoundingBox) SetSize(width float64, height float64) {
	bb.Size.Width = width
	bb.Size.Height = height
	bb.Update()
}

func (bb *BoundingBox) SetPosition(position Point) {
	bb.Position = position
	bb.Update()
}

func (bb *BoundingBox) IsPointInside(point Point) bool {
	return CollisionWithPoint(point, bb.Corners)
}
