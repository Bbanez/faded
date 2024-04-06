mod controllers;
mod security;

use std::sync::Mutex;

use actix_web::{App, HttpServer, web};
use tauri::{AppHandle};

pub struct ServerData {

}

pub struct ActixTauriAppState {
    app: Mutex<AppHandle>,
}

#[actix_web::main]
pub async fn init(app: AppHandle) -> std::io::Result<()> {
    let tauri_app = web::Data::new(ActixTauriAppState {
        app: Mutex::new(app),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(tauri_app.clone())
            .service(controllers::player::player_controller())
    })
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}