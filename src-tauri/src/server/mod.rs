use std::sync::Mutex;

use actix_web::{App, get, HttpResponse, HttpServer, middleware, Responder, web};
use tauri::{AppHandle, Manager};

use crate::GameState;

struct TauriAppState {
    app: Mutex<AppHandle>,
}

#[get("/hello")]
async fn h(data: web::Data<TauriAppState>) -> impl Responder {
    let data_locked = data.app.lock().unwrap();
    let game_state = data_locked.state::<GameState>();
    let state_guard = game_state.0.lock().unwrap();
    let position = state_guard.player.clone().unwrap().bounding_box.get_position();
    HttpResponse::Ok().body(format!("Hello world! {:?}", position))
}

#[actix_web::main]
pub async fn init(app: AppHandle) -> std::io::Result<()> {
    let tauri_app = web::Data::new(TauriAppState {
        app: Mutex::new(app),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(tauri_app.clone())
            .wrap(middleware::Logger::default())
            .service(h)
    })
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}