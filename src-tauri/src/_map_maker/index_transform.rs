pub fn mat_to_vec(x: usize, y: usize, col_count: usize) -> usize {
    x + y * col_count
}

pub fn vec_to_mat(idx: usize, col_count: usize) -> (usize, usize) {
    let x = idx % col_count;
    let y = (idx - x) / col_count;
    (x, y)
}