use crate::util::{
    math::{UPoint, USize},
    tauri_api_response::TauriResponse,
};
use crate::util::math::Point;
use super::main::a_star;

#[tauri::command]
pub fn path_finder_a_star(
    start: Point,
    end: Point,
    map_size: USize,
    nav_mesh: Vec<u8>,
) -> TauriResponse<Vec<UPoint>> {
    let start_norm = start.to_u_point();
    let end_norm = end.to_u_point();
    let result = a_star(&start_norm, &end_norm, &nav_mesh, &map_size);
    match result.0 {
        Some(path) => {
            TauriResponse::new(path)
        }
        None => TauriResponse::new_error(404, "No path found"),
    }
}
