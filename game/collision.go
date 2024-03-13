package game

func CollisionWithPoint(point Point, bb BoundingBoxCorners) bool {
	return point.X > bb.Left && point.X < bb.Right && point.Y > bb.Top && point.Y < bb.Bottom
}

func CollisionWithBoundingBox(bb1 BoundingBoxCorners, bb2 BoundingBoxCorners) bool {
	return CollisionWithPoint(Point{bb1.Top, bb1.Left}, bb2) ||
		CollisionWithPoint(Point{bb1.Top, bb1.Right}, bb2) ||
		CollisionWithPoint(Point{bb1.Bottom, bb1.Right}, bb2) ||
		CollisionWithPoint(Point{bb1.Bottom, bb1.Left}, bb2)
}
